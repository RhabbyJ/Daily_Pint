import Papa from "papaparse";

interface Env {
  MENU_CSV_URL: string;
}

type RawMenuRow = {
  category?: string;
  section_order?: string;
  item_order?: string;
  name?: string;
  description?: string;
  price?: string;
  tags?: string;
  available?: string;
};

type MenuItem = {
  name: string;
  description: string;
  price: string;
  tags: string[];
  itemOrder: number;
};

type MenuCategory = {
  name: string;
  sectionOrder: number;
  items: MenuItem[];
};

const REQUIRED_HEADERS = [
  "category",
  "section_order",
  "item_order",
  "name",
  "description",
  "price",
  "tags",
  "available",
];

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.MENU_CSV_URL) {
    return json({ error: "MENU_CSV_URL is not configured" }, 500);
  }

  let csv: string;

  try {
    const response = await fetch(env.MENU_CSV_URL, {
      cf: {
        cacheEverything: true,
        cacheTtl: 300,
      },
      headers: {
        "User-Agent": "bar-website-menu-fetcher",
      },
    });

    if (!response.ok) {
      return json({ error: "Menu source unavailable" }, 502);
    }

    csv = await response.text();
  } catch {
    return json({ error: "Could not fetch menu source" }, 502);
  }

  const parsed = Papa.parse<RawMenuRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    return json(
      {
        error: "Menu CSV could not be parsed",
        details: parsed.errors.map((error) => error.message),
      },
      500
    );
  }

  const headers = parsed.meta.fields ?? [];
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return json(
      {
        error: "Menu CSV is missing required headers",
        missingHeaders,
      },
      500
    );
  }

  const categories = new Map<string, MenuCategory>();
  let validRows = 0;
  let skippedRows = 0;

  for (const row of parsed.data) {
    const available = clean(row.available).toUpperCase() === "TRUE";

    if (!available) {
      skippedRows += 1;
      continue;
    }

    const categoryName = clean(row.category, 80);
    const name = clean(row.name, 120);
    const description = clean(row.description, 300);
    const price = clean(row.price, 40);
    const tags = splitTags(row.tags);
    const sectionOrder = toNumber(row.section_order, 9999);
    const itemOrder = toNumber(row.item_order, 9999);

    if (!categoryName || !name || !price) {
      skippedRows += 1;
      continue;
    }

    if (!categories.has(categoryName)) {
      categories.set(categoryName, {
        name: categoryName,
        sectionOrder,
        items: [],
      });
    }

    const category = categories.get(categoryName)!;
    category.sectionOrder = Math.min(category.sectionOrder, sectionOrder);
    category.items.push({
      name,
      description,
      price,
      tags,
      itemOrder,
    });
    validRows += 1;
  }

  const normalizedCategories = Array.from(categories.values())
    .map((category) => ({
      ...category,
      items: category.items
        .sort((a, b) => a.itemOrder - b.itemOrder || a.name.localeCompare(b.name))
        .map(({ itemOrder, ...item }) => item),
    }))
    .sort((a, b) => a.sectionOrder - b.sectionOrder || a.name.localeCompare(b.name));

  return json(
    {
      updatedAt: new Date().toISOString(),
      categories: normalizedCategories,
      meta: {
        validRows,
        skippedRows,
      },
    },
    200,
    {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    }
  );
};

function clean(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function splitTags(value: unknown): string[] {
  return clean(value, 200)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

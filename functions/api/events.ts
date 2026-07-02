interface Env {
  GOOGLE_CALENDAR_ICAL_URL?: string;
  PUBLIC_GOOGLE_CALENDAR_EMBED_URL?: string;
}

type IcsProperty = {
  name: string;
  params: Record<string, string>;
  value: string;
};

type ParsedDate = {
  allDay: boolean;
  date: Date;
  dateValue: string;
  timeZone: string;
};

type EventInstance = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  timeZone: string;
};

const DEFAULT_TIME_ZONE = "America/Los_Angeles";
const MAX_EVENTS = 12;
const ABSOLUTE_MAX_EVENTS = 80;
const LOOKAHEAD_DAYS = 180;

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const calendarUrl =
    clean(env.GOOGLE_CALENDAR_ICAL_URL, 500) ||
    toPublicIcalUrl(clean(env.PUBLIC_GOOGLE_CALENDAR_EMBED_URL, 500));
  const eventLimit = getEventLimit(request);

  if (!calendarUrl) {
    return json({ error: "Events calendar is not configured" }, 500);
  }

  let ics: string;

  try {
    const response = await fetch(calendarUrl, {
      cf: {
        cacheEverything: true,
        cacheTtl: 300,
      },
      headers: {
        "User-Agent": "bar-website-events-fetcher",
      },
    });

    if (!response.ok) {
      return json({ error: "Events calendar source unavailable" }, 502);
    }

    ics = await response.text();
  } catch {
    return json({ error: "Could not fetch events calendar source" }, 502);
  }

  const today = startOfUtcDay(new Date());
  const cutoff = new Date(today.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
  const blocks = getEventBlocks(ics);
  const events: EventInstance[] = [];
  let skippedEvents = 0;

  for (const block of blocks) {
    const event = normalizeEvent(block);

    if (!event) {
      skippedEvents += 1;
      continue;
    }

    const eventStart = event.allDay ? parseAllDaySortDate(event.start) : new Date(event.start);
    const eventEnd = event.allDay ? parseAllDaySortDate(event.end) : new Date(event.end);

    if (!isFiniteDate(eventStart) || !isFiniteDate(eventEnd) || eventEnd < today || eventStart > cutoff) {
      skippedEvents += 1;
      continue;
    }

    events.push(event);
  }

  events.sort((a, b) => {
    const aDate = a.allDay ? parseAllDaySortDate(a.start) : new Date(a.start);
    const bDate = b.allDay ? parseAllDaySortDate(b.start) : new Date(b.start);
    return aDate.getTime() - bDate.getTime() || a.title.localeCompare(b.title);
  });

  return json(
    {
      updatedAt: new Date().toISOString(),
      events: events.slice(0, eventLimit),
      meta: {
        validEvents: events.length,
        skippedEvents,
      },
    },
    200,
    {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    }
  );
};

function getEventLimit(request: Request): number {
  const url = new URL(request.url);
  const parsed = Number(url.searchParams.get("limit"));

  if (!Number.isFinite(parsed)) {
    return MAX_EVENTS;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), ABSOLUTE_MAX_EVENTS);
}

function normalizeEvent(lines: string[]): EventInstance | null {
  const properties = lines.map(parseProperty).filter((property): property is IcsProperty => Boolean(property));
  const start = getProperty(properties, "DTSTART");

  if (!start) {
    return null;
  }

  const parsedStart = parseIcsDate(start);

  if (!parsedStart) {
    return null;
  }

  const parsedEnd = parseIcsDate(getProperty(properties, "DTEND"));
  const fallbackEnd = addDefaultDuration(parsedStart);
  const end = parsedEnd ?? fallbackEnd;
  const uid = clean(unescapeIcsText(getProperty(properties, "UID")?.value), 160);
  const title = clean(unescapeIcsText(getProperty(properties, "SUMMARY")?.value), 120);

  if (!title) {
    return null;
  }

  return {
    id: uid || `${title}-${parsedStart.dateValue}`,
    title,
    description: clean(unescapeIcsText(getProperty(properties, "DESCRIPTION")?.value), 500),
    location: clean(unescapeIcsText(getProperty(properties, "LOCATION")?.value), 160),
    start: parsedStart.dateValue,
    end: end.dateValue,
    allDay: parsedStart.allDay,
    timeZone: parsedStart.timeZone,
  };
}

function getEventBlocks(ics: string): string[][] {
  const blocks: string[][] = [];
  const current: string[] = [];
  let inEvent = false;

  for (const line of unfoldIcsLines(ics)) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current.length = 0;
      continue;
    }

    if (line === "END:VEVENT") {
      if (inEvent && current.length > 0) {
        blocks.push([...current]);
      }

      inEvent = false;
      continue;
    }

    if (inEvent) {
      current.push(line);
    }
  }

  return blocks;
}

function unfoldIcsLines(ics: string): string[] {
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const unfolded: string[] = [];

  for (const line of lines) {
    if (/^[ \t]/.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line.trimEnd());
    }
  }

  return unfolded;
}

function parseProperty(line: string): IcsProperty | null {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  const left = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);
  const [name = "", ...paramParts] = left.split(";");
  const params: Record<string, string> = {};

  for (const paramPart of paramParts) {
    const [key, ...valueParts] = paramPart.split("=");

    if (key && valueParts.length > 0) {
      params[key.toUpperCase()] = valueParts.join("=");
    }
  }

  return {
    name: name.toUpperCase(),
    params,
    value,
  };
}

function getProperty(properties: IcsProperty[], name: string): IcsProperty | undefined {
  return properties.find((property) => property.name === name);
}

function parseIcsDate(property: IcsProperty | undefined): ParsedDate | null {
  if (!property) {
    return null;
  }

  const value = property.value.trim();
  const isAllDay = property.params.VALUE?.toUpperCase() === "DATE" || /^\d{8}$/.test(value);

  if (isAllDay) {
    const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value);

    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const dateValue = `${year}-${month}-${day}`;

    return {
      allDay: true,
      date: parseAllDaySortDate(dateValue),
      dateValue,
      timeZone: "UTC",
    };
  }

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, utcMarker] = match;
  const timeZone = clean(property.params.TZID, 80) || DEFAULT_TIME_ZONE;
  const date =
    utcMarker === "Z"
      ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
      : zonedTimeToUtc(
          Number(year),
          Number(month),
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
          timeZone
        );

  if (!isFiniteDate(date)) {
    return null;
  }

  return {
    allDay: false,
    date,
    dateValue: date.toISOString(),
    timeZone,
  };
}

function addDefaultDuration(start: ParsedDate): ParsedDate {
  const durationMs = start.allDay ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
  const date = new Date(start.date.getTime() + durationMs);

  return {
    allDay: start.allDay,
    date,
    dateValue: start.allDay ? date.toISOString().slice(0, 10) : date.toISOString(),
    timeZone: start.timeZone,
  };
}

function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const firstOffset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstResult = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(firstResult, timeZone);

  return new Date(utcGuess.getTime() - secondOffset);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const hour = values.get("hour") === "24" ? "00" : values.get("hour") ?? "00";
  const asUtc = Date.UTC(
    Number(values.get("year")),
    Number(values.get("month")) - 1,
    Number(values.get("day")),
    Number(hour),
    Number(values.get("minute")),
    Number(values.get("second"))
  );

  return asUtc - date.getTime();
}

function toPublicIcalUrl(embedUrl: string): string {
  if (!embedUrl) {
    return "";
  }

  try {
    const url = new URL(embedUrl);
    const calendarId = url.searchParams.get("src");

    if (!calendarId) {
      return "";
    }

    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
  } catch {
    return "";
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseAllDaySortDate(value: string): Date {
  const [year = "0", month = "1", day = "1"] = value.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function isFiniteDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function unescapeIcsText(value: unknown): string {
  return String(value ?? "")
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function clean(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
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

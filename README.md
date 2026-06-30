# The Daily Pint

Astro static site for a bar MVP deployed on Cloudflare Pages. The public menu is read from a published Google Sheets CSV through a Cloudflare Pages Function, events are shown from Google Calendar, and reservation requests are embedded with Tally.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

For this project, `npm run dev` starts Cloudflare Pages local dev so `/api/menu` works.
Open `http://127.0.0.1:8788`.

For a production-style build:

```bash
npm run build
```

To test the menu API locally with Cloudflare Pages Functions:

```bash
npm run pages:dev
```

Plain Astro dev is still available for static-only page work:

```bash
npm run astro:dev
```

Cloudflare Pages build settings:

```text
Build command: npm run build
Build output directory: dist
```

## Required Environment Variables

```text
MENU_CSV_URL
PUBLIC_SITE_NAME
PUBLIC_SITE_DESCRIPTION
PUBLIC_TALLY_FORM_ID
PUBLIC_GOOGLE_CALENDAR_EMBED_URL
PUBLIC_GOOGLE_MAPS_EMBED_URL
PUBLIC_BAR_PHONE
PUBLIC_BAR_ADDRESS
PUBLIC_BAR_INSTAGRAM_URL
```

`MENU_CSV_URL` is server-side only. Do not put private sheets, API keys, passwords, Tally admin links, or reservation response sheets in public environment variables.

## Google Sheets Menu

Create a Google Sheets tab named `Website Menu` and publish only that tab as CSV. Row 1 must use these exact headers:

```csv
category,section_order,item_order,name,description,price,tags,available
```

Only rows with `available` set to `TRUE` are returned by `/api/menu`. Rows missing `category`, `name`, or `price` are skipped.

You can import `menu-template.csv` into Google Sheets as a starting point.

## Reservations

Create a Tally form named `Request a Reservation`, publish it, and put its form ID in `PUBLIC_TALLY_FORM_ID`. The site intentionally says “Request a Reservation” because requests are staff-confirmed.

Reservation submissions are stored in Tally, not in this website backend.

## Events

Create a public Google Calendar for customer-facing events, copy its embed URL, and set it as `PUBLIC_GOOGLE_CALENDAR_EMBED_URL`. The `/events` page embeds that calendar so owner edits appear without code changes.

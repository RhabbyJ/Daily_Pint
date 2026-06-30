# Implementation Status

This repo contains the local v1 website implementation. The remaining work needs owner access to Google Sheets, Tally, Cloudflare Pages, and GoDaddy.

## Built Locally

- Astro static site for the public website.
- Cloudflare Pages Function at `/api/menu`.
- Menu loading from a published Google Sheets CSV.
- Menu validation, normalization, sorting, availability filtering, and string length limits.
- Client-side menu rendering with text-only sheet values.
- Reservation request page using a Tally embed.
- Contact page driven by public environment variables.
- Cloudflare Pages build configuration.

## Owner Setup Required

### Google Sheets

- Create a Google Sheet tab named exactly `Website Menu`.
- Use these exact headers: `category`, `section_order`, `item_order`, `name`, `description`, `price`, `tags`, `available`.
- Add only customer-facing menu data.
- Publish only the `Website Menu` tab as CSV.
- Set the published CSV URL as `MENU_CSV_URL` in Cloudflare Pages.
- Do not publish customer data, costs, margins, staff notes, private links, passwords, or reservation data.

### Tally

- Create a published form named `Request a Reservation`.
- Include required fields for name, phone, email, requested date, requested time, party size, and confirmation checkbox.
- The checkbox must say the reservation is only a request and is not confirmed until staff contacts the customer.
- Configure owner or staff email notifications.
- Set the public form ID as `PUBLIC_TALLY_FORM_ID` in Cloudflare Pages.
- Keep reservation submissions in Tally for v1.

### Cloudflare Pages

- Build command: `npm run build`.
- Build output directory: `dist`.
- Configure `MENU_CSV_URL`, `PUBLIC_SITE_NAME`, `PUBLIC_SITE_DESCRIPTION`, `PUBLIC_TALLY_FORM_ID`, `PUBLIC_GOOGLE_MAPS_EMBED_URL`, `PUBLIC_BAR_PHONE`, `PUBLIC_BAR_ADDRESS`, and `PUBLIC_BAR_INSTAGRAM_URL`.

### GoDaddy Domain

- Record current DNS settings before changes.
- Confirm whether the domain uses email.
- Do not remove MX or TXT email records.
- Point `www` to the Cloudflare Pages custom domain.
- Redirect the root domain to `www`, or move DNS to Cloudflare only if the owner approves.

## V1 Boundaries

- No custom database.
- No custom admin dashboard.
- No staff login or customer accounts.
- No instant reservation confirmation.
- No payments, deposits, POS integration, SMS reminders, or table inventory.
- Menu data is public once published as CSV.
- Reservation data stays outside the website backend.

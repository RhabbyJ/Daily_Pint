# Bar Website MVP Implementation Brief

## Purpose

Build a public website for The Daily Pint that gives customers current business information, displays a menu controlled by the owner, and collects reservation requests without adding a custom backend, database, payment flow, or staff admin system.

The reservation call to action must say **Request a Reservation** because requests are staff-confirmed, not instantly guaranteed.

## V1 Stack

- Hosting: Cloudflare Pages.
- Frontend: Astro static site.
- Menu source: public Google Sheets CSV from a dedicated customer-facing tab.
- Menu API: Cloudflare Pages Function at `/api/menu`.
- Reservations: embedded Tally form.
- Domain: existing GoDaddy domain pointed to Cloudflare Pages.
- Database: none for v1.
- Payments: none for v1.
- Admin panel: none for v1.

## Required Business Capabilities

- Customers can view the website, menu, reservation request page, and contact information.
- The owner can update menu categories, items, descriptions, prices, tags, ordering, and availability from Google Sheets.
- Unavailable menu rows are hidden from the public site.
- Customers can submit reservation requests from the website.
- Owner or staff are notified about reservation requests through Tally.
- Reservation submissions are stored in Tally, not in the website backend.
- The existing GoDaddy domain resolves to the deployed Cloudflare Pages site.

## Explicitly Out Of Scope For V1

- Custom database.
- Custom admin dashboard.
- User accounts or staff login.
- Instant reservation confirmation.
- Table inventory or capacity management.
- Deposit or payment collection.
- POS integration.
- SMS reminders.
- Multi-location support.

## Architecture Summary

- Cloudflare Pages serves the Astro static site.
- The menu page requests `/api/menu`.
- `/api/menu` reads the Google Sheets published CSV URL from `MENU_CSV_URL`.
- The Pages Function validates the CSV headers, normalizes safe text values, filters unavailable or invalid rows, sorts categories and items, and returns grouped JSON.
- The reservations page embeds a Tally form.
- Tally stores reservation submissions and emails owner or staff.
- Private customer data must not pass through the website backend in v1.

## Environment Configuration

Cloudflare Pages needs these variables:

- `MENU_CSV_URL`: server-side published CSV URL for the public menu tab.
- `PUBLIC_SITE_NAME`: public bar name.
- `PUBLIC_SITE_DESCRIPTION`: public short description.
- `PUBLIC_TALLY_FORM_ID`: public Tally form ID.
- `PUBLIC_GOOGLE_MAPS_EMBED_URL`: public Google Maps embed URL.
- `PUBLIC_BAR_PHONE`: public phone number.
- `PUBLIC_BAR_ADDRESS`: public address.
- `PUBLIC_BAR_INSTAGRAM_URL`: public Instagram URL.

Do not use public environment variables for API keys, passwords, private sheets, Tally admin links, or reservation response sheets.

## Google Sheets Menu Rules

Create a dedicated tab named exactly `Website Menu`. Publish only this tab as CSV.

The tab must have these exact row 1 headers:

- `category`
- `section_order`
- `item_order`
- `name`
- `description`
- `price`
- `tags`
- `available`

Operational rules:

- Only customer-facing menu data belongs in the published tab.
- `available` must be `TRUE` for an item to show.
- Rows missing `category`, `name`, or `price` are skipped.
- `section_order` sorts categories.
- `item_order` sorts items within each category.
- `tags` are comma-separated labels.
- Freeze and protect the header row.
- Restrict edit access to the owner and trusted manager.

Never publish customer data, supplier costs, margins, revenue, staff notes, private links, passwords, API keys, or reservation data in the menu sheet.

## Menu API Requirements

Endpoint: `GET /api/menu`.

Required behavior:

- Fetch the menu CSV from `MENU_CSV_URL`.
- Require the exact menu headers listed above.
- Skip rows where `available` is not `TRUE`.
- Skip rows missing `category`, `name`, or `price`.
- Sort categories by `section_order`, then name.
- Sort items by `item_order`, then name.
- Split comma-separated tags.
- Limit string lengths before returning data.
- Return JSON only.
- Never return or render raw HTML from the sheet.
- Use public caching with a short revalidation window.

Customer-facing error handling:

- If the menu cannot load, show a simple temporary-unavailable message.
- If no available rows exist, show that no menu items are currently available.
- Do not show technical errors to customers.

## Reservation Requirements

Create a Tally form named `Request a Reservation`.

Required fields:

- Name.
- Phone number.
- Email.
- Requested date.
- Requested time.
- Party size.
- Required confirmation checkbox stating the request is not confirmed until staff contacts the customer.

Optional fields:

- Seating preference.
- Special occasion.
- Notes.

Tally must:

- Display a success message confirming the request was received.
- Email owner or staff on each submission.
- Store submissions in Tally.

Do not publish reservation response sheets or expose Tally admin links.

## Deployment And Domain

Cloudflare Pages:

- Build command: `npm run build`.
- Build output directory: `dist`.
- Configure all required environment variables.
- Verify the Cloudflare preview URL before production.

GoDaddy DNS:

- Record current DNS settings before changes.
- Confirm whether the domain uses email.
- Do not remove MX or TXT records used for email.
- Preferred pattern: `www` points to Cloudflare Pages and the root domain redirects to `www`.
- Do not migrate nameservers unless the owner approves.

## Security And Privacy

- Treat the published menu CSV as public.
- Keep private data out of the menu sheet.
- Reservation data stays in Tally.
- The website does not store customer or reservation data in v1.
- Do not commit `.env` files.
- Do not expose secrets in `PUBLIC_*` variables.
- Render menu values as text, not HTML.
- Keep sheet edit access limited to trusted people.

## QA Checklist

- Menu sheet has the exact required headers.
- Published CSV URL works.
- `/api/menu` returns grouped JSON.
- Unavailable and invalid rows are hidden.
- Categories and items sort correctly.
- Tags render correctly.
- Reservation page embeds the Tally form.
- Reservation copy clearly says requests are staff-confirmed.
- Test reservation sends owner or staff notification.
- Home, menu, reservations, contact, and 404 pages load.
- Phone, Instagram, and map links work when configured.
- Cloudflare Pages build succeeds.
- Production domain works over HTTPS.
- Existing email DNS records remain intact.

## Acceptance Criteria

The MVP is complete when:

- The owner can edit the public menu from the `Website Menu` Google Sheet.
- Website menu changes do not require code changes.
- Rows where `available` is not `TRUE` are hidden.
- Customers can submit reservation requests from the website.
- Owner or staff receive reservation notifications.
- The website does not store reservation or customer data.
- The site is deployed on Cloudflare Pages.
- The GoDaddy domain points to the new site.
- No private data is published through the menu sheet.
- No database is used in v1.

## Future Upgrade Triggers

Only add more systems when the business needs them:

- Add a database and admin dashboard for reservation status tracking, staff roles, customer history, reports, or manual overrides.
- Add a restaurant booking platform for instant bookings, table inventory, no-show management, deposits, cancellation policies, SMS reminders, or multiple seating areas.
- Add payments for deposits, ticketed events, private events, or cancellation fees.

# The Daily Pint Design Notes

## Direction

The latest redesign makes the site more minimal, lighter, and less technical while preserving the v1 architecture: Astro static pages, Cloudflare Pages Functions, Google Sheets menu data, Google Calendar events, and Tally reservation requests.

The visual direction is a modern neighborhood bar: warm paper surfaces, sage green accents, editorial type, clear guest paths, and a calmer embedded navigation system. The homepage keeps the bar photo as the first-viewport signal, then moves guests through the practical flow: menu, events, reservation request, and contact.

## Web Inspiration

- [Navbar Gallery](https://www.navbar.gallery/) informed the smoother text-led navigation with subtle active states.
- [Awwwards hotel and restaurant websites](https://www.awwwards.com/websites/hotel-restaurant/) informed the image-led hospitality mood and clear conversion paths.
- [Site Builder Report bar website examples](https://www.sitebuilderreport.com/inspiration/bar-websites) reinforced easy navigation, strong imagery, menu access, and mobile optimization.
- [Framer restaurant website examples](https://www.framer.com/blog/restaurant-website-design-examples/) informed the lighter editorial landing-page hierarchy.
- [Material Design 3 lists](https://m3.material.io/components/lists/overview) informed the compact icon rows and scan-friendly repeated content.

## Palette

- Background cream: `#f5ecdc`
- Soft cream: `#efe3d1`
- Paper: `#fffaf1`
- Ink: `#1b241e`
- Muted olive gray: `#687267`
- Sage: `#586f62`
- Deep sage: `#23382f`
- Gold: `#b77d35`
- Copper: `#a6613d`
- Wine: `#6b3341`

The palette is intentionally lighter than the previous dark-glass version, with enough sage, gold, copper, and wine contrast to avoid a single-hue theme.

## Typography

- Display: `Cormorant Garamond`, used for hero, page, and section headlines.
- Interface/body: `Manrope`, used for navigation, body text, buttons, lists, and menu content.

The type system uses fixed rem-based sizes with media queries instead of viewport-width font scaling.

## Motion

- Slow hero image drift for atmosphere.
- Scroll cue motion.
- IntersectionObserver reveal animations on lower landing sections.
- Button shine and lift hover effects.
- Menu, card, calendar, and text-link hover motion.
- `prefers-reduced-motion` disables animation-heavy behavior.

The moving marquee and light sweep were removed to keep the redesign calmer.

## Interaction System

- Header navigation is text-led and embedded into the page, with subtle active underlines.
- Primary actions still use icon and text buttons for clear commands.
- Footer, contact, page panels, and CTA buttons keep compact icons.
- Homepage copy is guest-facing instead of implementation-facing.
- Page action panels are lighter and less card-like.
- Menu categories keep item counts, compact price chips, and customer-facing tags.
- Events keep an upcoming list and custom calendar UI, with a lighter detail panel.
- The reservation path keeps the required `Request a Reservation` wording and staff-confirmed copy.

## Files Changed

- `src/components/Header.astro`: removed icon-led nav and kept active text navigation.
- `src/components/Layout.astro`: updated browser theme color for the lighter palette.
- `src/pages/index.astro`: simplified hero, removed the planner/marquee, and rewrote the homepage flow around guest needs.
- `src/pages/menu.astro`: softened page copy while preserving current-menu behavior.
- `src/pages/events.astro`: softened event copy and kept the custom calendar placement.
- `src/pages/reservations.astro`: kept staff-confirmed language and simplified one operational line.
- `src/pages/contact.astro`: removed implementation-facing configuration copy.
- `src/styles/global.css`: rebuilt the lighter visual system, responsive layout, nav, cards, menu, events calendar, footer, and motion states.

## QA

- `npm run build` passes with Astro check and TypeScript.
- Verified desktop home, menu, events, reservations, and contact pages in the browser.
- Verified menu renders sample API data, including category, item, price, description, and tag styles.
- Verified events empty state and custom calendar render from `/api/events`.
- Verified mobile home, menu, and events pages at `390x844`.
- Verified narrow mobile route sweep at `320x740` across home, menu, events, reservations, and contact.
- No horizontal page overflow was detected in the browser checks.
- Fixed the mobile menu price chip so it stays content-width instead of stretching.
- Refined the calendar detail panel so empty states do not stretch to the full grid height.

## V1 Boundaries Preserved

- No database added.
- No custom admin dashboard added.
- No payment flow added.
- Reservation CTA remains `Request a Reservation`.
- Reservation data still stays in Tally.
- Menu values continue to render as text, not raw HTML.
- Event values continue to render as text, not raw HTML.

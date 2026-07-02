# The Daily Pint Design Notes

## Direction

The redesign turns the MVP into a premium neighborhood bar website while keeping the v1 architecture unchanged: static Astro pages, Cloudflare Pages Functions, Google Sheets menu source, Google Calendar events, and Tally reservation requests.

The page is meant to feel candlelit, polished, and direct while behaving like a modern product UI. The hero uses the existing bar photo as the first-viewport signal, with large editorial typography, icon-led navigation, and a "Plan your night" panel for menu, events, and staff-confirmed reservations.

## Web Inspiration

- [The Dead Rabbit](https://thedeadrabbit.com/) informed the strong hospitality navigation pattern: menus, opening information, events, and reservations are always easy to find.
- [Death & Co](https://www.deathandcompany.com/) informed the image-led cocktail bar mood and direct reservation-oriented navigation.
- [Overstory](https://www.overstory-nyc.com/) informed the elegant, information-rich cocktail bar structure with clear reservation details and venue copy.
- [Awwwards restaurant category](https://www.awwwards.com/websites/restaurant/) was used as a broader reference for immersive restaurant and bar landing page patterns.
- [Material Design 3 lists](https://m3.material.io/components/lists/overview) informed the icon-led list rows, leading/trailing affordances, and grouped action panels.
- [Material Design 3 date pickers](https://m3.material.io/components/date-pickers/overview) informed the compact event date badges and calendar-first mental model.
- [Apple lists and tables guidance](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) informed the grouped, scan-friendly page action panels.
- [Resy](https://resy.com/) informed the events-to-reservation flow: discovery first, then a clear booking/request action.

## Palette

- Night green: `#071a18`
- Deep green: `#0d2520`
- Cream: `#f5ead5`
- Paper: `#fff8eb`
- Gold: `#d8ad5d`
- Copper: `#b8673f`
- Wine: `#5a1f2d`
- Moss: `#2f4436`

The palette avoids a one-note theme by balancing dark green, warm cream, amber gold, copper, and wine accents.

## Typography

- Display: `Cormorant Garamond`, used for hero and section headlines.
- Interface/body: `Manrope`, used for navigation, body text, buttons, and menu content.

The type system uses fixed rem-based sizes with media queries instead of viewport-width font scaling.

## Motion

- Slow hero image drift for atmosphere.
- Subtle hero light sweep.
- Scroll cue motion.
- Moving marquee strip for bar energy.
- IntersectionObserver reveal animations on lower landing sections.
- Button shine and lift hover effects.
- Menu and text-link hover motion.
- `prefers-reduced-motion` disables animation-heavy behavior.

## Interaction System

- Local `Icon.astro` provides consistent inline SVG icons without adding a dependency after npm certificate verification blocked `lucide-astro` installation.
- Header navigation uses icons plus text for fast scanning.
- Primary actions use icon and text buttons.
- Footer and contact actions use compact icon links.
- Page hero panels summarize the operational model for menu, events, reservations, contact, and 404 recovery.
- Events use a calendar badge list above the full Google Calendar embed.
- Menu categories include item counts and price chips.

## Files Changed

- `src/components/Icon.astro`: added reusable icon primitive.
- `src/pages/index.astro`: rebuilt landing page structure, plan-your-night panel, customer flow, menu showcase, event showcase, and motion script.
- `src/pages/menu.astro`: added menu operations panel and follow-up actions.
- `src/pages/events.astro`: added events operations panel, list-first ordering, calendar header, and follow-up actions.
- `src/pages/reservations.astro`: added staff-confirmed process strip.
- `src/pages/contact.astro`: added contact action panel, Instagram action, and contact cards.
- `src/pages/404.astro`: added useful recovery links.
- `src/styles/global.css`: replaced the MVP stylesheet with the full visual system, responsive layout, and motion.
- `src/components/Layout.astro`: added Google Fonts and optional page class support.
- `src/components/Header.astro`: added active navigation state and icons.
- `src/components/Footer.astro`: added icon actions for phone, Instagram, events, and reservations.
- `src/components/MenuRenderer.astro`: improved menu empty/error states and category metadata while still rendering text-only values.
- `src/components/EventsList.astro`: improved event list rendering with date badges.

## QA

- `npm run build` passes with Astro check and TypeScript.
- Verified desktop and mobile home page screenshots in the browser.
- Verified menu, events, reservations, contact, and 404 pages.
- Verified menu temporary-unavailable state.
- Ran a DOM layout audit across home, menu, events, reservations, contact, and 404 at `390x844` and `1280x720`.
- No horizontal overflow was detected.
- No clipped checked text or interactive elements were detected.

## V1 Boundaries Preserved

- No database added.
- No custom backend added beyond the existing Pages Function.
- No admin dashboard added.
- Reservation CTA remains `Request a Reservation`.
- Reservation data still stays in Tally.
- Menu values continue to render as text, not raw HTML.
- Event values continue to render as text, not raw HTML.

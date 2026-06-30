# The Daily Pint Design Notes

## Direction

The redesign turns the MVP into a premium neighborhood bar landing page while keeping the v1 architecture unchanged: static Astro pages, Cloudflare Pages Function menu API, Google Sheets menu source, and Tally reservation requests.

The page is meant to feel candlelit, polished, and direct. The hero uses the existing bar photo as the first-viewport signal, with large editorial typography and clear paths to the menu and staff-confirmed reservations.

## Web Inspiration

- [The Dead Rabbit](https://thedeadrabbit.com/) informed the strong hospitality navigation pattern: menus, opening information, events, and reservations are always easy to find.
- [Death & Co](https://www.deathandcompany.com/) informed the image-led cocktail bar mood and direct reservation-oriented navigation.
- [Overstory](https://www.overstory-nyc.com/) informed the elegant, information-rich cocktail bar structure with clear reservation details and venue copy.
- [Awwwards restaurant category](https://www.awwwards.com/websites/restaurant/) was used as a broader reference for immersive restaurant and bar landing page patterns.

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

## Files Changed

- `src/pages/index.astro`: rebuilt landing page structure and motion script.
- `src/styles/global.css`: replaced the MVP stylesheet with the full visual system, responsive layout, and motion.
- `src/components/Layout.astro`: added Google Fonts and optional page class support.
- `src/components/Header.astro`: added active navigation state.
- `src/components/MenuRenderer.astro`: improved menu empty/error states while still rendering text-only values.

## QA

- `npm run build` passes with Astro check and TypeScript.
- Verified desktop and mobile home page screenshots in the browser.
- Verified mobile contact and reservation pages.
- Verified menu temporary-unavailable state.
- Ran a DOM layout audit across home, menu, reservations, contact, and 404 at `390x844` and `1280x720`.
- No horizontal overflow was detected.

## V1 Boundaries Preserved

- No database added.
- No custom backend added beyond the existing Pages Function.
- No admin dashboard added.
- Reservation CTA remains `Request a Reservation`.
- Reservation data still stays in Tally.
- Menu values continue to render as text, not raw HTML.

# Roadmap

Committed doc, not scratch. Kept current by hand as work ships.
**Shipped** = live in production. **Next** = intended, not promised.
**Declined** = decided against, with the reason, so it doesn't get re-proposed.

## Shipped

- **2026-10 — Whole-app critique fixes, impeccable 26/40, 2026-10-27** (first run 20/40). Cars are a keyboard radio group with a ring + check for the chosen one; one focus ring app-wide; Find cars and Confirm show a busy state on the button, failures explain themselves in place with Try again, requests time out at 20s; the booking modal is gone, a booking ends on the Confirm page with the code and Book another car, and the steps lock until then; date range starts empty, no past days, closes on the second pick or Esc; named steps, an h1 per step, per-step tab titles; contrast fixes; backgrounds 13MB PNG to 0.67MB WebP; no sideways scroll, Rentals is one column with a sticky labeled Review booking.
- **2026-10 — Fleet apps + account menu and footer.** The old fixed top-left site menu is gone; the fleet kit's apps menu sits at the trailing end of the section header, listing every live app from `crystalprism.io/apps.json` (baked fallback on failure), with no account rows since vroom has no sign-in. `FleetFooter` replaces the inline copyright, over a soft white fade so it reads on the photo. Kit copied byte-identical into `src/components` + `src/lib`; tokens in `src/index.css`.
- 2026-10 Flare reports now carry a wrapped error's `params` and its `cause` chain (`errorDetail` in `src/lib/flare.ts`, ported from the Next template), with the template's six cases in `src/lib/flare.test.ts`.
- 2026-10 Copy pass: tighter wording, no em-dashes (fleet copy standard).
- 2026-09 [security] Every response sends `X-Content-Type-Options: nosniff` and a same-origin frame guard (`netlify.toml` `[[headers]]`).
- 2026-09 The test suite blocks real network calls by default, with a pin test on the module-load guard.
- 2026-09 The car sort control is the fleet `SelectMenu` instead of a native `<select>`.
- 2026-08 Client errors report to flare, with the release stamped from Netlify's `COMMIT_REF`.
- 2026-08 The iOS home-screen icon is opaque and inset, not transparent.
- 2026-06 Full icon set and PWA manifest.
- 2026-06 Demo rental provider: no-key, deterministic sample inventory is the default search source.
- 2026-06 The pick-up map renders without the Directions API.
- 2026-06 Moved to Vite + TypeScript and current dependency versions.

## Next

- **Keep the trip in the URL.** A refresh or browser Back mid-booking loses the place, dates and chosen car (`src/App.tsx` holds all of it in state). Put the step and inputs in the query string so Back walks the steps and a refresh resumes. P2 from the 2026-10-27 whole-app critique.
- **Calendar fits the screen.** The two-month `DayPicker` popover in `src/PickupSelector/DateRangeInput/DateRangeInput.tsx` runs past the fold at 1440 and 390; lay the months side by side on wide screens and make it a bottom sheet on a phone. P3 from the same critique.
- **Migrate place search off the legacy Places services.** `react-geosuggest` uses `AutocompleteService`/`PlacesService`, closed to new Google customers since 2025-03; the Maps key is also not authorized for the Geocoding service (console error on every pick). `src/PickupSelector/LocationInput/LocationInput.tsx`. P3.
- **Real company logos or none.** Every demo car falls back to the Vroom mark (`CarRow` `updateLogoImage`), so the six companies look identical; show the company name as text when there is no real logo. P3.

## Declined

- **2026-10 — Sign-in, saved bookings and /stats.** Every search result comes from the deterministic demo rental provider, so a per-user history and stats page would chart sample cars, not real rentals. Not worth a ring sign-in (vroom is a Vite SPA on Netlify and vroom_api is Flask, so neither can mint the Auth.js cookie), a `user_email` column on `booking`, and invitations. Bookings are still stored in vroom_api's `booking` table, just not per user.

## Open questions

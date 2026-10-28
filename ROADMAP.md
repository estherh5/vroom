# Roadmap

Committed doc, not scratch. Kept current by hand as work ships.
**Shipped** = live in production. **Next** = intended, not promised.
**Declined** = decided against, with the reason, so it doesn't get re-proposed.

## Shipped

- **2026-10 — The trip lives in the URL.** Place, dates, step and chosen car are in the query string (`src/lib/tripUrl.ts`): a refresh resumes the step (it searches again first), browser Back and Forward walk the steps, and Back to Rentals keeps the chosen car.
- **2026-10 — Calendar fits the screen.** Two months side by side on wide screens, scrolled fully into view when opened; on a phone one month in a bottom sheet over a dimmed page, with a close button. It opens on the picked start month.
- **2026-10 — Place search on Places API (New).** A hand-built city combobox (`src/PickupSelector/LocationInput/LocationInput.tsx`, `src/lib/maps.ts`) replaces `react-geosuggest` and the legacy `AutocompleteService`/`PlacesService`; picking a city fetches its location from the place itself, so the Geocoding console error is gone. Places API (New) is enabled on the Vroom Google project and allowed on its browser key, whose local-dev referrers are now `localhost:3000` / `127.0.0.1:3000` (the old `:*` forms were invalid).
- **2026-10 — Company names, not a stand-in logo.** A car with no real company logo names the company in text instead of showing the Vroom mark.
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

## Declined

- **2026-10 — Sign-in, saved bookings and /stats.** Every search result comes from the deterministic demo rental provider, so a per-user history and stats page would chart sample cars, not real rentals. Not worth a ring sign-in (vroom is a Vite SPA on Netlify and vroom_api is Flask, so neither can mint the Auth.js cookie), a `user_email` column on `booking`, and invitations. Bookings are still stored in vroom_api's `booking` table, just not per user.

## Open questions

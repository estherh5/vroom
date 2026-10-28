# Roadmap

Committed doc, not scratch. Kept current by hand as work ships.
**Shipped** = live in production. **Next** = intended, not promised.
**Declined** = decided against, with the reason, so it doesn't get re-proposed.

## Shipped

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

- **Whole-app impeccable critique + audit.** Not yet run on this app (checked 2026-10-27). One session, in its own worktree: (1) polish every route; (2) critique A (design) and critique B (detector + browser) in parallel, on desktop and phone, per the impeccable skill's `critique.md`; (3) fix every P0 and P1; (4) re-run the critique to confirm it is clean; (5) persist the snapshot with `critique-storage.mjs` and add a Shipped line `impeccable <n>/40, <date>`. Steps: the `new-app` skill, Shipping section. Almanac's pass (2026-10-19, 24/40) still found P1s that ~65 per-feature passes had missed. **Loading states, part of step (1):** Vite SPA, so there is no `loading.tsx`: check every fetch-on-mount fills its own slot and ends in content, empty or a visible failure with Retry. Candidates (checked 2026-10-27): `src/App.tsx` calls `searchCars` and `createBooking` (`src/api.ts`, which throws on failure) and only disables the submit buttons via `pickupSubmitted`/`bookingSubmitted`: confirm the car list and the booking show progress and a failure with Retry. Then check every network-bound control shows a busy state on itself. Rule: "Async actions & progress" in `~/Developer/DESIGN.md`; nexus's Past chats sheet (`web/components/PersonChat.tsx`) is the reference for an in-sheet list.

## Declined

- **2026-10 — Sign-in, saved bookings and /stats.** Every search result comes from the deterministic demo rental provider, so a per-user history and stats page would chart sample cars, not real rentals. Not worth a ring sign-in (vroom is a Vite SPA on Netlify and vroom_api is Flask, so neither can mint the Auth.js cookie), a `user_email` column on `booking`, and invitations. Bookings are still stored in vroom_api's `booking` table, just not per user.

## Open questions

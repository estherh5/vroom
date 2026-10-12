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

## Declined

## Open questions

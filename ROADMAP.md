# Roadmap

Committed doc, not scratch. Kept current by hand as work ships.
**Shipped** = live in production. **Next** = intended, not promised.
**Declined** = decided against, with the reason, so it doesn't get re-proposed.

## Shipped

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

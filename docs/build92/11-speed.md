# Chunk 11: Speed: app open and profile

**Why:** on build 91 you noticed a delay every time the app opened, and the profile post view lagged. The build 90 test never measured cold start.

## Items
- **11.1 Measure first:**
  - Cold start to Home interactive, and warm start, on a Release build in the 16 Pro Max simulator, 5 runs each.
  - Log each phase: native launch, JS bundle load, auth/session restore, `home.bootstrap`, first render.
  - Write a table in the report before changing anything.
- **11.2 Fix the biggest phases**, from what the measurement shows. Likely:
  - the splash waiting on network
  - auth restore and bootstrap running in sequence
  - heavy imports at startup
  - fonts or images blocking first render

  Show Home from cache first, then refresh.
- **11.3 Profile and feed images:** thumbnails sized to their tile, with full resolution only in full screen. Use a cache policy.
- **11.4 Request budget:** confirm chunk 01b's limit still holds after chunks 01–10: under 50 requests in the busiest minute of a new-user flow, and 0 × 429.

**Target:** cold start to an interactive Home under 2 s (median, Release simulator). Profile header under 300 ms from cache.

## Gates
- [ ] Before and after tables for cold start, warm start and profile open (5 runs each).
- [ ] The targets are met, or the remaining cost is explained with numbers (for example, native launch the app can't control).
- [ ] The request budget is under 50 per minute; 0 × 429 across 5 runs.
- [ ] Chunk 01–11 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.

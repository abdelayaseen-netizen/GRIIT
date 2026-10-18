# Chunk 04: Posts, likes and proof detail

**Spec:** `part1-finish-loop/` frames P1-19 to P1-27. Checklist: the Part 1 lines from "Run posts show…" through "The owner changes who sees a post…".

**Why:**
- The run post showed "Morning run · Self-reported" with no distance or time.
- The feed header wraps "Day 16 1m of 30".
- Double-tap doesn't like a photo: tap opens the photo, and the like animation glitches.
- Proof detail traps people: Back does nothing, and Done hides under the composer.

## Items
- **04.1 What a post shows, per task type:**
  - Run: "{d} mi · {time} · {pace} /mi"
  - Workout: "{type} · {m} min"
  - Counter: the count
  - Timer: the duration
  - Journal: "Journal entry", with the text never shown and Only me as the default
  - The server must return these fields on feed items. Add them; don't break build 91.
- **04.2 One badge per post:** Verified, Verified by Strava, or Self-reported.
- **04.3 Post header:** name; challenge and day on one line; the time on the right, never wrapping.
- **04.4 Double-tap to like:**
  - In the feed, proof detail and full screen.
  - It never unlikes; a white heart shows for 600 ms and the icon fills.
  - A single tap opens full screen after 250 ms.
  - Fix the like glitch you saw: a double tap causing a like plus an open, with the heart flickering.
- **04.5 Own posts:** no heart and no double-tap like. Show "Liked by {name} and {n} others". The server must reject a self-like too.
- **04.6 Proof detail:**
  - Back returns to the previous screen and scroll position. No Done button.
  - The comment bar is pinned to the keyboard, with the latest comment visible.
  - The owner's "…" menu has Who sees this, Share and Delete post.

**Areas:** `components/feed/`, `app/post/[id]`, `backend/trpc/routes/feed.ts`, `backend/lib/feed-activity-hydrate.ts`, likes route.

## Gates
- [ ] vitest: post line formatting for each type; a self-like is rejected by the server.
- [ ] Maestro: double-tap likes a friend's photo exactly once (count +1, not toggled); single tap opens full screen; double-tap in full screen likes; own post has no heart.
- [ ] Maestro: feed → post → Back returns to the feed at the same post. 3 runs.
- [ ] Screenshots next to P1-19, P1-20, P1-21, P1-23, P1-24 and P1-25.
- [ ] Backend deployed if the server changed. Chunk 01–04 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.

# Chunk 07: Profile and post viewer

**Spec:** `part2-profile-social/`, frames P2-01 and P2-03 to P2-13 (Option A). Checklist: Part 2 lines from "The profile header shows at most 3 numbers…" through "Your own posts show 'Liked by'…".

**Why:**
- Opening a post from the profile and scrolling froze, with a big delay. That's a bad bug.
- The profile showed six stacked numbers, and the Proofs / Your data / Challenges / Badges section felt off.
- The profile tab once stuck on grey loading cards.

## Items
- **07.1 Scroll freeze:**
  - Reproduce opening a profile post and scrolling on a profile with 20+ posts.
  - Profile it (React DevTools or the Hermes profiler, plus JS frame times).
  - Write the root cause before fixing. Likely suspects: full-resolution images, a non-virtualized list, or re-renders on every scroll.
- **07.2 Header:**
  - photo, name, @handle, bio
  - at most 3 numbers from chunk 06's fields
  - followers and following on one tappable line, with no Friends number
  - own view: Edit profile and Find friends; visitor view: Follow/Following and "Invite to a challenge"
- **07.3 Proof grid first:** 3 columns of 4:5 tiles with a small date label; empty and offline states.
- **07.4 Your record (Option A row):**
  - Challenges (Running, Finished, Left, with numbers from chunk 06) and Badges are free.
  - Stats shows free streak history plus a preview of the Pro deeper stats.
- **07.5 Post viewer:**
  - Opens at the tapped post and scrolls smoothly through all posts. Photos in a post swipe with "1 of 2".
  - Back returns to the same tile.
  - The header reads "Posts". Own posts show "Liked by", with no heart.
- **07.6 Loading:** the header renders from cache instantly, and only the grid shows skeletons. Never a blank screen.

**Areas:** `app/(tabs)/profile.tsx`, `app/profile/[username].tsx`, `app/profile/posts`, `components/profile/`, image loading.

## Gates
- [ ] Scroll freeze: before and after frame-time numbers on a 25-post profile. No frame over 50 ms during a 10-second scroll on the 16 Pro Max simulator.
- [ ] Maestro: profile → tile 10 → scroll through 5 posts → Back lands on tile 10. 3 runs.
- [ ] Profile opens with the header visible within 300 ms from cache (measured).
- [ ] Screenshots next to P2-01, P2-03, P2-06, P2-07, P2-08, P2-09 and P2-12.
- [ ] Chunk 01–07 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.

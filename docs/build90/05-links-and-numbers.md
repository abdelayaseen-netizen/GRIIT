# Chunk 05: Everything links to what it names, and numbers agree

**Why:** Tapping a username or a challenge name does nothing. Home, Profile and the challenge page show different numbers for the same day. A test account ("b89likes15") showed up in a real user's notifications.

**Areas you may touch:**
- `lib/routes.ts`
- `app/profile/[username].tsx`
- `app/(tabs)/activity.tsx`
- comment components
- `components/feed/**`
- leaderboard and members screens
- `components/home/HomeV3.tsx`
- `components/profile/**` (numbers only, no redesign)
- `app/challenge/[id].tsx`
- the backend list queries for notifications, leaderboard, comments, likes and search

## 05.1 Tap any person and open their profile
- Applies to: notifications, comment authors, feed posts, the leaderboard, challenge members, likes lists, search results.
- Add a `userProfile(username)` route helper in `lib/routes.ts` and use it everywhere.
- **Test:** a Maestro flow that taps a name in each of those places and lands on the right profile.

## 05.2 Tap any challenge name and open the challenge page
- Applies to: Home task rows (the "Workout everyday · Day 2 of 7" line), the Home ring header, feed posts, profile Challenges.
- Home shows a one-line, tappable challenge header above each challenge's tasks.

## 05.3 Hide test accounts
- Apply the `profiles.is_test` filter to notifications, the leaderboard, comments, likes lists and search.

## 05.4 Numbers agree everywhere
- **Bugs seen:**
  - Profile "Today · 4 tasks left" while Home showed 1 of 4 left
  - the challenge page "1 days done · 0 secured" and "0 of 1 day secured" on Day 2 of 7
- **Fix:** each number gets one source of truth, shared by Home, Profile, the challenge page and the share card.
- Pluralize correctly: "1 day", "2 days".
- **Test:** a vitest test feeding one state into each consumer and checking that the numbers match.

## Gates
- [ ] A name in each listed place opens the right profile
- [ ] A challenge name in each listed place opens the challenge
- [ ] No is_test account appears in any list (show the query filters)
- [ ] Home, Profile and the challenge page show the same counts (screenshots of the same moment)
- [ ] Chunk 01–04 tests still pass
- [ ] `npx tsc --noEmit`: 0 errors
- [ ] PROGRESS.md updated, committed, pushed

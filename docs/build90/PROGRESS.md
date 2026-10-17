# Build 90 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Speed | PASSED | 79fecc99 | Timings, Maestro, photo sizes, and the backend deploy are recorded in docs/reports/build90.md. tsc has the same 5 errors as a375b25a. |
| 02 | First day | PASSED | c92a7122 | Join sticks (no duo), finish opens first task, empty Home starter card, ring opens task, timer + Finished early?, How it works 3 lines. Evidence in docs/reports/build90.md. |
| 03 | Task inputs | PASSED | b2693fc3 | Workout chips + duration (distance only Cycling/Swim), pace and speed check with Save anyway, shared journal word rule client + server, counter cannot finish below target. SQL for seeded mismatch in docs/sql/build90.sql. Backend deployed, /api/health commit 49f6ae0. Evidence in docs/reports/build90.md. |
| 04 | Posting and sharing | PASSED | 8b491178 | Post-or-private sheet after every task, Proof screen Done, own post in both feeds (cold relaunch, server-sourced), share card data, 4 sticker cards, Instagram Story as sticker on every card. Backend deployed with approval, /api/health commit 804ba49. 04.7: Day secured "Couldn't load" was a 429 from a request burst after a finish; cut client-side (one bootstrap refresh per finish, planner reads the bootstrap, feed asks for a page once), 100→74–79 requests per flow, 0 × 429, Day secured first try 5 runs in a row. 29 + 15 new tests, tsc same 5 baseline errors, Maestro post-choice + post-detail + chunk 01–03 flows exit 0. Evidence in docs/reports/build90.md. |
| 05 | Links and numbers | PASSED | 82475753 | Every person surface (feed, comments sheet, post screen, notifications, leaderboard, members, Discover, follow list) opens the profile through `userProfile()`; feed subject line and a per-challenge Home header open the challenge; notifications, comments and reactions drop is_test authors for real viewers (deployed, /api/health commit ea97ee1); Home, Profile and the challenge page count from the one bootstrap payload, hardcoded "days" pluralised. Found in the flows: a just-upgraded guest token kept `is_anonymous: true` so a new account could open nobody (session refresh after updateUser), notification avatar hidden from a11y (ListRow `interactiveIcon`). 9 + 3 + 2 new tests, tsc same 5 baseline errors, Maestro links + links-people + chunk 01–04 flows exit 0. Evidence in docs/reports/build90.md. |
| 06 | Words and small fixes | PASSED | 66765c0f | Definitions at the moment they happen (Day secured, first freeze, first self-reported, Strict/Standard on the Join sheet), "Self-reported" once per screen (Day secured, ask step, Join sheet row), greeting never `@user_xxxxxxxx`, feed hint clears the tab bar, Password label focuses the field, guest Save sheet no longer opens over Day secured and always offers Later, freeze result line every time, create step 1 double tap moves one step and the title stays on screen, login survives a reopen (401 → refresh once; failed profile read ≠ no profile). Five reported bugs: Save sheet dismiss, Day secured row under Done, water oz/cups (server deployed, /api/health commit 66765c0), double top padding on task steps, ConfirmDialog scrim. SQL for "Workout everyday" in docs/sql/build90.sql lines 76–104 (not run). 29 + 6 updated tests, tsc same 5 baseline errors, Maestro words-guest + words-account + chunk 01–05 flows exit 0. Evidence in docs/reports/build90.md. |
| 07 | Safety | NOT STARTED | | |
| 08 | Friend loop | NOT STARTED | | |
| 09 | Strava auto-detect | NOT STARTED | | |
| 10 | Ship and overnight test | NOT STARTED | | |

## Item log
(Cursor adds one line per item: `NN.N title: done / not done, sha`)

01.1 Measure first: done, 79fecc99
01.2 Shrink photos: done, 79fecc99
01.3 Cached session: done, 79fecc99
01.4 One server call: done, 79fecc99
01.5 Optimistic UI: done, 79fecc99
01.6 Location: done, 79fecc99
01.7 Measure again: done, 79fecc99
02.1 Onboarding Join sticks: done, c92a7122
02.2 Land on first task after Join: done, c92a7122
02.3 No empty Home / starter card: done, c92a7122
02.4 Home ring opens the task: done, c92a7122
02.5 Timer length + Finished early?: done, c92a7122
02.6 Onboarding ends on a task: done, c92a7122
03.1 Workout is not a run: done, b2693fc3
03.2 Sanity checks: done, b2693fc3
03.3 Journal counts real words: done, b2693fc3
03.4 Counter units: done, b2693fc3
03.3 follow-up ("I" and "a" count): done, 70b747b5
04.1 One clear post choice after every task: done, 804ba49c (client + server, deployed), proven 8b491178
04.2 Photo-proof tasks say so up front: done, 804ba49c
04.3 The Proof screen has a finish: done, 804ba49c, proven 8b491178
04.4 Your own post always shows in your feed: done, 804ba49c (server deployed), proven 8b491178
04.5 Share card data is correct: done, 804ba49c
04.6 Sticker set: done, 804ba49c; follow-up (Instagram Story sticker on every card): done, 8b491178
04.7 Day secured "Couldn't load" after a finish (429 from a request burst): done, 8b491178
05.1 Tap any person and open their profile: done, ea97ee14; follow-up (stale anonymous token, notification avatar, post comment author reachable): done, 82475753
05.2 Tap any challenge name and open the challenge page: done, ea97ee14; follow-up (optimistic row challengeId): done, 82475753
05.3 Hide test accounts: done, ea97ee14 (server deployed, ea97ee1)
05.4 Numbers agree everywhere: done, ea97ee14; follow-up (Profile Today tile from the bootstrap, "First day is today.", challenge page reads bootstrap keys, "Finish the task"): done, 82475753
06.1 Definitions where the thing happens: done, 66765c0f
06.2 "Self-reported" at most once per screen: done, 66765c0f; follow-up (Join sheet builtin row, Day secured caption): done, 3750526c
06.3 Greeting: done, 66765c0f
06.4 Copy fixes: done, 66765c0f (feed hint); "Workout everyday" SQL written, not run
06.5 Password label focuses the field: done, 66765c0f
06.6 Guest Save your streak loop / Skip reaches Home: done, 66765c0f
06.7 Freeze feedback: done, 66765c0f (result line); harness flow 3750526c
06.8 Create step 1: done, 66765c0f
06.9 App Review login persists: done, 66765c0f
06.bugs Save sheet dismiss, Day secured row under Done, water oz/cups (server deployed 66765c0), double top padding, ConfirmDialog scrim: done, 66765c0f

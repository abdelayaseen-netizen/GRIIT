# Build 90 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Speed | PASSED | 79fecc99 | Timings, Maestro, photo sizes, and the backend deploy are recorded in docs/reports/build90.md. tsc has the same 5 errors as a375b25a. |
| 02 | First day | PASSED | c92a7122 | Join sticks (no duo), finish opens first task, empty Home starter card, ring opens task, timer + Finished early?, How it works 3 lines. Evidence in docs/reports/build90.md. |
| 03 | Task inputs | PASSED | b2693fc3 | Workout chips + duration (distance only Cycling/Swim), pace and speed check with Save anyway, shared journal word rule client + server, counter cannot finish below target. SQL for seeded mismatch in docs/sql/build90.sql. Backend deployed, /api/health commit 49f6ae0. Evidence in docs/reports/build90.md. |
| 04 | Posting and sharing | FAILED | 449168d1 | Code complete, 23 new tests, tsc same 5 baseline errors, Maestro build90-post-choice + build90-post-detail exit 0 with screenshots in docs/reports/build90/. Blocking: two gates (Proof screen Done, own post in both feeds) need the chunk 04 server on Railway (checkins.ts audience, feed.ts own-post rule); this chunk does not deploy. After Yaseen deploys, re-run the two flows on the post path and flip to PASSED. Evidence in docs/reports/build90.md. |
| 05 | Links and numbers | NOT STARTED | | |
| 06 | Words and small fixes | NOT STARTED | | |
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
04.1 One clear post choice after every task: done (client), server part awaits deploy, 449168d1
04.2 Photo-proof tasks say so up front: done, 449168d1
04.3 The Proof screen has a finish: done, 449168d1
04.4 Your own post always shows in your feed: done, server part awaits deploy, 449168d1
04.5 Share card data is correct: done, 449168d1
04.6 Sticker set: done, 449168d1

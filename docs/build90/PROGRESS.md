# Build 90 progress

Cursor updates this file at the end of each chunk. Only Yaseen changes a status back to NOT STARTED.

| # | Chunk | Status | Commit | Notes |
|---|---|---|---|---|
| 01 | Speed | PASSED | 79fecc99 | Timings, Maestro, photo sizes, and the backend deploy are recorded in docs/reports/build90.md. tsc has the same 5 errors as a375b25a. |
| 02 | First day | PASSED | c92a7122 | Join sticks (no duo), finish opens first task, empty Home starter card, ring opens task, timer + Finished early?, How it works 3 lines. Evidence in docs/reports/build90.md. |
| 03 | Task inputs | PASSED | b2693fc3 | Workout chips + duration (distance only Cycling/Swim), pace and speed check with Save anyway, shared journal word rule client + server, counter cannot finish below target. SQL for seeded mismatch in docs/sql/build90.sql (run by Yaseen Oct 17). Backend deployed, /api/health commit 49f6ae0. Evidence in docs/reports/build90.md. |
| 04 | Posting and sharing | PASSED | 8b491178 | Post-or-private sheet after every task, Proof screen Done, own post in both feeds (cold relaunch, server-sourced), share card data, 4 sticker cards, Instagram Story as sticker on every card. Backend deployed with approval, /api/health commit 804ba49. 04.7: Day secured "Couldn't load" was a 429 from a request burst after a finish; cut client-side (one bootstrap refresh per finish, planner reads the bootstrap, feed asks for a page once), 100→74–79 requests per flow, 0 × 429, Day secured first try 5 runs in a row. 29 + 15 new tests, tsc same 5 baseline errors, Maestro post-choice + post-detail + chunk 01–03 flows exit 0. Evidence in docs/reports/build90.md. |
| 05 | Links and numbers | PASSED | 82475753 | Every person surface (feed, comments sheet, post screen, notifications, leaderboard, members, Discover, follow list) opens the profile through `userProfile()`; feed subject line and a per-challenge Home header open the challenge; notifications, comments and reactions drop is_test authors for real viewers (deployed, /api/health commit ea97ee1); Home, Profile and the challenge page count from the one bootstrap payload, hardcoded "days" pluralised. Found in the flows: a just-upgraded guest token kept `is_anonymous: true` so a new account could open nobody (session refresh after updateUser), notification avatar hidden from a11y (ListRow `interactiveIcon`). 9 + 3 + 2 new tests, tsc same 5 baseline errors, Maestro links + links-people + chunk 01–04 flows exit 0. Evidence in docs/reports/build90.md. |
| 06 | Words and small fixes | PASSED | 66765c0f | Definitions at the moment they happen (Day secured, first freeze, first self-reported, Strict/Standard on the Join sheet), "Self-reported" once per screen (Day secured, ask step, Join sheet row), greeting never `@user_xxxxxxxx`, feed hint clears the tab bar, Password label focuses the field, guest Save sheet no longer opens over Day secured and always offers Later, freeze result line every time, create step 1 double tap moves one step and the title stays on screen, login survives a reopen (401 → refresh once; failed profile read ≠ no profile). Five reported bugs: Save sheet dismiss, Day secured row under Done, water oz/cups (server deployed, /api/health commit 66765c0), double top padding on task steps, ConfirmDialog scrim. SQL for "Workout everyday" in docs/sql/build90.sql lines 76–104 (run by Yaseen Oct 17). 29 + 6 updated tests, tsc same 5 baseline errors, Maestro words-guest + words-account + chunk 01–05 flows exit 0. Evidence in docs/reports/build90.md. |
| 07 | Safety | PASSED | b61ab416 | Every public text field moderated server-side before any write, message names the field (username, display name, bio, challenge title/description, task title, journal prompt, location, routine, caption, comment); legacy create-profile goes through the server; Review step and both comment composers show the server's words. Dodge-proof normalizer (leet, accents, zero-width, spelled-out letters, repeats; whole-word so class/assess/Scunthorpe pass): 50 dodges + 56 clean words. Report a comment (same user_reports flow as posts, hidden at once on the phone and by the server). Journal privacy pinned by tests. Server deployed, /api/health commit b61ab41. 116 + 17 + 6 + 10 new tests, tsc same 5 baseline errors, Maestro safety + chunk 01–06 flows exit 0. No SQL. Evidence in docs/reports/build90.md. |
| 08 | Friend loop | PASSED | 6843ab3d, 541b7e58, 7e9cda24 | Invite link as visible text with Copy and Share on create-success, after the first secured day, and under "A board needs two" (`InviteLinkRow`). `griit://i/<id>` opens the challenge for another account and for a brand-new guest with no onboarding first (link is the key to an invite-only challenge), Join lands on the first task; two-account Maestro pair (A writes the link to a file, B opens it). Discover search by name or invite code; the exact code opens the challenge. Extra fixes asked for: `board_opt_in` true on every new enrollment (backfill SQL in docs/sql/build90.sql lines 106–127, run by Yaseen Oct 17 for non-test users only), duo waiting room from Discover (server starts the run when the seats fill, detail shows the waiting state), glued profanity (`fuckyou`, `shitface`; `class`, `assess` still clean). Found by the flows and fixed: Day secured invite block missing (`challenge_done` misread), first tap on a search result ate by the keyboard, link guest's stale onboarding stack entry, invite-only board cut to the viewer (server) and tab asking for friends-only scope (client). Server deployed, /api/health commit 541b7e5. New tests in lib/build90-friend-loop.test.ts, lib/invite-link.test.ts, lib/invite-code.test.ts, lib/discover-search.test.ts, backend/lib/start-waiting-room.test.ts, backend/trpc/routes/challenge-board-invite-only.test.ts and friend-loop.test.ts; full vitest the same 4 baseline failures; tsc the same 5 baseline errors. Maestro friend-loop A + B exit 0, chunk 01–07 flows exit 0 except post-detail (04), safety (07) and links-people pair 2 (05), which stop on Maestro scroll/splash timing with the cause and a de-flake written in docs/reports/build90.md. Follow-ups after chunk 09 (dee2f031, "## 08 follow-ups" in the report): those three flows de-flaked and exit 0, seeded duo rows hidden from Discover, glued compounds by exact list; the two server changes ship with the chunk 09 deploy. Evidence in docs/reports/build90.md. |
| 09 | Strava auto-detect | PASSED | 92c3a4c2 | Behind `FLAGS.STRAVA_AUTO_VERIFY` (off; server override env `STRAVA_AUTO_VERIFY`). `GET/POST /api/strava/webhook`: handshake echo, event acknowledged at once and processed in the background; a `create` activity completes the first matching Strava-verified task once (idempotent on `check_ins.external_activity_id`, fails closed), writes the unanswered post, secures the day when it was the last required task and the activity is today (`secure_day_for_user` SQL in docs/sql/build90.sql lines 129–174, run by Yaseen Oct 17; a missing RPC would log and skip), in-app + push "Strava run logged. Morning run is done for Day 2." that opens `/task/strava` with chunk 04's post-or-private sheet (`shareProof` takes an optional audience). Add-task sheet: "How it's verified" Self-reported / Verify with Strava only when the flag is on and Strava is connected; "Verified by Strava" once on the Home row and the feed card in place of Self-reported. 20 + 18 new tests, full vitest the same 4 baseline failures, tsc the same 5 baseline errors, chunk 01–08 test files 340/340. Backend NOT deployed: needs `railway up --service grit-backend` and the SQL first; registration curl (placeholders) in the report. No Connect Strava entry point exists in the app, so not shown in Maestro. Evidence in docs/reports/build90.md. |
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
06.4 Copy fixes: done, 66765c0f (feed hint); "Workout everyday" SQL written, run by Yaseen Oct 17
06.5 Password label focuses the field: done, 66765c0f
06.6 Guest Save your streak loop / Skip reaches Home: done, 66765c0f
06.7 Freeze feedback: done, 66765c0f (result line); harness flow 3750526c
06.8 Create step 1: done, 66765c0f
06.9 App Review login persists: done, 66765c0f
06.bugs Save sheet dismiss, Day secured row under Done, water oz/cups (server deployed 66765c0), double top padding, ConfirmDialog scrim: done, 66765c0f
07.1 Moderate every public text field server-side: done, b61ab416 (server deployed b61ab41)
07.2 Harder to dodge: done, b61ab416
07.3 Report a comment: done, b61ab416; follow-up (visible comment count, flow): done, 44e5fb55
07.4 Journal text never moderated, never returned to others: done (tests), b61ab416
08.1 Invite link visible (create-success, first secured day, A board needs two): done, 6843ab3d; Day secured block fix 541b7e58
08.2 Opening an invite (other account, fresh guest, Join → first task, two-account flow): done, 6843ab3d; link-guest stack fix 541b7e58
08.3 Discover search by name or invite code: done, 6843ab3d; result tap fix 541b7e58
08 extra: leaderboard board_opt_in set on enrollment + backfill SQL (lines 106–127, run by Yaseen Oct 17, non-test users only): done, 6843ab3d
08 extra: duo challenge waiting room from Discover: done, 6843ab3d
08 extra: glued profanity (fuckyou): done, 6843ab3d
08 follow-up: invite-only board shows its members (server cut 541b7e58, tab scope "everyone" + flow B board check): done, 7e9cda24
09.1 Webhook (handshake, idempotent completion, unanswered post, secure via secure_day_for_user; SQL run by Yaseen Oct 17): done, 92c3a4c2 (server deployed in chunk 01b)
09.2 Notification (in-app + push, /task/strava post-or-private, shareProof audience): done, 92c3a4c2
09.3 Task setting (Verify with Strava when connected, Verified by Strava on Home row + feed card): done, 92c3a4c2
09.4 Registering the webhook: curl with placeholders in docs/reports/build90.md, for Yaseen after the deploy, 92c3a4c2
08 follow-up: seeded catalog duo rows hidden from Discover until per-pair rooms exist (server, not deployed): done, dee2f031
08 follow-up: glued compounds by exact list (dumbass, jackass, dickhead, asshole, dumbfuck, motherfucker, bullshit; class/cockatoo/damnation/assess clean) (server, not deployed): done, dee2f031
08 follow-up: build90-post-detail, build90-safety, build90-links-people de-flaked, all three exit 0 (2026-10-17_111139/_111422/_111550): done, dee2f031

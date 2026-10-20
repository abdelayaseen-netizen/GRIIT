# Overnight report, build 92, 19–20 Oct 2026

App commit `aae65af3` (About shows it). TestFlight build number 92, internal group "Team (Expo)" (EAS build `306056bb`, submission `8a3358e0` finished 22:01 EDT on 19 Oct). Server `/api/health` commit `8ae6ad5` (no backend change in build 92 after it, so no redeploy). Simulator: GRIIT 16 Pro Max b92, iOS 26.4, Release build of the same commit (a TestFlight binary cannot be installed on a simulator); one simulator booted for the whole run. Harness: `feat/agent-testers` at `7840dd66` for the run, `05dbffa0` after (agents/src/build92.ts). Models: Claude Opus for the first-day group, Claude Sonnet for the rest; 60-step cap per session, $60 cost cap. Spend: 6.01 USD, 885 calls, 1773317 in, 116597 out.

Part 1 (first-day, social, history) ran 21:59–00:59 EDT; part 2 (Day 2, the next calendar day for the part 1 accounts) ran 01:05–01:29 EDT.

## Main number

**12 of 12 new users secured Day 1 (100%).** Build 90: 4 of 13 (31%). The database agrees: the Day 2 qualifier reads `last_secured_date_key`, and all 12 first-day accounts had secured the day before.

## Also

| Number | Value |
|---|---|
| Sessions | 29 (12 first-day, 2 history, 9 social in 3 groups of three, 6 Day 2) |
| First-day: started at Welcome | 12 of 12 |
| First-day: joined | 12 of 12 |
| First-day: task finished | 12 of 12 |
| First-day: photo | 1 of 12 (f-09; the rest picked self-reported tasks) |
| First-day: posted to friends | 8 of 12 |
| First-day: stopped on their own | 12 of 12 (16–25 steps, median 19.5; none hit the cap) |
| Day 2: secured again on the next day | 6 of 6 |
| Day 2: saw the streak and the freeze line | 6 of 6 |
| Social: invites accepted | 9 of 9 |
| Social: likes, double-taps, comments | 0, 0, 0 (see finding 3) |
| Median Done → post-or-private sheet | 949 ms (6 finishes; build 90: 752 ms) |
| Median sheet choice → task shows as done (Day 2) | 3.6 s (6 finishes) |
| Cold start through Maestro, median | 9.2 s first launch after install, 2.2 s on Day 2 |
| Would open tomorrow (median of 10) | 6 (build 90: 8) |
| Crashes | 0 |

## Targets (chunk 13.3, vs build 90)

| Target | Build 90 | Build 92 | Result |
|---|---|---|---|
| New users who secure Day 1: at least 70% | 4 of 13 | 12 of 12 (100%) | **hit** |
| Photo finishers reaching Home: 100% | about 6 of 11 | 1 of 1 (f-09: Day secured → Save your challenge → Home; no session saw the Proof screen) | hit, on one photo finisher only |
| Words understood: at least 60% | 29% | 51% (44 of 87 answers: Secured 26, Self-reported 17, Freeze 1, of 29 each) | **missed** |
| Social pairs with like, comment and profile: 3 of 4 | 0 of 3 | 0 of 3 (likes 0, comments 0; profiles opened in 2 groups) | **missed** (finding 3) |
| Cold start under 2 s | — | 9.2 s first launch after install, 2.2 s on Day 2, both through Maestro's launch | **missed as measured here**; this number includes Maestro's launch overhead, so the chunk 11 trace is the fairer measure |

Groups this run did not have, as scoped for this run: the finish-loop group (8, all task types), safety and edge (6), and the full sizes (25 first-day, 4 social pairs, 4 history). The harness's build 92 groups are 12 first-day, 3 social groups, 2 history and 6 Day 2.

## Read with this in mind

- The agents are models on a simulator, not people. Build 92's first-day group is Claude Opus and the rest Claude Sonnet; build 90 used Haiku 4.5. Part of the jump is the stronger model. The per-screen numbers (wasted taps, loops) are the fairer comparison; the Day 1 number is still the headline the build was asked to move.
- Groups are smaller than build 90's six chunks: 12 first-day personas (build 90 had 13 fresh), 3 social groups of three, 2 history, 6 Day 2. Build 90 had no Day 2 or history sessions; it had speed, task-type, safety and words chunks that build 92 does not run.
- Wasted taps include harness failures. Build 92's 72 wasted taps split into 64 harness (Maestro "Device became unreachable", empty or invalid model replies) and 8 app-side. Build 90's 163 split into 96 harness, 1 refused, 66 app-side (52 of those were re-taps of an already-selected radio on Start here). App-side only: **0.21 per screen visit in build 90, 0.02 in build 92.**
- Loops rose (2.20 → 3.10) because build 92 has the long social sessions: Social 5.4 per session, History 2.5, Day 2 2.3, first-day 1.8 (build 90 first-timers 2.4). The social b and c sessions hit the 60-step cap looking for a friend's post that the app does not show them (finding 3).
- "app bug" tags in `runner-part2-day2.md` (d-01…d-06), on h-01 and on s-02b are harness artifacts. The day check compares the screen with the stored `current_day`, but the app shows the calendar day (chunk 06), and yesterday's post card says "Day 1 of 7". Every flagged screen was right.
- The "Day 0 of 1" text from Blake's 12b dry run was the harness, not the app: its day regex read "Today" + "0 of 1 done" (Home's done count) as "Day 0 of 1". Fixed in the harness (`d179cba9`, with a test); the app cannot show "Day 0" (`docs/reports/build92.md` 13.0).
- Words: "Rest" is not a word the app uses and the exit interview does not ask it, so it reads "not asked" in both builds.
- The `device` string in result.json says "GRIIT iPhone 16"; that is a stale label in the harness. The run used the Pro Max above.

## Build 90 vs build 92

| | Build 90 (Oct 17) | Build 92 (Oct 19–20) |
|---|---|---|
| Day 1 secured, new users | 4 of 13 (31%) | **12 of 12 (100%)** |
| Loops per session (3+ steps in a row on one screen) | 2.20 (40 sessions) | 3.10 (29 sessions) |
| Wasted taps per screen visit | 0.51 (163 of 321 visits) | 0.15 (72 of 488 visits) |
| … app-side only | 0.21 (67 of 321) | 0.02 (8 of 488) |
| Words understood: Secured | 18 of 40 (45%) | 26 of 29 (90%) |
| Words understood: Self-reported | 13 of 40 (33%) | 17 of 29 (59%) |
| Words understood: Freeze | 4 of 40 (10%) | 1 of 29 (3%) |
| Words understood: Rest | not asked | not asked (no "Rest" word in the app) |
| Sessions with a crash | 0 of 40 | 0 of 29 |
| Cost | $2.31 (1005 calls) | $6.01 (885 calls) |

Loops by group, build 92: first-day 1.8, Day 2 2.3, History 2.5, Social 5.4.

Most wasted taps, build 90: start here 59 (13 visits); journal today 12 (5); all challenges 10 (1); read 10 pages 10 (1); auth 10 (3).
Most wasted taps, build 92: discover 25 (12 visits); pick goals 17 (10); home 12 (99); challenge 3 (6); add a task 3 (6). Discover and pick goals are almost all "Device became unreachable" during a search-field type or a goal tap.

Freeze, read strictly: 1 of 29. Nearly every answer was "never explained". In build 92 a freeze is explained when one is earned (day 7) and otherwise only in the grey Join-sheet line "A freeze can cover a missed day", so a person on day 1–2 has not been told. Read by hand, h-02 and s-03c (and arguably one Day 2 answer) are right, which makes it about 3 of 29. Either way it is lower than build 90, where Start here repeated the freeze line three times on one screen (that repeat was the copy fix).

Files: `screens.csv` (one row per screen visit), `steps-all.csv` (one row per step) and `compare.md` are in this folder, and the same two CSVs were regenerated for `oct-build90/` by `agents/src/build92-compare.ts` so the numbers come from one script.

## What the screenshots show

Paths are under `docs/reports/oct-build92/`; cited frames are in `evidence/` (full `shots/` folders stay on this Mac). App code was not changed for any of these, because build 92 had already shipped; each is listed in `BUGS.md` for Yaseen.

1. **After Join on Start here, 3 of 12 new users got "Couldn't reach GRIIT. Retry" with a blank button** (f-07 step 6, f-11 step 9, f-12 step 8; `evidence/01-retry-blank-pill-f-07-006.png`). Retry worked every time, and the next screen was the task. Two problems: (a) the button label is invisible, because `authRetryButton` and `authRetryButtonText` in `app/_layout.tsx` (lines 551–562) are both `DS_V3.color.textPrimary`, white on white, and has been since Oct 3 (`84822648`), so build 91 has it too; (b) the root profile check failed for a user this device did not know yet, which shows the full-screen retry. In build 90 it happened once in 40 sessions. Steps: fresh install → Welcome → goals → How it works → Start here → Join.

2. **Opening a friend's running challenge from their profile always says "Challenge did not load"** (s-01c steps 18–20 and 30, s-03c steps 38–45; `evidence/02-visitor-challenge-did-not-load-s-01c-020.png`). Steps: another person's profile → "Challenges, badges and stats" → tap a running challenge. `app/profile/record.tsx` line 143 pushes `ROUTES.CHALLENGE_ACTIVE(row.id)` for active rows, and on a visitor's record `row.id` is the other person's enrollment, which the viewer cannot load; Retry cannot fix it. In s-03c it was Kim's own challenge, seen through Jun's profile. Visitors should go to `ROUTES.CHALLENGE_ID(row.challengeId)`. From chunk 07.4.

3. **An invited friend cannot see the inviter's post anywhere**, which is why the 9 social sessions made 0 likes and 0 comments. The inviter's first post defaults to Friends; a Friends post shows only in the Following scope, to followers (`lib/post-audience.ts` `audienceShowsInScope`); accepting an invite does not create a follow; and the shared challenge's Recent proofs said "No shared proofs in this challenge yet" to co-members (s-01b steps 1–14, `evidence/05-invitee-no-post-s-01b-005.png`; same in s-02b and s-03b, which then hit the 60-step cap). Product decision: show Friends posts to co-members of the challenge, or follow on accept.

4. **Profile has no tiles for self-reported posts.** h-01 (25 shared self-reported posts) sees "No shared proofs yet" (`evidence/03-profile-no-self-reported-tiles-h-01-002.png`). The build 92 design's `ProofGrid.tsx` draws a "Self-reported" tile when a post has no photo, and the app's `ProfileProofs` can draw one, but the server drops them: `cameraProofTiles` in `backend/lib/proof-predicate.ts` ("self-reported days emit nothing") and `proofsAfterSign` (a tile with no image is removed). Already noted as seen in build 91 under chunk 01; still open against 07.3.

5. **Minor: a tap in the strip under a sheet's footer button closes the sheet and loses the draft.** `components/ds/Sheet.tsx` gives the panel `pointerEvents="box-none"`, so a tap on the panel outside its scroll body and buttons goes through to the full-screen Close scrim. Reproduced on the Pro Max: Add a task → type a name → tap 55%,97% → sheet gone (`docs/reports/build92/13/add-task/`). A tap on the heading or in the body keeps it open, and closing the keyboard keeps it open with the name (`.maestro/build92-13-add-task-keyboard.yaml` passes). The 3 social "a" sessions lost the sheet this way because the harness aimed at the "e.g. Read 10 pages" text in the clipped On Home preview at the bottom of the sheet instead of the Task name field (s-01a step 9, `evidence/04-add-task-sheet-s-01a-009.png` → `-closed-…-010.png`). So: harness aim, plus a small real dismiss target.

6. **Leaderboard screenshots show grey placeholders while the hierarchy already has the names** (d-03 step 30, d-04 step 14, s-01c step 16, s-03c step 12). Possibly screenshot timing; not verified. Low.

Harness, not product (fixed on `feat/agent-testers`): the "Day 0 of 1" regex (`d179cba9`); on Day 2 Home a "Done" tap opened yesterday's post because the target matcher picked the largest prefix match (the feed card) over the 100-score button (`05dbffa0`, with a test); the back action is a swipe at y = 50%, which on Show Up 7 pressed the full-width task row and sent s-01b into the camera (not fixed; noted); "Device became unreachable" on Maestro types (64 wasted taps).

## Day 2

| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Steps |
|---|---|---|---|---|---|
| d-01 Tess | 2026-10-20 | yes | yes | yes | 16 |
| d-02 Omar | 2026-10-20 | yes | yes | yes | 17 |
| d-03 Lena | 2026-10-20 | yes | yes | yes | 31 |
| d-04 Raj | 2026-10-20 | yes | yes | yes | 16 |
| d-05 Ivy | 2026-10-20 | yes | yes | yes | 17 |
| d-06 Sam | 2026-10-20 | yes | yes | yes | 46 |

## Social

| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens | Steps |
|---|---|---|---|---|---|---|
| s-01a Alex (creator) | yes | 0 | 0 | 0 | 0 | 22 |
| s-01b Blake | yes | 0 | 0 | 0 | 0 | 60 (cap) |
| s-01c Alex (return) | yes | 0 | 0 | 0 | 6 | 60 (cap) |
| s-02a Dana | yes | 0 | 0 | 0 | 0 | 22 |
| s-02b Femi | yes | 0 | 0 | 0 | 0 | 60 (cap) |
| s-02c Dana (return) | yes | 0 | 0 | 0 | 0 | 60 (cap) |
| s-03a Kim | yes | 0 | 0 | 0 | 0 | 23 |
| s-03b Jun | yes | 0 | 0 | 0 | 1 | 60 (cap) |
| s-03c Kim (return) | yes | 0 | 0 | 0 | 2 | 60 (cap) |

## History

The seeded account (Priya's private No Days Off, 75 days, a 33-day streak) checked Home against Profile. Both sessions read Streak 33, Best 33, 33 days secured, "33 of 34 days secured" in Stats, and "No Days Off · Day 35 of 75" on Home. They called Day 35 against 33 secured a mismatch; it is not: Day 35 is today's calendar day (chunk 06), and 33 of the 34 days before it were secured. The seed's `profiles.total_days_secured` stayed 0 and freezes stayed 1 (the `profiles_preserve_server_columns` trigger, `docs/reports/build92.md` 13.0); Profile still showed 33 because it reads `user_stats` from `day_secures`. Both found no posts on Profile (finding 4).

## Sessions

`runner-part1.md` (first-day, social, history) and `runner-part2-day2.md` (Day 2) have the per-session ends, tags and quiz lines as the runner wrote them; `runner-part1-summary.json` and `runner-part2-summary.json` are the machine-readable form. Each session folder has `persona.json`, `result.json`, `steps.jsonl`, `interview.json` and `spend.json`.

## Cost

6.01 USD of the 60 USD cap: part 1 5.18 (734 calls), Day 2 0.83 (151 calls). `spend.txt`.

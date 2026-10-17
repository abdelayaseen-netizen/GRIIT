# Overnight report, build 90, 17 Oct 2026

App commit `5d3de5b` (About shows it). TestFlight build number 91, internal group "Team (Expo)". Server `/api/health` commit `0d36821`. Simulator: GRIIT iPhone 16, iOS 26.4, Release build of the same commit (a TestFlight binary cannot be installed on a simulator). Harness: `feat/agent-testers` (agents/src/build90.ts). Spend: 2.31 USD, 1005 calls, 1717539 in, 118945 out.

## Main number

**4 of 13 fresh personas reached Day secured (31%).** Oct 15 baseline: about 10 of 38 (26%).

## Also

| Number | Value |
|---|---|
| Sessions | 40 |
| Joined | 33 (83%) |
| First task opened | 10 (25%) |
| Task finished | 21 (53%) |
| Photo | 11 (28%) |
| Median Done → post-or-private sheet | 752 ms (13 finishes) |
| Median sheet choice → task shows as done | 2559 ms (11 finishes) |
| Median photo post (Post to friends → done marker) | — |
| Concept score (exit interview) | 29% of 40 interviews × 3 words |
| Would open tomorrow (median of 10) | 8 |
| Fresh personas that started at Welcome | 13 of 13 (Oct 15: 7 of 38) |
| Sessions under 15 steps, not a crash | 0 (Oct 15: 11 ended early) |
| Ended on a repeated screen (after 15 steps) | 34 (Oct 15: 26) |
| Stopped on their own (after 15 steps) | 3 |
| Crashes | 0 |

## Read with this in mind

- The agents are Haiku 4.5 on a simulator, not people. A photo finish uses the simulator camera, which returns a stand-in image, and they refused to type the rude words the safety personas were given (p5-01: 10 empty replies, p5-04: 1 empty replies). The server-side filter itself is covered by chunk 07's vitest and the build90-safety Maestro flow, not by this run.
- "Ended on a repeated screen" counts sessions the harness stopped after 15 steps because the same screen came back three times. 34 of 40 here. It is a harness stop rule as much as a product signal; read the per-session rows before treating it as a dead end.
- Done timing: Done → sheet is measured on every self-reported finish (13). Choice → done marker is only counted when the marker showed inside the 20 s watch window (11); "only after more taps" rows mean the agent left the screen before the marker was seen, not that the app was slow.
- Day-number check: 0 real mismatches. The 202 raw entries in result.json are "Day 1 on screen, current_day 2 stored" on a secured day, which is lib/challenge-day.ts displayDay (current_day points at tomorrow once today is secured); they are dropped when the report reads the runs.
- Offline (p5-06) was not applied: no network conditioner on this Mac's simulator. p5-06 ran as a normal post.

## Scorecard

Overall **6.5** (product loop, onboarding and data integrity weighted double, as on 12 and 14 Oct; 14 Oct was 5.2). Scores are rules from the numbers in this run; the why column says which.

| # | Category | Score | Why |
|---|---|---|---|
| 1 | Product loop | 7 | 21 of 40 finished a task, 11 with a photo. |
| 2 | UX and onboarding | 6 | 4 of 13 fresh personas reached Day secured; 13 of 13 started at Welcome. |
| 3 | Frontend | 6 | Done → sheet median 752 ms; 34 sessions ended on a repeated screen after 15 steps. |
| 4 | Backend | 8 | 0 crashes; server /api/health 0d36821; 429s and server errors are in the per-step errors below if any. |
| 5 | Data integrity | 8 | 0 day-number mismatches between the screen and the database (a secured day showing current_day − 1 is the app's displayDay rule and is not counted). |
| 6 | Performance | 4 | Median sheet choice → done marker 2559 ms; photo post —. Release build on the simulator; measured by polling the view hierarchy (one poll ≈ 0.5–1 s, so read ± 1 s). Done → sheet 752 ms is the pure UI step. |
| 7 | Reliability | 8 | 0 of 40 sessions hit a launch or step crash. |
| 8 | Security and privacy | 5 | 0 of 6 safety personas saw a blocked-word message; 2 typed a rude word (p5-02, p5-03), 0 submitted it to the server. Not measured in this run; the filter is covered by chunk 07 tests. is_test on every account. |
| 9 | Tests | 7 | Chunk 01–09 vitest files 469/469 in one run; full vitest the 4 baseline failures only; tsc 5 baseline errors. |
| 10 | Words (concept) | 4 | Concept score 29%: secured 18, freeze 4, self-reported 13 of 40. |

## What the screenshots show

Read from the screenshots, not the numbers. Paths are under `docs/reports/oct-build90/`; the cited frames are copied into `evidence/` (every session's full `shots/` folder stays on this Mac, not in git). App code was not changed for any of these (chunk 10 rule); each is for Yaseen to pick up.

1. **After a photo post, the Proof screen traps the person.** Day secured → Close lands on `app/post/[id]` ("Proof"). The back chevron does nothing (`router.back()` with nothing behind it after the replace), and the Done button sits under the comment composer until the list is scrolled (`evidence/01-proof-trap-p4-01b-006.png`, `-013.png`: six back taps, same screen; the orange edge at the bottom is the hidden Done). 5 of the 11 photo sessions ended here: p1-02, p2-06, p3-02, p4-01b, p4-02b. This is the biggest single reason photo finishers did not continue.

2. **Onboarding can hand a brand-new person a task that is already closed.** p2-10 (Elena, fresh, 4:39 pm) picked "Daily habits"; Start here pre-selected Early Riser 7, whose task "Up and out of bed" has a 12:00–6:30 am window. Day 1 cannot be secured. The app says so in two places that disagree: the task flow shows "Window closed at 6:30 am. Today is not secured." (`evidence/02-window-closed-p2-10-018.png`) while Home shows "Couldn't save. Tap to try again." under the streak card (`evidence/02-couldnt-save-p2-10-019.png`), a retry that can never succeed today. Suggest: do not pre-select a windowed challenge when the window is closed, and give the rollback line the real reason.

3. **Home can show "Day secured. See you tomorrow." and "Day 1 is today. Finish the task to secure it." on the same screen**, with the Day 1 ring empty while "1 day in a row" and "1 of 1 done" are shown (`evidence/03-home-disagrees-p1-01-006.png`, `-008.png`, three steps, about a minute). Other secured Homes are consistent (`evidence/03-home-consistent-p5-06-021.png`: ring ticked, one caption). Looks like the streak card and the Today caption come from different cache keys and one did not refresh after the finish (chunk 05.4 territory).

4. **Create step 1 says "Looks good" under a title the server will reject.** p5-03 typed "shit list"; the inline hint under the field read "Looks good 9/60" (`evidence/04-looks-good-p5-03-004.png`). The server check runs at Review/create (chunk 07) and the agent never got there, so the filter itself was not exercised in this run; the hint is the finding.

5. **The last goal cards on "What are you building?" sit under the docked button.** "Faith and prayer" is the seventh card; its visible part is behind "Pick at least one" (`evidence/05-goal-under-footer-p2-07-006.png`). p2-07 tapped it twelve times and never selected it; a scroll did not reveal it either. Add bottom padding equal to the footer so every card can be reached.

6. **Create step 1 keeps the keyboard up, with Solo/Group under it.** p4-01a typed the title and then could not reach "Group" (59 taps; `evidence/06-keyboard-solo-group-p4-01a-010.png`, Continue docked above the keyboard, Solo/Group below). A person would dismiss the keyboard; the agent did not. Low priority, but the toggle is invisible at the moment the person needs it.

7. **Counter task caps at the goal with no word about it.** "Read 10 pages": at 10 of 10, Add one / +5 / +10 dim and do nothing (`evidence/07-counter-cap-p3-04-007.png`). p3-04 and p3-05 wanted to log 12 and 15 and stopped there instead of tapping "Done · 10 pages". A one-line "Goal reached, Done saves it" would do.

8. **Words.** 40 interviews: secured 18 right, freeze 4, self-reported 13. Nobody who did not open a challenge detail or the Start here cards had seen a freeze explained; the Start here cards repeat "Missed a day? A freeze holds your streak. You earn one every 7 days in a row." three times on one screen (`evidence/08-start-here-freeze-x3-p2-09-007.png`), which is the same copy-repeat pattern 06.2 removed for "Self-reported".

Harness, not product (fixed on `feat/agent-testers` where it could be): typing into the journal field failed after the first sentence (p2-01, p2-04, p3-06, p3-08: "inputView" not found; Maestro cannot append to a focused multiline field by label); the model would not type the rude words (p5-01); "radio button" as a target resolves to the first card (p2-09); Done timings that showed up only after more taps are dropped (see "Read with this in mind").

## Chunks

### 1-speed: Speed

6 sessions. Build 90, GRIIT iPhone 16 simulator.

### Funnel

| Step | Count |
|---|---|
| Joined | 6 |
| First task opened | 2 |
| Task finished | 6 |
| Photo | 2 |
| Day secured seen | 6 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 14 |

### Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p1-01 Dev | 7K STEPS | 752 ms | Keep it private | 2370 ms | Day secured |
| p1-02 Mia | Proof | 767 ms | — | — | not seen |
| p1-03 Leo | post-choice-sheet | — | — | 1596 ms | 1 of 1 done |
| p1-04 Ana | 10 PAGES A DAY | 747 ms | — | 7338 ms | 1 of 1 done |
| p1-05 Noor | Journal Today · finished | — | — | — | day secured only after more taps (> 20 s) |
| p1-06 Ray | Proof | 770 ms | — | — | day secured only after more taps (> 20 s) |

Median Done → sheet: 760 ms. Median choice → done marker: 2370 ms. Median photo post (Post to friends → done marker): —.

### Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p1-01 Dev | 1-speed | home | 18 | opened → home → challenge → joined → completed | Gave up. home repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join 7K Steps; home: Failed to run flow: Element not found: Text matching regex: home-done-ope |
| p1-02 Mia | 1-speed | home | 16 | opened → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. |  |
| p1-03 Leo | 1-speed | home | 22 | opened → home → joined → task → completed | Gave up. home repeated 3 times. | task: Failed to run flow: Element not found: Text matching regex: Join Breathe 1 Min; home: Failed to run flow: Element not found: Text matching regex: See the  |
| p1-04 Ana | 1-speed | home | 18 | opened → home → challenge → joined → completed | Agent stopped on their own. | other: Failed to run flow: Element not found: Text matching regex: Join 10 Pages a Day |
| p1-05 Noor | 1-speed | home | 21 | opened → home → joined → task → completed | Gave up. home repeated 3 times. | home: Home is already selected. |
| p1-06 Ray | 1-speed | home | 18 | opened → home → discover → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. |  |


### 2-first-day: First day

12 sessions. Build 90, GRIIT iPhone 16 simulator.

### Funnel

| Step | Count |
|---|---|
| Joined | 10 |
| First task opened | 4 |
| Task finished | 5 |
| Photo | 1 |
| Day secured seen | 4 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 8 |

### Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p2-02 Amina | post-choice-sheet | — | — | 2411 ms | Day secured |
| p2-02 Amina | Proof | — | — | — | Day secured only after more taps (> 20 s) |
| p2-03 Robert | Proof | — | — | — | Day secured only after more taps (> 20 s) |
| p2-06 Sam | Proof | 734 ms | — | — | not seen |
| p2-10 Elena | Proof | — | — | — | 1 of 2 done only after more taps (> 20 s) |
| p2-12 Grace | Proof | — | — | — | Day secured only after more taps (> 20 s) |

Median Done → sheet: 734 ms. Median choice → done marker: 2411 ms. Median photo post (Post to friends → done marker): —.

### First day

Started at Welcome: 12 of 12.

| Persona | Started on | Joined | First task | Day secured | Steps | Ended |
|---|---|---|---|---|---|---|
| p2-01 Jordan | welcome | yes | yes | no | 16 | Gave up. other repeated 3 times. |
| p2-02 Amina | welcome | yes | no | yes | 21 | Agent stopped on their own. |
| p2-03 Robert | welcome | yes | no | yes | 45 | Gave up. home repeated 3 times. |
| p2-04 Casey | welcome | yes | yes | no | 16 | Gave up. other repeated 3 times. |
| p2-05 Priya | welcome | yes | yes | no | 26 | Gave up. other repeated 3 times. |
| p2-06 Sam | welcome | yes | no | no | 16 | Gave up. challenge repeated 3 times. |
| p2-07 Yusuf | welcome | no | no | no | 16 | Gave up. onboarding repeated 3 times. |
| p2-08 Helen | welcome | yes | yes | no | 21 | Gave up. other repeated 3 times. |
| p2-09 Marcus | welcome | no | no | no | 43 | Gave up. onboarding repeated 3 times. |
| p2-10 Elena | welcome | yes | no | yes | 60 | Hit the 60-step cap. |
| p2-11 Tom | welcome | yes | no | no | 18 | Gave up. challenge repeated 3 times. |
| p2-12 Grace | welcome | yes | no | yes | 39 | Gave up. home repeated 3 times. |

### Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p2-01 Jordan | 2-first-day | welcome | 16 | opened → joined → task | Gave up. other repeated 3 times. | onboarding: radio button is already selected.; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p2-02 Amina | 2-first-day | welcome | 21 | opened → home → challenge → joined → completed → shared | Agent stopped on their own. | onboarding: radio button is already selected. |
| p2-03 Robert | 2-first-day | welcome | 45 | opened → home → challenge → joined → completed → shared | Gave up. home repeated 3 times. | onboarding: radio button is already selected. |
| p2-04 Casey | 2-first-day | welcome | 16 | opened → joined → task | Gave up. other repeated 3 times. | onboarding: radio button is already selected.; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p2-05 Priya | 2-first-day | welcome | 26 | opened → challenge → joined → task | Gave up. other repeated 3 times. | challenge: radio button is already selected.; challenge: Failed to run flow: Element not found: Text matching regex: 20%,307 |
| p2-06 Sam | 2-first-day | welcome | 16 | opened → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. | onboarding: radio button is already selected. |
| p2-07 Yusuf | 2-first-day | welcome | 16 | opened | Gave up. onboarding repeated 3 times. |  |
| p2-08 Helen | 2-first-day | welcome | 21 | opened → joined → task | Gave up. other repeated 3 times. | onboarding: radio button is already selected.; onboarding: Failed to run flow: Element not found: Text matching regex: Joining... |
| p2-09 Marcus | 2-first-day | welcome | 43 | opened | Gave up. onboarding repeated 3 times. | onboarding: radio button is already selected.; onboarding: Failed to run flow: Element not found: Text matching regex: 413,602 |
| p2-10 Elena | 2-first-day | welcome | 60 | opened → home → challenge → joined → completed → shared | Hit the 60-step cap. | onboarding: radio button is already selected.; other: fetch failed |
| p2-11 Tom | 2-first-day | welcome | 18 | opened → challenge → joined | Gave up. challenge repeated 3 times. | onboarding: radio button is already selected.; onboarding: Failed to run flow: Element not found: Text matching regex: Get to the gym |
| p2-12 Grace | 2-first-day | welcome | 39 | opened → home → challenge → joined → completed → shared | Gave up. home repeated 3 times. | onboarding: radio button is already selected. |


### 3-task-types: Task types

10 sessions. Build 90, GRIIT iPhone 16 simulator.

### Funnel

| Step | Count |
|---|---|
| Joined | 10 |
| First task opened | 3 |
| Task finished | 5 |
| Photo | 5 |
| Day secured seen | 5 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 26 |

### Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p3-01 Ivy | 7K STEPS | 717 ms | Keep it private | — | Day secured only after more taps (> 20 s) |
| p3-01 Ivy | Close | — | — | — | not seen |
| p3-02 Omar | Proof | 728 ms | — | — | not seen |
| p3-03 Bea | Close | — | — | — | Day secured only after more taps (> 20 s) |
| p3-03 Bea | Proof | 861 ms | — | — | not seen |
| p3-09 Ruth | QUICK STEPS | 741 ms | Keep it private | 1625 ms | 1 of 1 done |
| p3-09 Ruth | Close | — | — | — | not seen |
| p3-10 Eli | Proof | 758 ms | — | 19827 ms | day secured |

Median Done → sheet: 741 ms. Median choice → done marker: 10726 ms. Median photo post (Post to friends → done marker): —.

### Task types

| Persona | Task | Finished | Nonsense caught | Post choice seen | Ended |
|---|---|---|---|---|---|
| p3-01 Ivy | e44f0001-4000-4000-8000-000000000002 | yes | no | yes | Gave up. other repeated 3 times. |
| p3-02 Omar | b2000001-4000-4000-8000-000000000001 | yes | yes | yes | Gave up. challenge repeated 3 times. |
| p3-03 Bea | b2000001-4000-4000-8000-000000000005 | yes | yes | yes | Gave up. challenge repeated 3 times. |
| p3-04 Kofi | e44f0001-4000-4000-8000-000000000006 | no | yes | no | Gave up. other repeated 3 times. |
| p3-05 Zara | e44f0001-4000-4000-8000-000000000006 | no | no | no | Gave up. other repeated 3 times. |
| p3-06 Nate | b2000001-4000-4000-8000-000000000004 | no | yes | no | Gave up. other repeated 3 times. |
| p3-07 Lina | search | no | no | no | Gave up. challenge repeated 3 times. |
| p3-08 Hugo | b2000001-4000-4000-8000-000000000004 | no | yes | no | Gave up. other repeated 3 times. |
| p3-09 Ruth | b2000001-4000-4000-8000-000000000002 | yes | no | yes | Gave up. challenge repeated 3 times. |
| p3-10 Eli | e44f0001-4000-4000-8000-000000000001 | yes | no | yes | Agent stopped on their own. |

### Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p3-01 Ivy | 3-task-types | home | 29 | opened → home → discover → challenge → joined → completed → photo | Gave up. other repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Close; discover: For you is already selected. |
| p3-02 Omar | 3-task-types | home | 18 | opened → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. | challenge: Failed to run flow: Element not found: Text matching regex: Join Drink Water Today |
| p3-03 Bea | 3-task-types | home | 20 | opened → home → discover → challenge → joined → task → completed → photo → shared | Gave up. challenge repeated 3 times. | other: Stopping was refused: 6 of the 15 actions owed. Keep going. |
| p3-04 Kofi | 3-task-types | home | 19 | opened → joined | Gave up. other repeated 3 times. |  |
| p3-05 Zara | 3-task-types | home | 18 | opened → joined | Gave up. other repeated 3 times. | other: Failed to run flow: Element not found: Text matching regex: inputView |
| p3-06 Nate | 3-task-types | home | 17 | opened → joined → task | Gave up. other repeated 3 times. | task: Failed to run flow: Element not found: Text matching regex: Join Journal Today; other: Failed to run flow: Element not found: Text matching regex: inputVi |
| p3-07 Lina | 3-task-types | home | 22 | opened → home → discover → challenge → joined | Gave up. challenge repeated 3 times. |  |
| p3-08 Hugo | 3-task-types | home | 16 | opened → joined → task | Gave up. other repeated 3 times. | other: Failed to run flow: Element not found: Text matching regex: inputView; other: Failed to run flow: Element not found: Text matching regex: space |
| p3-09 Ruth | 3-task-types | home | 49 | opened → home → discover → challenge → joined → completed → photo | Gave up. challenge repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join Quick Steps; discover: For you is already selected. |
| p3-10 Eli | 3-task-types | home | 19 | opened → home → discover → challenge → joined → completed → photo → shared | Agent stopped on their own. | challenge: Failed to run flow: Element not found: Text matching regex: Join Show Up 7 |


### 4-social: Social

6 sessions. Build 90, GRIIT iPhone 16 simulator.

### Funnel

| Step | Count |
|---|---|
| Joined | 4 |
| First task opened | 0 |
| Task finished | 3 |
| Photo | 3 |
| Day secured seen | 3 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 8 |

### Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p4-01b Blake | Proof | 771 ms | — | — | not seen |
| p4-02b Femi | Proof | 741 ms | — | — | not seen |
| p4-03b Jun | Proof | — | — | 3618 ms | Day secured |
| p4-03b Jun | Proof | 753 ms | — | — | not seen |

Median Done → sheet: 753 ms. Median choice → done marker: 3618 ms. Median photo post (Post to friends → done marker): —.

### Social

| Pair | Invite visible (A) | B joined A's challenge | B opened a profile | B liked | B commented |
|---|---|---|---|---|---|
| p4-01a / p4-01b | no | yes | no | no | no |
| p4-02a / p4-02b | yes | yes | no | no | no |
| p4-03a / p4-03b | yes | yes | no | no | no |

### Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p4-01a Alex | 4-social | home | 60 | opened → home | Hit the 60-step cap. |  |
| p4-01b Blake | 4-social | home | 16 | opened → home → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. |  |
| p4-02a Dana | 4-social | home | 60 | opened → home | Hit the 60-step cap. |  |
| p4-02b Femi | 4-social | home | 17 | opened → home → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. |  |
| p4-03a Kim | 4-social | home | 17 | opened → home → joined | Gave up. other repeated 3 times. |  |
| p4-03b Jun | 4-social | home | 21 | opened → home → discover → challenge → joined → completed → photo → shared | Gave up. challenge repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join Gym before work |


### 5-safety-edge: Safety and edge

6 sessions. Build 90, GRIIT iPhone 16 simulator.

### Funnel

| Step | Count |
|---|---|
| Joined | 3 |
| First task opened | 1 |
| Task finished | 2 |
| Photo | 0 |
| Day secured seen | 2 |
| Sessions under 15 steps (not a crash) | 0 |
| Early stops refused by the harness | 8 |

### Done to visible

| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |
|---|---|---|---|---|---|
| p5-02 Vic | post-choice-sheet | — | — | 2054 ms | Day secured |
| p5-02 Vic | Proof | — | — | 3864 ms | Day secured |
| p5-06 Felix | post-choice-sheet | — | — | 2899 ms | Day secured |
| p5-06 Felix | Proof | — | — | 2559 ms | Day secured |

Median Done → sheet: —. Median choice → done marker: 2729 ms. Median photo post (Post to friends → done marker): —.

### Safety and edge

| Persona | Check | Blocked message seen | Reached Home | Ended |
|---|---|---|---|---|
| p5-01 Rae | Open Profile, then Edit profile. Change the username to shit… | no | yes | Gave up. auth repeated 3 times. |
| p5-02 Vic | Open the challenge the app shows you, join it, finish today'… | no | yes | Gave up. other repeated 3 times. |
| p5-03 Tess | Open Create and start a new challenge titled shit list with … | no | yes | Gave up. other repeated 3 times. |
| p5-04 Reed | Tap I already have an account and log in with your email and… | no | no | Gave up. other repeated 3 times. |
| p5-05 Guest | Finish onboarding and the first task as a guest. When the ap… | no | no | Gave up. other repeated 3 times. |
| p5-06 Felix | Open the challenge the app shows you, join it, finish today'… | no | yes | Gave up. home repeated 3 times. |

Offline was not applied: this Mac has no simulator network conditioner wired up (agents/src/device.ts applyPrivacy).

### Sessions

| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |
|---|---|---|---|---|---|---|
| p5-01 Rae | 5-safety-edge | home | 17 | opened → home → discover | Gave up. auth repeated 3 times. | auth: Failed to run flow: Element not found: Text matching regex: @ap501mvcxxykd; auth: model reply was not valid JSON |
| p5-02 Vic | 5-safety-edge | home | 17 | opened → home → challenge → joined → completed → shared | Gave up. other repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join 7K Steps; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p5-03 Tess | 5-safety-edge | home | 26 | opened → home | Gave up. other repeated 3 times. |  |
| p5-04 Reed | 5-safety-edge | welcome | 17 | opened | Gave up. other repeated 3 times. | other: model reply was not valid JSON |
| p5-05 Guest | 5-safety-edge | welcome | 17 | opened → joined → task | Gave up. other repeated 3 times. | onboarding: radio button is already selected.; other: Failed to run flow: Element not found: Text matching regex: inputView |
| p5-06 Felix | 5-safety-edge | home | 21 | opened → home → challenge → joined → completed → shared | Gave up. home repeated 3 times. | home: Failed to run flow: Element not found: Text matching regex: Join 7K Steps; home: Failed to run flow: Element not found: Text matching regex: Close |


### 6-words: Words

Exit interview, asked of every persona at the end of the session. 40 of 40 answered.

| Word | Right | Wrong | Share right |
|---|---|---|---|
| Secured | 18 | 22 | 45% |
| Freeze | 4 | 36 | 10% |
| Self-reported | 13 | 27 | 33% |

Concept score: 29% (right answers over three words × 40 people). Would open tomorrow: median 8 of 10 (40 gave a number).

Scoring rules are in agents/src/interview.ts: secured = every task of the day done so the day counts; freeze = a missed day that does not break the streak; self-reported = marked done by the person, no proof.

### Answers

| Persona | Chunk | Secured | Freeze | Self-reported | Tomorrow |
|---|---|---|---|---|---|
| p1-01 Dev | 1-speed | right: Day secured means you've completed your daily goal (7,000 steps) and locked in your progress for that day. | wrong: The app never explained what a freeze is. | right: Self-reported means you manually logged or confirmed the 7,000 steps yourself rather than it being automatical | 9 - I like watching the number move and the streak counter is satisfying; I want |
| p1-02 Mia | 1-speed | right: Day secured means you've completed the daily challenge requirement and locked in your progress for that day. | wrong: The app never explained what a freeze is on the screens I saw. | wrong: The app never explained what self-reported means on the screens I saw. | 8 - I like tracking my habits visually and sharing proof with friends, plus the  |
| p1-03 Leo | 1-speed | right: Day secured means you completed your daily breathing challenge and have maintained your 1-day streak. | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 8, because the one-minute breathing exercise is quick, manageable, and the strea |
| p1-04 Ana | 1-speed | right: Day secured means you completed your daily task (reading 10 pages) and locked in your progress for the day. | wrong: The app never explained what a freeze is on the screens I saw. | wrong: The app never explained what self-reported means on the screens I saw. | 8. I enjoyed tracking my reading habit and seeing the streak counter motivate me |
| p1-05 Noor | 1-speed | right: Day secured means you've completed your daily goal and won't lose your streak, with confirmation to return tom | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 9 - I enjoy tracking my journal streak and the satisfying feeling of securing an |
| p1-06 Ray | 1-speed | right: A day is secured when you have submitted photo proof of completing the gym session for that day. | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 9 - I'm committed to the daily gym habit and the accountability of photo proof k |
| p2-01 Jordan | 2-first-day | wrong: The app never explained what 'Day secured' means. | wrong: The app never explained what a freeze is. | right: It means you manually entered your own data instead of the app tracking it automatically. | 3 - It's a gratitude journal that feels slow and requires typing too many words, |
| p2-02 Amina | 2-first-day | right: Day secured means I've completed my daily challenge and confirmed it, so my streak is protected for today. | wrong: The app never explained what a freeze is during the screens I saw. | right: Self-reported means I manually logged the task myself rather than it being automatically tracked. | 8 - The streak tracking and daily check-in system feels motivating, even at 3am  |
| p2-03 Robert | 2-first-day | right: Day secured means you completed your challenge for today and it's locked in as done. | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 8. I like that it shows my progress and tells me I did good with the checkmark a |
| p2-04 Casey | 2-first-day | wrong: The app never explained what 'Day secured' means. | wrong: The app never explained what a freeze is. | right: It means you manually entered the word count yourself rather than the app measuring it automatically. | 3. Another habit app that feels like busywork—I've already quit three of these,  |
| p2-05 Priya | 2-first-day | wrong: The app never explained what 'Day secured' means. | wrong: The app never explained what a freeze is. | right: Self-reported means you manually entered your word count yourself rather than the app automatically tracking i | 8. I'm enjoying the journaling challenge and want to stay consistent with the 7- |
| p2-06 Sam | 2-first-day | wrong: The app never explained what 'Day secured' means; I only saw the screen title but no definition. | wrong: The app never explained what a freeze is. | wrong: The app never explained what 'Self-reported' means on a task. | 7, because the app seems straightforward for tracking daily check-ins and the 7- |
| p2-07 Yusuf | 2-first-day | wrong: The app did not explain what 'Day secured' means on the screens I saw. | wrong: The app did not explain what a freeze is on the screens I saw. | wrong: The app did not explain what 'Self-reported' means on the screens I saw. | 3 - The app showed fitness and wellness challenges but I didn't see a specific d |
| p2-08 Helen | 2-first-day | wrong: The app never explained what 'Day secured' means in the screens I saw. | wrong: The app never explained what a freeze is in the screens I viewed. | right: Self-reported means I'm tracking this task myself without external verification, as indicated by the label und | 9 - I found the morning gratitude practice meaningful and aligned with my faith  |
| p2-09 Marcus | 2-first-day | right: Day secured means you've completed all your tasks for that day and earned your streak. | right: A freeze holds your streak if you miss a day, so you don't lose your progress. | right: Self-reported means you manually log that you completed the task instead of the app automatically tracking it  | 9 - I like the strict accountability with photo verification, and the streak sys |
| p2-10 Elena | 2-first-day | right: Day secured means I completed both tasks for Day 1 so my streak is protected and won't be broken. | wrong: The app never explained what a freeze is during the screens I saw. | wrong: The app never explained what self-reported means during the screens I saw. | 8 - I'm nervous I picked something hard but I already walked 7,000 steps and com |
| p2-11 Tom | 2-first-day | wrong: The app never explained what 'Day secured' means. | wrong: The app never explained what a freeze is. | wrong: The app never explained what 'Self-reported' means. | 7, because the gym challenge is interesting but I need to take photos in the app |
| p2-12 Grace | 2-first-day | wrong: Day secured means you completed your daily challenge goal of no screens for 60 minutes before bed. | wrong: The app never explained what a freeze is during the screens I saw. | wrong: The app never explained what self-reported means during the screens I saw. | 3 - I don't want the camera on and the app seems focused on tracking behavior th |
| p3-01 Ivy | 3-task-types | right: Day secured means you completed your daily challenge requirement and locked in your progress for that day. | right: A freeze is a feature that allows you to skip a missed day without breaking your streak, as indicated by 'A fr | wrong: The app never explained what 'Self-reported' means on a task. | 7 - I completed today's challenge and the streak-based progress system motivates |
| p3-02 Omar | 3-task-types | wrong: Day secured means you have successfully completed and verified the daily challenge requirement by submitting y | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 8 - The app provides a simple, visual way to track a daily hydration habit with  |
| p3-03 Bea | 3-task-types | right: Day secured means you've completed a breathing challenge for that day and locked in your progress for the Show | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 7 - I like checking off daily challenges and seeing my streak grow, even though  |
| p3-04 Kofi | 3-task-types | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | right: Self-reported means you manually enter the count yourself rather than the app tracking it automatically. | 8 - I like the straightforward daily challenge structure and the satisfying visu |
| p3-05 Zara | 3-task-types | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | right: Self-reported means you manually enter the count of pages you read yourself rather than the app tracking it au | 2 - The app is tracking my reading with a 14-day challenge, but I'm already thin |
| p3-06 Nate | 3-task-types | wrong: The app never explained what 'Day secured' means in the screens I saw. | wrong: The app never explained what a freeze is in the screens I saw. | wrong: Self-reported means the word count is based on your own honest input rather than automatic verification. | 3 - I only wrote one word and the app is asking for 9 more, which feels like a l |
| p3-07 Lina | 3-task-types | wrong: The app never explained what 'Day secured' means during the screens I viewed. | wrong: The app never explained what a freeze is during the screens I viewed. | wrong: The app never explained what 'Self-reported' means during the screens I viewed. | 7 - I like the structure of Show Up 7 and the social element with friends, but I |
| p3-08 Hugo | 3-task-types | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | right: Self-reported means the data or progress was entered by the user themselves rather than automatically tracked  | 3, because typing random emoji and gibberish into a journal app isn't really tha |
| p3-09 Ruth | 3-task-types | right: Day secured means you've completed the daily challenge requirement and it's been recorded for that day. | right: A freeze can cover a missed day so you don't break your streak. | wrong: The app never explained what 'Self-reported' means on a task. | 8 - I like the gym accountability and the visual progress tracking, though I'd n |
| p3-10 Eli | 3-task-types | wrong: Day secured means you've completed the daily requirement for the Show Up 7 challenge by submitting photo proof | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 8 - I'm motivated by the visible progress tracking and the simple daily commitme |
| p4-01a Alex | 4-social | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | wrong: The app never explained what 'Self-reported' means on the screens I saw. | 8 - The challenge creation feature is engaging and I like the fitness tracking c |
| p4-01b Blake | 4-social | right: Day secured means you've completed the daily challenge requirement and locked in your progress for that day. | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 7 - It's a simple, motivating way to build a habit and the visual proof system m |
| p4-02a Dana | 4-social | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | wrong: The app never explained what 'Self-reported' means on the screens I saw. | 7, because the challenge creation process seems straightforward and the accounta |
| p4-02b Femi | 4-social | wrong: Day secured means you have completed the Drink Water Today challenge for Day 1 of the challenge. | wrong: The app never explained what a freeze is. | wrong: The app never explained what self-reported means. | 7 - The challenge structure and proof feature create accountability, though I'd  |
| p4-03a Kim | 4-social | right: Day secured means you've completed the challenge for today and your progress for Day 1 is locked in. | wrong: The app never explained what a freeze is. | right: Self-reported means you manually log that you completed the task yourself rather than it being automatically t | 8, the app makes fitness challenges feel social and achievable with the invite l |
| p4-03b Jun | 4-social | right: The app never explicitly explained what 'Day secured' means, but based on the screens shown, it appears to mea | wrong: The app never explained what a freeze is during the screens I viewed. | wrong: The app never explained what 'Self-reported' means on a task during the screens I viewed. | 8, because completing the challenge felt motivating and I want to maintain my st |
| p5-01 Rae | 5-safety-edge | wrong: The app never explained what 'Day secured' means in the screens I saw. | wrong: The app never explained what a freeze is in the screens I viewed. | wrong: The app never explained what 'Self-reported' means on a task in the screens I saw. | 3 - I only saw profile editing and authentication screens; the core app function |
| p5-02 Vic | 5-safety-edge | wrong: The app never explained what 'Day secured' means, but based on the screen it appeared after completing the 7K  | wrong: The app never explained what a freeze is during my session. | wrong: The app never explained what 'Self-reported' means on a task during my session. | 8 - I completed the daily challenge successfully and the app makes it easy to sh |
| p5-03 Tess | 5-safety-edge | right: A day secured means you've completed the challenge requirement for that day and it's locked in. | right: A freeze is a one-time pass that covers a missed day, available after earning a 7-day streak in Standard mode. | wrong: The app never explained what 'Self-reported' means on a task. | 7 - The challenge format is engaging and the accountability levels give flexibil |
| p5-04 Reed | 5-safety-edge | wrong: The app never explained what 'Day secured' means on the screens I saw. | wrong: The app never explained what a freeze is on the screens I saw. | wrong: The app never explained what 'Self-reported' means on the screens I saw. | 7 - The app seemed straightforward to log into and I'm curious what happens afte |
| p5-05 Guest | 5-safety-edge | wrong: The app never explained what 'Day secured' means. | wrong: The app never explained what a freeze is. | right: Self-reported means the user manually entered their response rather than it being automatically tracked or ver | 7 - The gratitude journal feels meaningful and the daily reminder structure is e |
| p5-06 Felix | 5-safety-edge | right: Day secured means you've completed your daily goal for the 7K Steps challenge and locked in your progress for  | wrong: The app never explained what a freeze is, so I can't say. | right: Self-reported means you manually entered or confirmed your step count yourself rather than it being automatica | 8. The app made it easy to complete the challenge and showed clear progress, so  |


## Top problems

1. other: the same screen came up 3 times (19: p1-03, p1-04, p1-05, p2-01, p2-04, p2-05)
2. other: Gave up. other repeated 3 times. (14: p2-01, p2-04, p2-05, p2-08, p3-01, p3-04)
3. challenge: the same screen came up 3 times (12: p1-02, p1-06, p2-06, p2-11, p3-02, p3-03)
4. challenge: Gave up. challenge repeated 3 times. (11: p1-02, p1-06, p2-06, p2-11, p3-02, p3-03)
5. Start here: radio button is already selected. (11: p2-01, p2-02, p2-03, p2-04, p2-06, p2-08)
6. home: the same screen came up 3 times (10: p1-01, p1-03, p1-05, p1-06, p2-03, p2-12)
7. home: Gave up. home repeated 3 times. (6: p1-01, p1-03, p1-05, p2-03, p2-12, p5-06)
8. onboarding: the same screen came up 3 times (3: p2-07, p2-09, p2-11)
9. 7K Steps challenge: Failed to run flow: Element not found: Text matching regex: Join 7K Steps (2: p1-01, p5-06)
10. Day secured: Failed to run flow: Element not found: Text matching regex: Go back (2: p1-01, p5-06)
11. Day secured: Home is already selected. (2: p1-05, p5-06)
12. 7-Day Gratitude Journal Day 1: Failed to run flow: Element not found: Text matching regex: inputView (2: p2-01, p2-04)

## Quotes

- Dev (1-speed, Day secured): "Why isn't the Done button working? I've tapped it multiple times and the screen is still showing the same Day secured modal."
- Mia (1-speed, Proof): "Why does tapping Done not advance? Is there another step I'm missing?"
- Priya (2-first-day, All challenges): "The radio button keeps saying it's already selected, but I haven't actually joined the challenge yet. Tapping the radio button doesn't work. I need to figure out how to actually enter/join this challenge."
- Elena (2-first-day, Up and out of bed): "Why isn't the camera opening? The buttons seem to exist but nothing happens."
- Ruth (3-task-types, Share): "Steps 6-9 seem to be going in circles with Share and Close buttons"
- Felix (5-safety-edge, Day secured): "The Share dialog seems persistent - I tapped Share today but I'm still on Day secured"

## Folders

- 1-speed: written
- 2-first-day: written
- 3-task-types: written
- 4-social: written
- 5-safety-edge: written
- 6-words: written

## Data

Per chunk: `<chunk>/data.csv` (persona, chunk, step, screen, screen_name, action, target, thought, confusion, emotion, latency_ms, done_to_sheet_ms, done_to_visible_ms, error), `<chunk>/report.html`, `<chunk>/<persona>/steps.jsonl`, `result.json`, `interview.json`, `shots/`. Account files hold passwords and are not committed; `shots/` (about 1,000 frames) stays on the Mac that ran it, the frames cited above are in `evidence/`.

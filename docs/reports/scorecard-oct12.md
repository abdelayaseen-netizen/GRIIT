# GRIIT scorecard, 12 Oct 2026

Build 87 did not ship. The branch is `feat/build87` at the commits below. The last build on internal TestFlight is 86 (`5bcc43a2`).

Scores are 1–10. **Measured** means a command or an agent run produced the number. **Inspected** means the code was read. **Judgment** is an opinion with the reason next to it.

Overall: **5.5**. Product loop, onboarding, and data integrity are weighted double. The arithmetic is in `scorecard-oct12.json`.

## 1. Product loop — 6 (judgment, with measured agent taps)

Join → task → proof → secured day → streak → share exists in code for check-off, timer, counter, photo, and write. Build 86 put a Done label on each. In the build 87 rerun, 6 of 24 new users tapped a Done control. Photo tasks still take more than one tap (Done · take photo, then the camera). The share sheet was not matched to the v51 frames.

Top problems: most new users never finish a task; the share sheet is unfinished; account creation now eats the people Join finally lets through.

Fixes: finish the first task on the Home row (impact 5, S); shorten account creation (5, M); finish the share sheet (3, M).

## 2. UX and onboarding — 5 (measured)

Same classifier on both 24-person fresh runs.

| Step | Build 86 reached | Build 86 median seconds | Build 87 reached | Build 87 median seconds |
|---|---|---|---|---|
| Welcome | 24 | 8 | 24 | 14 |
| Goals | 24 | 8 | 24 | 8 |
| Intro | 21 | 12 | 20 | 17 |
| Length | 21 | 4 | 20 | 4 |
| Start here | 21 | 8 | 20 | 10 |
| Joined | 12 | 4 | 19 | 5 |
| Reminders | 13 | 4 | 19 | 5 |
| Account | 13 | 67 | 19 | 107 |
| Home | 13 | 25 | 12 | 58 |
| First task done | 9 | 10 | 6 | 12 |

Join improved (12 → 19). Account got slower (67s → 107s), and fewer people reached a Done button (9 → 6). Four agents still never left the goals screen. Six agents wrote a secured/freeze/self-reported line. None of those lines matched the definitions (every task, a streak held over a miss, you mark it yourself). Build 86 was 0 of 24 as well.

Confusion field was empty on both runs. The thoughts that show the problem: agents re-tap a goal that is already selected, and they treat "secured" as "I made an account."

## 3. Frontend — 6 (inspected)

23 unused files and 2,267 lines were removed. One unused font package was removed. `rg` for `: any` in app code excluding tests found 8. `@ts-ignore` / `@ts-expect-error` found 1. A full non-null `!` count was not completed. Orange-outside-the-four-places and raw hex were not counted tonight.

## 4. Backend — 5 (inspected)

Join, delete account, and block check `ctx.userId`. A table of every procedure was not finished, so this is not a pass on authorization. Zod is on the procedures that were opened (`challenges.join`, `profiles.deleteAccount`, Discover inputs). RLS was not re-read table by table.

## 5. Data integrity — 7 (inspected)

Build 86 put Day n and the secured/due count through one function each, with tests, including a clamp so the numerator cannot exceed the denominator. Those tests still pass (1,610 tests on this branch). They were not re-run on a device tonight. `scripts/integrity/` was not added.

## 6. Performance — 4 (judgment)

S1–S8 were not timed. No release build was installed, so there is no pass/fail against the R10 targets. Hermes bytecode: 12,266,664 bytes before, 12,268,094 after. The deleted files were not in the bundle.

## 7. Reliability — 4 (judgment)

Offline posting, a 3 second delay, and duplicate submits were not simulated tonight.

## 8. Security and privacy — 6 (inspected)

Account deletion removes the profile row and, when the service role is set, the auth user (`profiles.deleteAccount`). Contact is `griit.health@gmail.com` in Settings → About. Signed URL batching shipped in build 86. The exported bundle was not searched for secrets tonight. PostHog event arrival could not be read (no personal API key).

## 9. Tests — 7 (measured)

Full suite: 312 files, 1,610 tests, after the onboarding fixes. The is_test hiding test passed in Phase 0 (5 tests). Maestro did not pass tonight.

## 10. Analytics — 4 (inspected)

`lib/analytics.ts` names the R5-shaped events (`first_task_completed`, `day1_secured`, `day_secured`, `day_7_retained`, `share_completed`). Whether any have arrived from testers is unknown. D1/D7/D30 and K cannot be computed from production data tonight.

## 11. App Store — 5 (inspected)

| Guideline | Item | Status | Note |
|---|---|---|---|
| 1.2 | Report a post | pass | `LiveFeedSection` has "Report post" |
| 1.2 | Block a user | pass | `profiles.blockUser`, with a test |
| 1.2 | Report a user | risk | Not confirmed as its own action |
| 1.2 | Filter text | risk | `content-moderation.ts` exists; comment coverage not proven |
| 1.2 | Contact | pass | Settings → About mailto |
| 5.1.1 | Delete account | risk | Deletes the profile and the auth user if the service role is set. Other rows were not traced. |
| 4.8 | Login choice | pass | Apple and email are both on the account screen |
| 5.1.2 | Notifications not required | risk | Reminders can be left via the flow's skip paths. Not re-tested on device. |
| 3.1.2 | Premium explained | risk | Not reviewed tonight |
| 2.1 | Demo account | fail | No review demo was prepared tonight |

Would be rejected today, in order: no review demo and an unverified backend walkthrough (2.1); account deletion that may leave data behind (5.1.1); UGC report-a-user and the text filter not shown to be complete (1.2).

## 12. Market fit — 6 (judgment)

GRIIT combines a streak, a freeze, photo proof, and a feed. Strava has the social graph and clubs. Duolingo has the streak pedagogy. 75 Hard apps have the culture. Habit trackers have widgets and Apple Health. BeReal has the daily photo. Muslim Pro has prayer times. GRIIT does not have widgets, Apple Health, or a coach. The build 87 agents still could not explain freeze or self-reported.

People will expect a streak that survives one miss, a friend in the challenge, and a first win on day one. Week-1 delete reasons from the agent runs: they never finish a task, the account step is long, and the words on the intro screens do not stick.

## Metrics to decide

- North star: weekly secured days per active user. R3 says the first 7 days are the fragile part, and a 7-day streak is the Duolingo marker. Secured days count the behavior. A 7-day streak is the milestone, not the weekly number.
- First value: first secured day within 24 hours of install.
- Core value: 7 secured days within 10 days.
- Activation window: from the two 24-person runs, the drop that matters is account creation, then the first Done. That is inside the first session, not a later day. There is no real D7 curve yet.

## Would this work if launched today?

Not as a product you can learn from. The people who reach Home can join and mark a task done, and the day numbers finally agree. In the only fresh-user sample on this branch, 19 of 24 got past Join and 6 of 24 finished a task. Nobody could define the three words the app is built on. There is no PostHog proof that anyone comes back on day 7. Shipping that to the public would spend the first cohort on an account form and an unexplained streak.

## Top 10 for D30

1. Get the account step under the old 67 seconds. It is now 107, and it is where the extra joins die.
2. A first Done on Home in one tap, in the first session.
3. Teach secured, freeze, and self-reported before the first miss. The quiz is 0 for 24.
4. Keep freezes. The code model gives them about 1 point of D30 versus turning them off.
5. Put a friend in the challenge. About 1 point in the same model.
6. If everyone finished a first task, the model’s D30 median moves from 5.5% to 7.3%.
7. Android. 91 of 200 seed people cannot install. That is growth, not the D30 rate.
8. Keep the day-count clamp. A "3 of 2" screen ends trust.
9. A share card people can actually see. K is not measurable until they can.
10. Do not require notifications. R8, and the reminder step has to stay optional.

## Time in the app

There is no real usage data. PostHog could not be queried. The agent clocks above are simulator sessions, not retained users.

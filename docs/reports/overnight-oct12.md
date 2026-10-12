# Oct 12 continuation

Account diagnosis for the 7 who reached the account step and never the real Home (build 87, 24 agents). The early "home" label in those traces is an onboarding screen the harness mislabeled. All 7 are harness, not a dead button.

| Agent | What happened | App or harness |
|---|---|---|
| creator-01 | Email signup reached the display-name screen. The run ended while the agent was still typing the name. | Harness |
| gym-01 | The agent typed the email with an extra `.health`, then reached display name and the run ended on that field. | Harness |
| lapsed-01 | The agent doubled `griit.health` in the email, tapped Send it, then the run ended while typing the display name. | Harness |
| lapsed-02 | The agent typed the email twice (`@griit.health@griit.health`) and spent the rest of the run tapping the field to fix it. | Harness |
| lowtech-01 | The agent appended `vv` to the display name and could not clear it. | Harness |
| pro-02 | The agent appended `v` to the display name and could not clear it. | Harness |
| teen-01 | The agent appended `.health` to the email and could not edit it back. The confirm step ("Send it" / Edit) is where they got stuck. | Harness |

The harness is not allowed to use Sign in with Apple, so every one of these went through email typing. That is why the step took about 107 seconds. The app did not show an error or a button that did nothing.

# Overnight Oct 11 → Oct 12

Build number: not shipped. Last internal TestFlight build is 86. `feat/build87` was not merged.

API cost: Phase 2 agents $1.13. Phase 5 $0. Total $1.13.

## Final message

1. Build 87 did not ship. Maestro was not green, and the ship rule requires Maestro plus the suite. The suite passed (1,610 tests). tsc was clean.
2. Phase 1: 23 files deleted, 2,267 lines, 1 dependency. Hermes bundle 12,266,664 → 12,268,094 bytes. S1–S8 were not timed, so there is no pass/fail.
3. Phase 2: Join went from 12/24 to 19/24. Account median went from 67s to 107s. First task done went from 9/24 to 6/24. Concept quiz 0 of 24 on both builds. v52 frames, the share sheet, Maestro, and the App Store punch-list were not finished. The v52 zip was not on disk.
4. Phase 3: overall 5.5. Scores are in `docs/reports/scorecard-oct12.md`. Would be rejected today for no review demo, an untraced account deletion, and an unproven report-user / text filter. Verdict: do not launch to learn from the public yet.
5. Phase 5 is a simulation, not a forecast, calibrated to the 24 build 87 agents, not to 100 people. D1 23.9% (18.4–30.3). D7 11.9% (7.3–15.6). D30 5.5% (2.8–9.2). D365 0.9% (0–1.8). Wellness women and gym men are the only groups with a D30 median above 0; the rest are too small to rank. Shares per installer 0.22. K 0.03 (low on the Tenjin scale; the 0.2 install rate is an assumption). 91 of 200 seed people are Android and cannot install. Paid 0.9%. One coded quit reason: missed without a freeze. Largest D30 lifts: everyone finishes a first task (+1.8 points), a friend in the challenge (+0.9), freezes versus none (+0.9). Model agreement was not run. No sanity flag: 5.5% is inside 0.5×–2× of the 9% fitness midpoint.
6. Files: `docs/reports/scorecard-oct12.md`, `docs/reports/scorecard-oct12.json`, `agents/sim/2026-10-12/`, `docs/sql/pending-oct12.sql`. The build 87 steps were appended to `agents/summary/all-steps.csv` on the agent-testers checkout, not on this branch.
7. Cost by phase: Phase 2 $1.13, Phase 5 $0, total $1.13.

## Phase 0 — preflight

Done. No app code changed.

- main is `5bcc43a2` (“Make Day n, day counts, and Done labels agree on every screen.”), which is build 86. Branch `feat/build87` was created from that commit. Worktree: `/Users/yaseenabdela/Developer/GRIIT-build87`.
- During worktree setup, `feat/v48-d-feed-discover-challenge-profile` was accidentally moved to `5bcc43a2`. It was restored from the reflog to `b34cee7e` before any push. `feat/agent-testers` was reattached. Neither branch was pushed.
- `ANTHROPIC_API_KEY` is present in `.env.local` (not printed). Phases 2 and 5 can call the API.
- is_test hiding unit test passed: `backend/trpc/routes/hide-test-authors.test.ts`, 5 tests, run on the same commit via the build 86 install. Covered surfaces: feed (`feed.getLiveFeed`), Discover People (`profiles.suggested`), friends leaderboard, weekly leaderboard, challenge leaderboard. A real viewer does not see the test author. A test viewer still can.
- Gap, not a test failure: there is no “{n} doing it” string in `app/`, `components/`, or `lib/`. Discover and Start here sort on the stored `participants_count` column (`backend/trpc/routes/challenges-discover.ts`). That column is not filtered by `is_test` in the select. The unit test does not cover it. Phase 2 will treat real-member counts as a feature fix, not a failed hiding test.
- PostHog arrival from testers: not measured. `.env` has `EXPO_PUBLIC_POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_ENABLE_DEV` (the client ingest key). There is no PostHog personal API key locally, and Railway was not opened, so event counts and date ranges cannot be read. Event names that exist in code are listed in `lib/analytics.ts` (`app_opened`, `signup_completed`, `onboarding_completed`, `first_task_completed`, `day1_secured`, `day_secured`, `day_7_retained`, `feed_posted`, `share_completed`, and the paywall and notification names in that file). Whether any of them have arrived is unknown.
- Challenge counts, measured with the anon key against the public REST API (RLS applies; this is not a service-role count). No service-role key is in the local env, and none was pulled from Railway.
  - Challenges visible to anon: 56. All `visibility=PUBLIC`. Status: 45 published, 11 archived.
  - Unique titles among those 56: 54. Duplicate groups: 2 (`workout / cardio` ×2, `go to the gym` ×2). Extra rows: 2.
  - Titles containing both “75” and “hard”: 1 published public row, `75 day hard`, `participants_count` 0.
  - The brief’s “8 challenges titled 75 day hard” was not visible to the anon key. Copies behind RLS are uncounted. Phase 2 dedupe still applies to whatever Discover returns.
- Test-account count: not measured. `profiles` returns no rows to the anon key (`content-range */0`). Counting `is_test` would need the service role.

Skipped: nothing in this phase. Hiding test did not fail, so Phase 2 item 0 is not required for the surfaces the test covers.

## Phase 1 — deep clean and speed

Code cleanup is committed. Speed timings were not taken.

Dead code, measured with knip 5.x (`npx knip --reporter compact`, 435 unused files). Design handoff and `claude/design` were left in place: they are the frame source, not app code. Unused exports (135) were not deleted. Knip marks a symbol unused when another symbol in the same file is the one callers import, and deleting those symbols does not change what the user sees.

Deleted, after a repo search showed no remaining import of the file name:

| File | Why it is dead | Lines |
|---|---|---|
| components/ErrorRetry.tsx | no imports | 57 |
| components/ds/ProofDayFeed.tsx | no imports | 172 |
| components/ds/StatusBarBacking.tsx | no imports | 30 |
| components/ds/StreakStrip.tsx | no imports | 60 |
| components/feed/FeedPostCard.tsx | no imports; replaced by FeedPostV3 | 526 |
| components/feed/FeedEngagementRow.tsx | only used by the deleted cards | (in the 2,267) |
| components/feed/MilestonePostCard.tsx | no imports | 111 |
| components/feed/WhoRespectedSheet.tsx | only used by the deleted cards | (in the 2,267) |
| components/profile/ProofScroll.tsx | no imports | 137 |
| components/shared/ImageViewerModal.tsx | only referenced by a comment | (in the 2,267) |
| components/skeletons/SkeletonChallengeDetail.tsx | no imports | 48 |
| components/skeletons/SkeletonLeaderboardRow.tsx | no imports | 36 |
| components/skeletons/SkeletonProfile.tsx | no imports | 48 |
| components/ui/CreateFlowCheckbox.tsx | no imports | 61 |
| components/ui/CreateFlowHeader.tsx | no imports | 106 |
| components/ui/CreateFlowInput.tsx | no imports | 65 |
| components/ui/DurationPill.tsx | no imports | 50 |
| components/ui/EnforcementBlock.tsx | no imports | 37 |
| components/ui/InitialCircle.tsx | no imports | 40 |
| components/ui/TaskTypeCard.tsx | no imports | 89 |
| hooks/useJournalInput.ts | no imports | 125 |
| hooks/useReduceMotion.ts | only used by the deleted modal | (in the 2,267) |
| store/feedToggleStore.ts | no imports | 48 |

Totals: 23 files deleted, 2,267 lines removed, 1 dependency removed (`@expo-google-fonts/barlow-condensed`). No RevenueCat debug toast was found. `lib/subscription.ts` sets the log level to ERROR outside `__DEV__`.

Consolidation: live "Day n of N" already goes through `shownChallengeDay` from build 86. Duplicate public titles now go through `dedupeChallengesByTitle` on Start here and `filterDiscoverCatalog` on Discover. Call sites: the suggestion function and every Discover list that already called `filterDiscoverCatalog`.

JS bundle, Hermes bytecode, `npx expo export --platform ios`:

| | Bytes |
|---|---|
| Before (build 86 tree, commit 5bcc43a2) | 12,266,664 |
| After (feat/build87, commit 82c8af82) | 12,268,094 |

The deleted files were not imported, so they were not in the bundle. The after bundle is 1,430 bytes larger because of the onboarding changes.

S1–S8 were not measured. A release build on the simulator was not produced, so there is no median or worst time and no pass/fail against the R10 targets. No speed patch was kept, because none was shown to help.

tsc was clean. Full suite after the deletion: 313 files, 1,611 tests. After the font removal: the same suite passed.

## Phase 2 — build 87 features

In progress. Cost so far $0.

Shipped in 82c8af82:

- Continue and Join are pinned under the scroll view, so the goals button is not left below the fold. A source test checks the footer comes after `</ScrollView>`.
- A second Join after "You're already in this challenge." advances instead of sitting on the error. The button was already disabled while the request runs (`joining` state, Button `disabled`).
- Start here falls back to popular public challenges when nothing matches the goal, so a loaded catalog does not say "No suggestions". The empty state now says "Couldn't load challenges" and only shows when the catalog request fails.
- Duplicate titles collapse to the row with more `participants_count`.
- Standard-mode copy on the suggestion card is "Missed a day? A freeze holds your streak. You earn one every 7 days in a row."
- Category and duplicate-archive SQL is in `docs/sql/pending-oct12.sql`. Not run.

Skipped, with the reason:

- v52 frames. No zip named GRIIT-v52 or OCT_11_0851 was on Disk (Downloads, Desktop, Spotlight). The flow was not rebuilt from frames. "Set your line" and the intro screens are still in the app.
- "{n} doing it" only at n ≥ 10. That string is not in the app. Discover still shows the stored `participants_count`, which is not split into real vs test members.
- Account screen reorder and removing a confirm step. Not changed. Apple sign-in is already on the screen.
- Share sheet vs v51 frames 1319–1323. Not changed.
- App Store report, block, filter, contact, and account deletion. Not audited line by line yet. Settings already has `AccountDangerZone`.
- Maestro for each Done path and the faith/fitness joins. Not run yet.
- The $3 onboarding rerun finished. Measured cost $1.13. Report: `agents/runs/2026-10-11-onboarding-b87/report.html` on the agent-testers checkout. Join 19/24 (was 12). Account median 107s (was 67). First task 6/24 (was 9). Concept quiz still 0 of 24. The first attempt died because `maestro` was not on PATH. The retry with Maestro on PATH ran all 24.

## Phase 3

Written to `docs/reports/scorecard-oct12.md` and `.json`. Overall 5.5. The authorization table and S1–S8 timings are empty because they were not produced.

## Phase 4

Skipped. Maestro did not pass, so the branch was not merged and no TestFlight build was submitted.

## Phase 5

Code model only. 30 seeds, 200 people, day-1 pool from the 24 build 87 agents. LLM moments were not run, so there is no second-model agreement and no quote file. Cost $0. Outputs under `agents/sim/2026-10-12/`. `daily.csv`, `moments.jsonl`, and `invites.csv` were not written. The 100-person day-1 run was not done.

is_test hiding did not fail in Phase 0, so item 0 was not required.

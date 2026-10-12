# Overnight Oct 11 → Oct 12

Build number: not shipped yet.

Cost so far: $0. Phase 2 cap $3. Phase 5 cap $30.

This file is the progress log. Each phase appends what finished, what was skipped, and why.

## Final message

Filled in when the night ends. Until then, read the phase sections.

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
- The $3 onboarding rerun. Starting after Metro is serving this branch.

is_test hiding did not fail in Phase 0, so item 0 was not required.

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

Not started.

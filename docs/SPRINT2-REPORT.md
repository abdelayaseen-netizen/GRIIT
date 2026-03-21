# Sprint 2 Report: UX Hardening

**Date:** March 21, 2026

**Commits (Sprint 2 phases):**

- Phase 0 (inventories): `be53033`
- Phase 1 (EmptyState + ErrorRetry components): `7df9d76`
- Phase 2 (Alert.alert conversions): `3d3665c`
- Phase 3 (Home + Discover): `9681a40`
- Phase 3 (remaining screens): `3107e0a`
- Phase 4 (prefetch + query defaults): `f224eb0`
- Phase 5 (this report): same commit as this file on `main` (see `git log -1 -- docs/SPRINT2-REPORT.md`)

## Metrics

| Metric | Before (Sprint 1 end) | After | Delta |
|--------|----------------------|-------|-------|
| Alert.alert count | 42 | 10 | −32 |
| Files importing `EmptyState` (`@/components/EmptyState`) | 0 | 7 | +7 |
| Files importing `ErrorRetry` (`@/components/ErrorRetry`) | 0 | 8 | +8 |
| Prefetch entry points (`prefetchChallengeById` / `prefetchActiveChallengeById` + `onPressIn` on cards) | 0 | Discover (4 card surfaces) + Home GoalCard | new |
| Screens with loading + empty + error patterns (target surfaces) | ~3 | 8 | +5 |

## Screen State Coverage

| Screen | Loading | Empty | Error |
|--------|---------|-------|-------|
| Home | ✅ | ✅ | ✅ |
| Discover | ✅ | ✅ | ✅ |
| Activity | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ (journey / stats subsection) | ✅ |
| Teams (tab) | ✅ | ✅ | ✅ |
| Challenge Detail | ✅ (skeleton) | N/A | ✅ |
| Active Challenge | ✅ | ✅ (no tasks in challenge) | ✅ |
| Accountability | ✅ | ✅ | ✅ |

## Estimated Scorecard Impact

| Category | Sprint 1 end | Estimated After |
|----------|-------------|-----------------|
| 1F Error Handling | ~62 | ~80 |
| 2E Performance | 74 | ~83 |
| **Overall (weighted)** | **~76** | **~79** |

## Phase 4 Notes

- **Challenge detail prefetch:** `queryClient.prefetchQuery` with `queryKey: ["challenge", id]` and `trpcQuery(TRPC.challenges.getById, { id })` — matches `app/challenge/[id].tsx`.
- **Active challenge prefetch:** `queryKey: ["activeChallenge", activeChallengeId]` with the same Supabase `active_challenges` + nested `challenges` select as `app/challenge/active/[activeChallengeId].tsx`.
- **`lib/query-client.ts`:** `staleTime` 5m, `gcTime` 10m, `retry` 2, `refetchOnWindowFocus` false — **already configured**; no change required.
- **Profile tab prefetch:** Skipped — `app/(tabs)/_layout.tsx` uses Expo Router `Tabs` without `listeners` on Profile; optional follow-up if product wants tab-press prefetch.

## Files Changed (Sprint 2 scope, since inventory `be53033`)

See `git diff --name-only be53033^..HEAD` for the full list. Highlights:

- App: tab screens, challenge flows, task flows, settings, welcome, accountability, `app/teams.tsx`, prefetch wiring.
- Components: `EmptyState`, `ErrorRetry`, GoalCard, Discover challenge cards, LiveFeed, profile/community pieces.
- Lib: `prefetch-queries.ts`, `share.ts`.
- Docs: `SPRINT2-ALERT-INVENTORY.md`, `SPRINT2-EMPTY-STATE-INVENTORY.md`, this report.

## Known Remaining Gaps

- Standalone `app/teams.tsx` (non-tab “Coming Soon” screen) uses inline patterns from an earlier pass; primary teams UX is `app/(tabs)/teams.tsx`.
- Profile tab prefetch not implemented (optional).
- Some task/challenge flows still use confirmation `Alert.alert` by design (leave challenge, sign out, draft save, etc.).

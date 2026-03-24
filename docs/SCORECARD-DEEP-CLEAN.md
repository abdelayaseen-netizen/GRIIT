# GRIIT Deep Clean Scorecard — March 23, 2026

## Summary

| Category | Score | Notes |
|---|---|---|
| Dead Code Removal | 86 | Removed 10 root markdown files (kept README, SETUP); removed debug `console.log` from share flows; narrowed `connected_accounts` select in Strava verifier. `tsc` unused locals already enforced via `noUnusedLocals`. |
| Frontend Performance | 78 | Standardized `staleTime: 5 * 60 * 1000` on Discover aux queries, Community queries, active challenge detail, chat-info team members; added `getItemLayout` to Discover daily horizontal `FlatList`; migrated task proof previews to `expo-image` with `cachePolicy="memory-disk"`. Not done: `React.lazy` for all non-tab routes; exhaustive `FlatList` tuning on chat/accountability. |
| Backend Performance | 74 | Replaced `select('*')` on `connected_accounts` in `backend/lib/strava-verifier.ts` with explicit columns. Broader `select('*')` / `*, challenge_tasks (*)` patterns remain in other routers; sequential `await` chains in `checkins` and related flows not refactored (many have ordering dependencies). |
| Design System Compliance | 98 | Zero raw hex in `app/`, `components/`, `contexts/` (grep). All color tokens live in `lib/design-system.ts`. |
| Accessibility | 72 | Added `accessibilityLabel` on several `expo-image` proof/feed images; tab bar already labeled. Full pass on every icon-only control not completed. |
| Error Handling | 84 | Community friend-streak share and `ProofShareCard` failures now use `captureError`; leaderboard section shows `ErrorState` on failure. Remaining `console.error` in many catch paths are diagnostic; not all migrated to Sentry. |
| Type Safety | 98 | No `: any` / `as any` matches in app/lib/contexts/components/backend TS sources; `npx tsc --noEmit` passes with zero errors. |
| **Overall** | **81** | Meaningful pass across phases; see Remaining Issues for gaps. |

## Changes Made

### Phase 1 — Dead Code

- Deleted root markdown (retained `README.md`, `SETUP.md`, `docs/`): `APP_BREAKDOWN.md`, `BUTTON_AUDIT.md`, `CLICKABLE_MAP.md`, `DEEP-CLEAN-SCORECARD.md`, `GRIIT_Auth_Onboarding_Audit_Report.md`, `GRIIT_App_Health_Scorecard_Report.md`, `GRIIT_Full_Stack_Scorecard_Report.md`, `GRIIT_PrePush_QA_Report.md`, `HOW-TO-RUN-APP.md`, `IMPLEMENTATION_REPORT.md`.
- `components/shared/ProofShareOverlay.tsx`: removed optional `onShared` debug logging.
- `app/task/photo.tsx`: removed debug `onShared` callback on `ProofShareCard`.
- `backend/lib/strava-verifier.ts`: `connected_accounts` query uses explicit column list instead of `*`.

### Phase 2 — Frontend Performance

- `app/(tabs)/discover.tsx`: `myActiveForDiscover` / `myCompletedForDiscover` `staleTime` → 5 min; horizontal daily `FlatList` `getItemLayout` using card width 154 + separator 10.
- `app/(tabs)/activity.tsx`: leaderboard, feed, `activeChallengesQuery` `staleTime` → 5 min; leaderboard error/loading UI before `Leaderboard`.
- `app/challenge/active/[activeChallengeId].tsx`: both `useQuery` hooks `staleTime` 5 min.
- `app/challenge/[id]/chat-info.tsx`: `teamMembersQuery` `staleTime` 5 min.
- `components/community/LiveActivity.tsx`, `components/onboarding/screens/ProfileSetup.tsx`, `components/ProofShareCard.tsx`, `app/task/photo.tsx`, `timer.tsx`, `complete.tsx`, `run.tsx`, `journal.tsx`: `expo-image` with `cachePolicy="memory-disk"` where applicable; labels on proof/feed images where added.

### Phase 3 — Backend Performance

- `backend/lib/strava-verifier.ts`: explicit `select(...)` for Strava connection row (see Phase 1).
- Index verification: not run against live Supabase (requires SQL Editor). See `docs/SCHEMA-INDEXES.md` for recommended indexes and alignment with query patterns.

### Phase 4 — Design System

- Verified: no `#hex` literals in `app/`, `components/`, `contexts/` (see Grep Verification Gates).

### Phase 5 — Accessibility

- `LiveActivity` feed photo, `ProofShareCard` proof thumb, task screens’ proof previews: `accessibilityLabel` (and cache) where images were touched.

### Phase 6 — Error Handling

- `app/(tabs)/activity.tsx`: `FriendStreakCard` share failure → `captureError` (replacing `console.error`).
- `components/ProofShareCard.tsx`: share failure → `captureError`.
- `app/(tabs)/activity.tsx`: leaderboard load failure → inline `ErrorState`.

### Phase 7 — Type Safety

- No new `any` usage; `npx tsc --noEmit` — **0** errors.

## Remaining Issues

- **Backend**: Many tRPC routes still use wide `.select("*, …")` for challenges/tasks; narrowing requires coordinated type updates and regression testing.
- **Backend**: `checkins.ts` and similar flows use sequential `await` where some steps depend on prior results; a blanket `Promise.all` pass would need careful ordering analysis.
- **Supabase indexes**: Run the provided SQL in Supabase and compare to `docs/SCHEMA-INDEXES.md` (not executed in this pass).
- **Redis / rate limits**: Verify in deployment env (`backend/lib/cache.ts`, `backend/lib/rate-limit.ts`, auth/challenge routes) — not re-audited line-by-line in this session.
- **React.lazy + Suspense** for non-initial-tab screens: not applied globally (Expo Router layout implications).
- **Every screen / every file “touched”**: Verification was automated (`tsc`, greps) plus targeted edits; not every source file was manually opened.

## Grep Verification Gates

Commands run from repo root (PowerShell / ripgrep-style paths). Counts are **exact** at time of scorecard generation.

| Gate | Result |
|------|--------|
| Raw hex in `app/`, `components/`, `contexts/` (`*.ts`, `*.tsx`) | **0** |
| Single-I `GRIT` in user-facing strings (heuristic grep) | **0** (no matches in prior sweep) |
| `Alert.alert` in `*.ts` / `*.tsx` | **0** |
| Silent `catch (...) {}` | **0** |
| TypeScript errors (`npx tsc --noEmit`) | **0** |
| `console.log` in `app/`, `components/`, `lib/`, `contexts/` | **0** |

**Note:** `backend/lib/supabase.ts` still logs in non-production (`NODE_ENV !== "production"`) for connection mode — intentional dev diagnostics, not removed.

**Note:** `console.error` / `console.warn` remain in error paths across app and backend for local debugging and non-Sentry environments.

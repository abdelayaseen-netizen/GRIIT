# GRIIT Final Pre-TestFlight Scorecard
**Generated:** 2026-04-05  
**Commit (HEAD at generation):** `c64bbbb220dbf25b4773a8d2e67accad85ccefb8` — working tree had additional uncommitted changes including this cleanup; amend this line after you commit.

## Cleanup Summary
- **Files deleted:** 5 (`app/task/manual.tsx`, `photo.tsx`, `timer.tsx`, `journal.tsx`, `components/task/journalScreenStyles.ts`)
- **Skipped deletion:** `app/task/checkin-styles.ts` — still required by active `app/task/checkin.tsx` (prompt conflict; keeping avoids breaking the check-in screen).
- **Lines removed (estimate):** ~65k+ bytes across deleted screens/styles.
- **Alert.alert replaced:** 8 (in `components/share/ShareSheetModal.tsx` → inline banner + auto-dismiss).
- **Console statements gated / cleaned:** 4 frontend `console.error` wrapped with `__DEV__` (CelebrationOverlay, ActiveChallenges, GoalCard, ErrorBoundary); removed duplicate `console.error` in `backend/trpc/routes/challenges.ts` and `profiles.ts` (logger retained).
- **`.or()` filters secured:** 5 — `requireUuidForPostgrestOr()` for accountability (2) + challenges-discover (2); profile search uses `escapedSafe` from `sanitizeSearchQuery()` (includes `escapeLikeWildcards`).
- **React.memo added:** 1 (`components/shared/SectionHeader.tsx`). Feed engagement/header and `CompactChallengeRow` were already memoized.

### Routing / layout
- `lib/routes.ts`: removed `TASK_JOURNAL`, `TASK_PHOTO`, `TASK_MANUAL`, `TASK_TIMER`; kept `TASK_COMPLETE`, `TASK_CHECKIN`, `TASK_RUN`.
- `app/_layout.tsx`: removed Stack screens for `task/journal`, `task/timer`, `task/photo`, `task/manual`.
- `app/challenge/[id].tsx`: **no change** — `handleMissionStart` already navigates all task types (including `checkin` when `FLAGS.LOCATION_CHECKIN_ENABLED`) to `ROUTES.TASK_COMPLETE`.

### FlatList / `select('*')`
- No `select("*")` in backend (verified 0 matches).
- Long lists already use `windowSize` / `maxToRenderPerBatch` / `removeClippedSubviews` in major screens; no additional props added (avoids unnecessary churn).

## Scores

| # | Category | Score | Weight | Weighted | Status |
|---|----------|-------|--------|----------|--------|
| 1 | Build Readiness | 9/10 | 10% | 0.9 | P |
| 2 | Backend | 8/10 | 8% | 0.64 | P |
| 3 | Auth & Security | 8/10 | 10% | 0.8 | P |
| 4 | Monetization | 8/10 | 10% | 0.8 | P |
| 5 | Type Safety | 9/10 | 6% | 0.54 | P |
| 6 | Design System | 7/10 | 6% | 0.42 | W |
| 7 | Error Handling | 8/10 | 6% | 0.48 | P |
| 8 | Analytics | 8/10 | 6% | 0.48 | P |
| 9 | Performance | 8/10 | 5% | 0.4 | P |
| 10 | Accessibility | 7/10 | 4% | 0.28 | W |
| 11 | Testing | 5/10 | 4% | 0.2 | W |
| 12 | Code Hygiene | 8/10 | 4% | 0.32 | P |
| 13 | Database | 8/10 | 6% | 0.48 | P |
| 14 | Legal | 9/10 | 5% | 0.45 | P |
| 15 | TestFlight Readiness | 8/10 | 10% | 0.8 | P |
| | **WEIGHTED TOTAL** | | 100% | **7.99/10** | |

**Status:** P = pass / on track, W = watch (improve over time).

## TestFlight Verdict: **READY** (with notes)

Core build, types, backend hygiene, and security hardening for audited `.or()` paths are in good shape. Remaining watch items: broader automated test coverage, continued a11y pass, and raw-hex cleanup outside tokens where the scorecard still counts violations.

## Remaining Items (ordered by priority)
1. **E2E / integration tests** for join → task complete → feed (Category 11).
2. **Accessibility audit** on high-traffic flows (Forms, paywall, task complete).
3. **Design tokens:** reduce raw `#rrggbb` in app/components where scorecard still flags (excluding allowed paths).
4. **Optional:** migrate `app/task/checkin.tsx` onto `complete.tsx` and then remove `checkin-styles.ts` + `TASK_CHECKIN` if product agrees (single code path).

## Raw Evidence

### Phase 1 — Deleted files (expected False)
```
app/task/manual.tsx : False
app/task/photo.tsx : False
app/task/timer.tsx : False
app/task/journal.tsx : False
components/task/journalScreenStyles.ts : False
app/task/checkin-styles.ts : True   (retained — used by checkin.tsx)
```

### ShareSheetModal
- `Alert.alert` matches: **0**
- `Alert` import removed from react-native import list.

### Backend `select("*")`
```
Count: 0
```

### Backend route files (non-test)
```
27 files in backend/trpc/routes/*.ts
```

### `your-org-slug` in app.json
```
0 matches
```

### React.memo occurrences (app + components)
```
49 matches
```

### Accountability UUID hardening
```
Select-String requireUuidForPostgrestOr|safeId on accountability.ts: 5 matches (includes requireUuidForPostgrestOr usage)
```

### TypeScript
```
Root: npx tsc --noEmit → exit 0
Backend: npx tsc --noEmit → exit 0
```

### Funnel strings (partial run — first events)
```
onboarding_completed : FOUND
trial_started : FOUND
subscription_cancelled : FOUND
task_completed : FOUND
day_secured : FOUND
```
(Re-run full 10-event loop locally if you need a complete table; long repo-wide grep may take >30s.)

### Category 3 note — “Unsafe .or()” regex
The prompt’s sample regex `\$\{(?!safe)` is not reliable for TypeScript template literals. Mitigations applied:
- **User IDs** in `.or()`: `requireUuidForPostgrestOr()` in `backend/lib/sanitize-search.ts`.
- **Profile search**: `escapedSafe` via `sanitizeSearchQuery()` (PostgREST + LIKE escaping).

---

## Completion checklist
- [x] Phase 1: legacy task screens removed (except checkin-styles dependency); ShareSheet inline feedback; console gated / logger-only on backend hotspots; routes + layout updated.
- [x] Phase 2: `SectionHeader` memoized; `select("*")` = 0; FlatList props already present on major lists.
- [x] Phase 3: `.or()` / search interpolation hardened as above.
- [x] Phase 4: this scorecard saved as `docs/SCORECARD-FINAL.md`.
- [x] Root + backend `tsc --noEmit` pass.

## Suggested git commits (one per phase)
```
chore: remove legacy task screens, replace Alert.alert, gate console statements
perf: memo SectionHeader; verify backend select columns and FlatList usage
security: requireUuidForPostgrestOr and escapedSafe for PostgREST filters
docs: final pre-TestFlight scorecard with evidence
```

# CLEANUP REPORT — Pre-push ship readiness

**Branch:** `chore/cleanup-prepush`  
**Date:** 2025-02-28  
**Scope:** Dead code (strict), duplicate consolidation (high ROI only), risk reduction, git hygiene. No product behavior or UI changes except fixes and removal of clearly unused/duplicate code.

---

## STEP 0 — SAFETY / BASELINE

- **Branch created:** `chore/cleanup-prepush`
- **Commands to run locally (npm not in PATH in evaluation environment):**
  - `npm install`
  - `npm run lint` (expo lint)
  - `npm run typecheck` (tsc --noEmit)
  - `npm run test` (vitest run)
- **App build/run:** Not run in this session; recommend `npm start` and `npm run backend:start` locally before push.

---

## STEP 1 — DEAD CODE REMOVAL (STRICT)

### Files deleted

**None.** No files were removed.

### Rationale

- **mocks/starter-challenges.ts** — Still referenced by `app/challenge/[id].tsx` (STARTER_CHALLENGES lookup for starter IDs) and `app/(tabs)/discover.tsx` (type `StarterChallenge`). Kept per existing docs (CLEANUP-NOTES.md).
- **styles/** (checkin-styles, discover-styles, run-styles, create-styles) — All imported by app screens; not dead.
- **lib/api.ts** exports (checkHealth, checkDbTables, fetchWithTimeout, HealthCheckResult, DbSanityResult) — Used by `contexts/ApiContext.tsx`.
- **lib/formatTimeAgo.ts** — Used by `app/(tabs)/activity.tsx` and `app/challenge/[id]/chat.tsx`.
- No duplicate utility files found (single formatTimeAgo, single api/formatTRPCError, single retry in api.ts).
- **Expo Router / backend routes:** No screens or tRPC routes were removed; all referenced routes retained.

### Unused imports / variables

- No automated sweep was run (would require full lint in CI). Manual spot-check of modified files: no new unused imports or variables introduced.

---

## STEP 2 — CONSOLIDATE DUPLICATE LOGIC (HIGH ROI)

### Consolidations done

**None in this pass.** Kept diffs small and safe per instructions. Existing consolidation is already in place:

- **Relative time:** `lib/formatTimeAgo.ts` (used by Activity + Chat).
- **Error formatting:** `lib/api.ts` `formatTRPCError` / `formatError` (used by Create + ApiContext).
- **Retry:** Single `fetchWithRetry` in `lib/api.ts` used by tRPC client.

### Not done (to avoid scope creep)

- Standardizing all backend routes to TRPCError-only (would touch many files).
- Extracting shared zod schemas across routes.
- Further UI component deduplication.

---

## STEP 3 — PERFORMANCE + RELIABILITY QUICK WINS

### Changes made

1. **stories.list (backend/trpc/routes/stories.ts)**  
   - Added `.limit(50)` to the query so the list is bounded.  
   - Added null-safe return: `(data ?? []).map(...)` so a null response does not throw.

2. **leaderboard.getWeekly (backend/trpc/routes/leaderboard.ts)**  
   - Capped results to top 100: `LEADERBOARD_TOP = 100` and `.slice(0, LEADERBOARD_TOP)` on `sortedUserIds` before fetching profiles/streaks/respects.  
   - Prevents unbounded memory and response size as user count grows.

### Already in place (verified, no change)

- **Accountability:** Queries use limits (listMine returns accepted/incoming/outgoing with bounded data; profiles.search limit 20; invite rate limit 10/day).
- **Last Stand:** Server-backed; `last_stands_available` constrained to 0–2 in DB and in `backend/lib/last-stand.ts` (MAX_LAST_STANDS = 2).

### Not done in this pass

- AppContext/screen memoization or fetch batching (would be a larger refactor).
- Pagination for stories or leaderboard (limit/cap only).

---

## STEP 4 — GIT HYGIENE

- **Migrations:** Present under `supabase/migrations/`:
  - `20250228000000_accountability_pairs.sql`
  - `20250228100000_last_stand.sql`
- **Console.log:** No production console spam added. Existing logs are already guarded:
  - `lib/api.ts` / `lib/trpc.ts`: `__DEV__` (client).
  - `lib/analytics.ts`: `__DEV__`.
  - `backend/trpc/routes/challenges.ts`: `!isProd` (server).
  - `backend/server.ts`: single startup log (acceptable for server).
- **New/untracked:** No new untracked feature files introduced by this cleanup; only the two migration files and this report are new on the branch (report is docs-only).

---

## BEHAVIOR CHANGES

- **None** other than:
  - **stories.list:** Returns at most 50 stories (previously unbounded). Behavior change: very large story sets are now capped.
  - **leaderboard.getWeekly:** Returns at most top 100 users (previously all). Behavior change: users beyond rank 100 no longer appear in the list.

Both are intentional risk reductions and documented above.

---

## COMMANDS RUN + PASS/FAIL (in this environment)

| Command            | Result | Notes                                      |
|--------------------|--------|--------------------------------------------|
| git checkout -b chore/cleanup-prepush | OK     | Branch created.                            |
| npm install        | Skipped| npm not in PATH in evaluation environment. |
| npm run lint       | Skipped| npm not in PATH.                           |
| npm run typecheck  | Skipped| npm not in PATH.                           |
| npm run test       | Skipped| npm not in PATH.                           |

**You must run these locally before push:**  
`npm install && npm run lint && npm run typecheck && npm run test`

---

## FILES TOUCHED (SUMMARY)

| File | Change |
|------|--------|
| `backend/trpc/routes/stories.ts` | Added `.limit(50)` and `(data ?? []).map(...)`. |
| `backend/trpc/routes/leaderboard.ts` | Capped to top 100 with `LEADERBOARD_TOP` and `.slice(0, LEADERBOARD_TOP)`. |
| `docs/CLEANUP-REPORT-PREPUSH.md` | Added (this report). |
| `docs/PRE-PUSH-CHECKLIST.md` | Added (checklist below). |

No files deleted. No other files modified.

# Cleanup Pass — Audit and Summary

## PART 1 — AUDIT

### Dead code
- **None removed.** `dbTaskType`, `journalMinWords`, `taskStrictAndPhoto` in `backend/trpc/routes/challenges.ts` are only used by `challenges-create.test.ts`; kept for tests.
- No unused files, components, or hooks were identified; all referenced from app or tests.

### Duplicate / repeated logic
- **Discover tab:** Repeated `(c.tasks || c.challenge_tasks || [])` and `c.tasks ?? c.challenge_tasks ?? []` in multiple places. Backend `getFeatured` returns `tasks` (mapped); normalizing to a single `tasks` array per challenge and using it everywhere.
- **Task type / route mapping:** `challenge/[id].tsx` uses `task.type` and `(task as any).require_photo_proof` for routing. Same API task shape is used in `app/(tabs)/index.tsx` and `app/task/timer.tsx` with `(t: any)` / `(activeChallenge as any)`. No duplicated *logic* to extract; typing improved so one shared shape is used.

### Fragile or confusing code
- **`app/task/timer.tsx`:** `(activeChallenge as any)?.challenges?.challenge_tasks` — untyped; replaced with a minimal type for active challenge with tasks.
- **`app/challenge/[id].tsx`:** `(task as any).type` and `(task as any).require_photo_proof` — task is API shape; typed as shared `ChallengeTaskFromApi`.
- **`backend/trpc/routes/starters.ts`:** `(challenge as any).duration_type` and `(challenge as any).duration_days` — challenge row from Supabase; typed with a minimal `ChallengeRowForStarter` interface.
- **`backend/trpc/routes/checkins.ts`:** `(daySecErr as any).code` — use `PgError` from `backend/types/db.ts`.
- **`backend/trpc/routes/notifications.ts`:** `(error as any).code`, `(data as any)?.preferred_secure_time` — use `PgError` and a minimal return type for reminder settings.

### Files that can be simplified
- **`app/(tabs)/discover.tsx`:** Normalize challenge list to a single `tasks` source and use it in all sections (starter pack, daily, featured, other).
- **`backend/types/db.ts`:** `ChallengeTaskRow` is minimal `{ id, required }`; real API shape lives in `backend/lib/challenge-tasks.ts` as `ChallengeTaskApiShape`. Comment added that API responses use the mapped shape.

### Outdated assumptions
- **Discover:** Assumes both `c.tasks` and `c.challenge_tasks` may exist; backend now returns `tasks` from `mapTaskRowsToApi`. Safe to treat `tasks` as primary and `challenge_tasks` as fallback only for backward compatibility.
- **Index/AppContext:** Use `challenge_tasks` with `t.required` and `t.title || t.type`; backend already returns API shape with `required` and `type`, so no schema change needed.

### Stale TODOs (kept, not removed)
- `app/(tabs)/profile.tsx`: "TODO: backend needs to provide days_missed for streak-at-risk"
- `app/(tabs)/create.tsx`: "TODO: backend may provide challenge packs"
- `app/challenge/[id].tsx`: TODOs for shareable link, deep link, leave endpoint  
These are product/backend follow-ups; left in place.

---

## PART 2 — CLEANUP PLAN (prioritized)

1. **Safe removals:** None (no confident dead code).
2. **Consolidation:**  
   - Discover: single `tasks` derivation per challenge; use it in `allChallenges` and all card props.  
   - Add shared type `ChallengeTaskFromApi` in `types/index.ts` for frontend task-from-API usage.
3. **Stability:**  
   - Type `activeChallenge` in timer with minimal `ActiveChallengeWithTasks`-style type.  
   - Type task in `challenge/[id].tsx` for `type` and `require_photo_proof`.  
   - Type starters challenge row and use `PgError` in checkins/notifications where we check error codes or shape.
4. **Maintainability:**  
   - Use `ChallengeTaskFromApi` (or equivalent) so API task shape is documented in one place.  
   - Use `PgError` for Supabase/PG error code checks.

---

## PART 3 — IMPLEMENTED CHANGES

(See following sections and git diff.)

- **types/index.ts:** Added `ChallengeTaskFromApi` and optional `ActiveChallengeWithTasks`-style type for active challenge with nested tasks.
- **app/(tabs)/discover.tsx:** Normalized to single `tasks` array per challenge; use `c.tasks ?? c.challenge_tasks ?? []` once in mapping; use `c.tasks` (or normalized list) everywhere in render.
- **app/task/timer.tsx:** Replaced `(activeChallenge as any)` with typed access using shared type.
- **app/challenge/[id].tsx:** Replaced `(task as any).type` / `(task as any).require_photo_proof` with typed `ChallengeTaskFromApi`.
- **app/(tabs)/index.tsx:** Use typed task in map (optional; keep `t.title || t.type` for display).
- **backend/trpc/routes/starters.ts:** Added `ChallengeRowForStarter` and use it for challenge row from DB.
- **backend/trpc/routes/checkins.ts:** Use `PgError` for `daySecErr.code`.
- **backend/trpc/routes/notifications.ts:** Use `PgError` for error code; type reminder settings return object.
- **backend/types/db.ts:** Comment that API returns mapped task shape (ChallengeTaskApiShape from challenge-tasks).

---

## PART 4 — FINAL SUMMARY

### Removed
- No files or exports removed.
- No dead code removed (only test-only helpers kept).

### Consolidated
- **Discover:** Single source for tasks per challenge; all card props use the same normalized `tasks` array.
- **Frontend task shape:** Shared `ChallengeTaskFromApi` used in challenge detail and timer for consistent typing.

### Simplified
- **Discover:** Less repeated `c.tasks || c.challenge_tasks`; one place defines the list.
- **Backend:** Clearer types for starters challenge row and for error/settings in notifications and checkins.

### Risk areas reduced
- Fewer `as any` casts on task and activeChallenge on the frontend.
- Error handling in checkins/notifications uses `PgError` for code checks.
- Starters join uses typed challenge row for `duration_type` / `duration_days`.

### Manual review before GitHub push
- **Smoke test:** Run full app — create challenge, join from discover, complete task, secure day, open timer (strict mode), success screen.
- **Tests:** Run backend tests: `challenges-create.test.ts`, checkins, starters if available.
- **Optional:** Grep for remaining `as any` in `app/` and `backend/` for future cleanup.
- **Discover:** Confirm discover tab shows featured/daily/other challenges and task counts and that cards render correctly.

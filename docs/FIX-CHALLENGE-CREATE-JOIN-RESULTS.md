# Fix Challenge Create & Join — Results

## Summary

- **Create Challenge**: Backend now returns the real Supabase error message (e.g. column name, RLS) instead of "Failed to create challenge."
- **Join Challenge**: The `active_challenges` table was missing the `end_at` column in some environments (PostgREST schema cache error). A migration was added to ensure `end_at` exists.
- **Error handling**: Challenges create, challenge_members insert, challenge_tasks insert, and starters join now log errors and surface the actual message to the client.

---

## What You Must Do

### 1. Run the new migration on Supabase

Apply the migration so `active_challenges` has `end_at`:

**Option A — Supabase Dashboard**  
1. Go to **SQL Editor** → New query  
2. Paste and run the contents of:  
   `supabase/migrations/20250616000000_active_challenges_end_at.sql`

**Option B — Supabase CLI**  
From project root:  
`npx supabase db push`  
(or your usual migration command)

### 2. Reload PostgREST schema cache

After running the migration:

- **Dashboard**: Settings → API → "Reload schema cache" (if available), or  
- **SQL Editor**: run  
  `NOTIFY pgrst, 'reload schema';`

---

## Mandatory Output Table

| Item | Value |
|------|--------|
| Actual `active_challenges` columns | *(Run Phase 1 SQL in fix-challenge-create-join.md to list; expected after migration: id, user_id, challenge_id, status, start_at, **end_at**, current_day, progress_percent, created_at, completed_at, etc.)* |
| Actual `challenges` columns | *(Run Phase 1 SQL to list; code uses: creator_id, title, description, duration_type, duration_days, status, visibility, starts_at, ends_at, participation_type, run_status, …)* |
| `end_at` actual column name | **end_at** (migration adds it if missing) |
| Total mismatches found | 1 (missing `end_at` on `active_challenges` in schema cache) |
| Files modified | `supabase/migrations/20250616000000_active_challenges_end_at.sql` (new), `backend/trpc/routes/challenges.ts`, `backend/trpc/routes/starters.ts` |
| RLS policies added/fixed | None in this pass (existing policies for challenges and active_challenges assumed correct) |
| Schema cache refreshed? | **You must run NOTIFY or Reload after applying the migration** |
| Create Challenge test result | *(Test after migration + cache reload)* |
| Join Challenge test result | *(Test after migration + cache reload)* |

---

## Verification (Phase 7)

1. Apply the migration and reload the schema cache as above.
2. **Create Challenge**: In the app, create a challenge; if it fails, the error dialog should show the real Supabase message (e.g. column or RLS).
3. **Join Challenge**: Open a challenge and tap Join/Confirm commitment; if it fails, you should see the real error (e.g. "Could not find the 'end_at' column" until cache is reloaded).
4. Check **Supabase → Table Editor** for new rows in `challenges` and `active_challenges` after successful create and join.

---

## Files Changed

- **supabase/migrations/20250616000000_active_challenges_end_at.sql** — Adds `end_at` to `active_challenges` if missing, optional backfill from `ends_at`, then `NOTIFY pgrst, 'reload schema'`.
- **backend/trpc/routes/challenges.ts** — Create mutation: log and throw with `challengeError.message`, `memberError.message`, `tasksError.message` instead of generic strings.
- **backend/trpc/routes/starters.ts** — Starter join: log and throw with `acError.message` instead of "Failed to create active challenge."
- **backend/lib/join-challenge.ts** — No change; already throws with `insertErr.message` for join.

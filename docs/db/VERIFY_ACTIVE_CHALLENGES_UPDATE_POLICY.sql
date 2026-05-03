-- Run in Supabase SQL Editor against PRODUCTION (project ref: iazdfbqwudlodozgoyov).
-- Run BEFORE applying the migration to capture baseline, then AGAIN after.
--
-- Expected result AFTER migration applied:
--   - One row with policyname = 'Users can update own active challenges'
--   - cmd = 'UPDATE'
--   - qual contains 'auth.uid() = user_id'
--   - with_check contains 'auth.uid() = user_id'
--
-- If the row exists BEFORE the migration is applied, that confirms the policy
-- was created via SQL Editor previously and never committed — the migration
-- is still safe to apply (DROP IF EXISTS makes it idempotent).

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual::text       AS using_clause,
  with_check::text AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'active_challenges'
ORDER BY cmd, policyname;

-- Quick functional smoke test (optional — only run as a non-superuser session
-- with a known active_challenges row owned by the current auth.uid()):
--
-- UPDATE public.active_challenges
-- SET progress_percent = progress_percent
-- WHERE id = '<some-row-you-own>';
--
-- Expected: UPDATE 1 (one row affected). If "UPDATE 0", RLS is still blocking.

-- S2 RLS baseline: documents the tightened check_ins INSERT + UPDATE policies
-- that are already live on the production database (applied directly in the
-- Supabase SQL editor by the repo owner).
--
-- Running this migration on a fresh DB will create the correct policies.
-- Running it against the production DB is safe: DROP ... IF EXISTS ensures
-- idempotency. The resulting policies will match the live state exactly.
--
-- Gap closed: old INSERT policy only checked auth.uid() = user_id.
-- An authenticated user who knew a target's active_challenge_id and task_id
-- could write a fake check_in row via PostgREST, bypassing tRPC ownership
-- guards. The new policies add an active_challenges ownership sub-select
-- to both INSERT and UPDATE.

-- INSERT: user must own the active_challenge referenced by the new row
DROP POLICY IF EXISTS "Users can insert own check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;

CREATE POLICY "Users can insert own check_ins"
  ON public.check_ins
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.active_challenges ac
      WHERE ac.id = check_ins.active_challenge_id
        AND ac.user_id = auth.uid()
    )
  );

-- UPDATE: existing row must be owned, and active_challenge must still be owned
DROP POLICY IF EXISTS "Users can update own check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update own check-ins" ON public.check_ins;

CREATE POLICY "Users can update own check_ins"
  ON public.check_ins
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.active_challenges ac
      WHERE ac.id = check_ins.active_challenge_id
        AND ac.user_id = auth.uid()
    )
  );

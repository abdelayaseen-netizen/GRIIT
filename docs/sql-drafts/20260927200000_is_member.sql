-- Draft only. Do not apply from this session.
-- Fixes challenge_members_select 42P17 recursion by moving the
-- "viewer is already a member of this challenge" check into a
-- SECURITY DEFINER helper that bypasses RLS on the self-join.
--
-- Writer: none. This function is read-only. Existing
-- challenge_members INSERT/UPDATE policies stay owner-scoped
-- (auth.uid() = user_id). Do not add a user INSERT/UPDATE policy.
--
-- Viewer is always auth.uid() inside the function. No user-id argument,
-- so a client cannot ask "is this other person a member?".
--
-- No status filter. Repo create has status
-- (supabase/migrations/20250312000000_team_challenges.sql:42) but live
-- columns are unconfirmed. Run the preview below first. If status exists
-- and is still the membership flag, add AND cm.status = 'active'.
--
-- Preview (read-only). One statement. Editor shows only the last result.
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'challenge_members'
-- ORDER BY ordinal_position;

DROP FUNCTION IF EXISTS public.is_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_member(uuid);

CREATE OR REPLACE FUNCTION public.is_member(p_challenge_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenge_members cm
    WHERE cm.challenge_id = p_challenge_id
      AND cm.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "challenge_members_select" ON public.challenge_members;
CREATE POLICY "challenge_members_select" ON public.challenge_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_member(challenge_id)
  );

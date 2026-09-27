-- Draft only. Do not apply from this session.
-- Fixes challenge_members_select 42P17 recursion by moving the
-- "viewer is already a member of this challenge" check into a
-- SECURITY DEFINER helper that bypasses RLS on the self-join.
--
-- Writer: none. This function is read-only. Existing
-- challenge_members INSERT/UPDATE policies stay owner-scoped
-- (auth.uid() = user_id). Do not add a user INSERT/UPDATE policy.

CREATE OR REPLACE FUNCTION public.is_member(p_challenge_id uuid, p_user_id uuid)
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
      AND cm.user_id = p_user_id
      AND cm.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_member(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "challenge_members_select" ON public.challenge_members;
CREATE POLICY "challenge_members_select" ON public.challenge_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_member(challenge_id, auth.uid())
  );

-- Add DELETE policy for challenge_members so members can leave team challenges.
-- Creator cannot leave (enforced in tRPC, not here — RLS just needs to allow the delete).
DROP POLICY IF EXISTS "challenge_members_delete_own" ON challenge_members;
CREATE POLICY "challenge_members_delete_own" ON challenge_members FOR DELETE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

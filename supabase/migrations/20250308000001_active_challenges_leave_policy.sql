-- Allow users to delete their own active_challenges row (for "leave challenge").
-- check_ins reference active_challenges(id) ON DELETE CASCADE, so deleting the row cleans up check_ins.
DROP POLICY IF EXISTS "Users can delete own active challenges" ON active_challenges;
CREATE POLICY "Users can delete own active challenges" ON active_challenges
  FOR DELETE USING (auth.uid() = user_id);

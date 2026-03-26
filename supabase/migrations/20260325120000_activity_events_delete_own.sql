-- Allow users to delete their own feed events (e.g. remove a post from the feed).
DROP POLICY IF EXISTS "Users can delete own activity" ON public.activity_events;
CREATE POLICY "Users can delete own activity"
  ON public.activity_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

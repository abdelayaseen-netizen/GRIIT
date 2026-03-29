-- Allow authenticated users to remove their own feed reactions (respect toggle) and comments.
-- Without DELETE policies, RLS blocks these operations for the user JWT used by tRPC.

CREATE POLICY "Users can delete own reactions" ON public.feed_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.feed_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

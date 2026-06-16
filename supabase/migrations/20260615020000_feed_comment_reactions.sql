-- Binary respect (flame) reactions on individual feed comments.
CREATE TABLE IF NOT EXISTS public.feed_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT feed_comment_reactions_user_comment_unique UNIQUE (user_id, comment_id)
);

ALTER TABLE public.feed_comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all comment reactions" ON public.feed_comment_reactions;
CREATE POLICY "Users can read all comment reactions" ON public.feed_comment_reactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own comment reactions" ON public.feed_comment_reactions;
CREATE POLICY "Users can insert own comment reactions" ON public.feed_comment_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comment reactions" ON public.feed_comment_reactions;
CREATE POLICY "Users can delete own comment reactions" ON public.feed_comment_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_comment_reactions_comment ON public.feed_comment_reactions(comment_id);

NOTIFY pgrst, 'reload schema';

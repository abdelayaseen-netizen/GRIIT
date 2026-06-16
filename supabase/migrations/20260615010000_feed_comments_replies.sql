-- One-level comment replies on feed posts.
ALTER TABLE public.feed_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID NULL
  REFERENCES public.feed_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_feed_comments_parent
  ON public.feed_comments(parent_comment_id);

NOTIFY pgrst, 'reload schema';

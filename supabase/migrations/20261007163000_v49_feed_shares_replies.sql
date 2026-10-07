-- Applied in production on Oct 7, 2026. Do not run again.
-- v49 Feed. Two stores the app cannot compute from existing rows.
-- feed_shares: one row per card share or copied link. share_count is COUNT(*)
-- for the event (decision 218: card shares + copied links).
-- feed_comments.parent_id: a reply points at the comment it answers.

ALTER TABLE public.feed_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.feed_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_feed_comments_parent
  ON public.feed_comments(parent_id);

CREATE TABLE IF NOT EXISTS public.feed_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('card', 'link')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all shares"
  ON public.feed_shares
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own shares"
  ON public.feed_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_shares_event
  ON public.feed_shares(event_id);

COMMENT ON TABLE public.feed_shares IS
  'One row per outward share of a feed card. kind card = system share sheet. kind link = copied link. share_count is the row count.';

COMMENT ON COLUMN public.feed_comments.parent_id IS
  'Set when this comment replies to another comment on the same event. Null for a top-level comment.';

NOTIFY pgrst, 'reload schema';

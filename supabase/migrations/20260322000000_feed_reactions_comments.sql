-- Feed reactions: one reaction per user per event (upsertable)
CREATE TABLE IF NOT EXISTS public.feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('fire', 'respect', 'discipline')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT feed_reactions_user_event_unique UNIQUE (user_id, event_id)
);

ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all reactions" ON public.feed_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reactions" ON public.feed_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON public.feed_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Feed comments: short messages on activity events
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all comments" ON public.feed_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own comments" ON public.feed_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feed_reactions_event ON public.feed_reactions(event_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_event ON public.feed_comments(event_id);

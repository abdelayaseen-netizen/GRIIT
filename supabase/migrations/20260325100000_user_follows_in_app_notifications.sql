-- Social graph + in-app notification inbox for Activity tab.

CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_no_self CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows (following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own follows" ON public.user_follows;
CREATE POLICY "Users read own follows" ON public.user_follows
  FOR SELECT TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

DROP POLICY IF EXISTS "Users insert own follow" ON public.user_follows;
CREATE POLICY "Users insert own follow" ON public.user_follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users delete own follow" ON public.user_follows;
CREATE POLICY "Users delete own follow" ON public.user_follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('respect', 'comment', 'follow', 'rank')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_unread ON public.in_app_notifications (user_id, read, created_at DESC);

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own in_app_notifications" ON public.in_app_notifications;
CREATE POLICY "Users read own in_app_notifications" ON public.in_app_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own in_app_notifications" ON public.in_app_notifications;
CREATE POLICY "Users update own in_app_notifications" ON public.in_app_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

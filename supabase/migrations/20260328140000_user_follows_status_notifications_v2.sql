-- Pending follow requests + in_app_notifications title/body/data + extended types

ALTER TABLE public.user_follows
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'accepted';

UPDATE public.user_follows SET status = 'accepted' WHERE status IS NULL OR status = '';

ALTER TABLE public.user_follows DROP CONSTRAINT IF EXISTS user_follows_status_check;
ALTER TABLE public.user_follows ADD CONSTRAINT user_follows_status_check
  CHECK (status IN ('accepted', 'pending'));

DROP POLICY IF EXISTS "Users update own follow rows" ON public.user_follows;
CREATE POLICY "Users update own follow rows" ON public.user_follows
  FOR UPDATE TO authenticated
  USING (auth.uid() = following_id OR auth.uid() = follower_id)
  WITH CHECK (auth.uid() = following_id OR auth.uid() = follower_id);

ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.in_app_notifications DROP CONSTRAINT IF EXISTS in_app_notifications_type_check;
ALTER TABLE public.in_app_notifications ADD CONSTRAINT in_app_notifications_type_check
  CHECK (type IN ('respect', 'comment', 'follow', 'rank', 'follow_request', 'general'));

DROP POLICY IF EXISTS "Users insert notifications" ON public.in_app_notifications;
CREATE POLICY "Users insert notifications" ON public.in_app_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

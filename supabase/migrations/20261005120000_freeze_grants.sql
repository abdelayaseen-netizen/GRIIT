-- freeze_grants is already applied in production.
-- This file matches that table so the repo can recreate it.
-- Writes go through the service role. Members can read their own rows.

CREATE TABLE IF NOT EXISTS public.freeze_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('earned', 'refill')),
  streak_at_grant INTEGER,
  granted_date_key TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, source, granted_date_key)
);

CREATE INDEX IF NOT EXISTS idx_freeze_grants_user_id ON public.freeze_grants (user_id);

ALTER TABLE public.freeze_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own freeze_grants" ON public.freeze_grants;
CREATE POLICY "Users can view own freeze_grants"
  ON public.freeze_grants FOR SELECT
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

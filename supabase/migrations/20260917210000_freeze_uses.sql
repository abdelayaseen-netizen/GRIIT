-- freeze_uses: one row per spent freeze (mirrors last_stand_uses).
-- Pro can hold more than one frozen date inside 30 days; last_freeze_used_at cannot.
-- Apply in the SQL editor. No other schema change.

CREATE TABLE IF NOT EXISTS public.freeze_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, date_key)
);

CREATE INDEX IF NOT EXISTS idx_freeze_uses_user_id ON public.freeze_uses (user_id);
CREATE INDEX IF NOT EXISTS idx_freeze_uses_date_key ON public.freeze_uses (date_key);

ALTER TABLE public.freeze_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own freeze_uses" ON public.freeze_uses;
CREATE POLICY "Users can view own freeze_uses"
  ON public.freeze_uses FOR SELECT
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

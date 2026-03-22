-- day_secures: required for profiles.getSecuredDateKeys (Home WeekStrip).
-- Ensures table exists and authenticated users can SELECT/INSERT their own rows.

CREATE TABLE IF NOT EXISTS public.day_secures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT day_secures_user_id_date_key_unique UNIQUE (user_id, date_key)
);

CREATE INDEX IF NOT EXISTS idx_day_secures_user_id ON public.day_secures (user_id);
CREATE INDEX IF NOT EXISTS idx_day_secures_date_key ON public.day_secures (date_key);

ALTER TABLE public.day_secures ENABLE ROW LEVEL SECURITY;

-- Replace permissive or missing policies with scoped access
DROP POLICY IF EXISTS "Users can view day_secures" ON public.day_secures;
DROP POLICY IF EXISTS "Users can view own day_secures" ON public.day_secures;
CREATE POLICY "Users can view own day_secures" ON public.day_secures
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own day_secures" ON public.day_secures;
CREATE POLICY "Users can insert own day_secures" ON public.day_secures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

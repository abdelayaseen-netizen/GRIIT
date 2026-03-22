-- check_ins: required for checkins.getTodayCheckinsForUser (Home) and task completion.
-- Ensures table exists with expected columns and RLS so authenticated users can read/write own rows.

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  active_challenge_id UUID NOT NULL REFERENCES public.active_challenges (id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.challenge_tasks (id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  value NUMERIC,
  note_text TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_ins_active_task_date_unique UNIQUE (active_challenge_id, task_id, date_key)
);

ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS proof_source TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS proof_payload_json JSONB;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS external_activity_id TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS verification_status TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS completion_image_url TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS heart_rate_avg INTEGER;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS heart_rate_peak INTEGER;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS location_latitude DOUBLE PRECISION;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS location_longitude DOUBLE PRECISION;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS timer_seconds_on_screen INTEGER;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_check_ins_date_key ON public.check_ins (date_key);
CREATE INDEX IF NOT EXISTS idx_check_ins_active_challenge ON public.check_ins (active_challenge_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_active_date ON public.check_ins (active_challenge_id, date_key);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can view own check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can insert own check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update own check_ins" ON public.check_ins;

-- SELECT: own row by user_id, or row tied to an active_challenge the user owns (covers legacy rows)
CREATE POLICY "Users can view own check_ins" ON public.check_ins
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.active_challenges ac
      WHERE ac.id = check_ins.active_challenge_id
        AND ac.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own check_ins" ON public.check_ins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check_ins" ON public.check_ins
  FOR UPDATE
  USING (auth.uid() = user_id);

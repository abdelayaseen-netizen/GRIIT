-- Advanced task verification: per-task photo, timer options, heart rate, location, duration.
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS).

-- =============================================
-- 1) challenge_tasks: new verification columns
-- =============================================

-- Photo proof toggle (per task)
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS require_photo boolean DEFAULT false;

-- Timer options
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS timer_direction text DEFAULT 'countdown';
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS timer_hard_mode boolean DEFAULT false;

-- Workout / heart rate options
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS require_heart_rate boolean DEFAULT false;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS heart_rate_threshold integer DEFAULT 100;

-- Location verification
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS require_location boolean DEFAULT false;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS location_name text;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS location_latitude double precision;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS location_longitude double precision;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS location_radius_meters integer DEFAULT 200;

-- Minimum active duration for workout tasks
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS min_duration_minutes integer;

-- Constraint for timer_direction
ALTER TABLE challenge_tasks DROP CONSTRAINT IF EXISTS valid_timer_direction;
ALTER TABLE challenge_tasks ADD CONSTRAINT valid_timer_direction
  CHECK (timer_direction IN ('countdown', 'countup'));

-- =============================================
-- 2) check_ins: store verification payload
-- =============================================

ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS heart_rate_avg integer;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS heart_rate_peak integer;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS location_latitude double precision;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS location_longitude double precision;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS timer_seconds_on_screen integer;

-- =============================================
-- 3) Storage bucket for task proofs
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-proofs', 'task-proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own proofs" ON storage.objects;
CREATE POLICY "Users can upload own proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public read proofs" ON storage.objects;
CREATE POLICY "Public read proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-proofs');

NOTIFY pgrst, 'reload schema';

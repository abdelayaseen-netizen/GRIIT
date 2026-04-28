-- Task ramp targets: tiny-start progression (optional). NULL start_* with mode=fixed = legacy behavior.

ALTER TABLE public.challenge_tasks
  ADD COLUMN IF NOT EXISTS target_mode TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS start_value NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS start_duration_minutes INTEGER NULL;

ALTER TABLE public.challenge_tasks DROP CONSTRAINT IF EXISTS challenge_tasks_target_mode_check;
ALTER TABLE public.challenge_tasks ADD CONSTRAINT challenge_tasks_target_mode_check
  CHECK (target_mode IN ('fixed', 'ramp'));

NOTIFY pgrst, 'reload schema';

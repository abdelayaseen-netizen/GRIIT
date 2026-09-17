-- Time gate on challenge_tasks. Mode is by | between; start/end are HH:MM local.
-- NULL mode = no time gate. No data backfill — type collapse is read-time.

ALTER TABLE public.challenge_tasks
  ADD COLUMN IF NOT EXISTS gate_time_mode text,
  ADD COLUMN IF NOT EXISTS gate_time_start text,
  ADD COLUMN IF NOT EXISTS gate_time_end text;

ALTER TABLE public.challenge_tasks DROP CONSTRAINT IF EXISTS challenge_tasks_gate_time_mode_check;
ALTER TABLE public.challenge_tasks ADD CONSTRAINT challenge_tasks_gate_time_mode_check
  CHECK (gate_time_mode IS NULL OR gate_time_mode IN ('by', 'between'));

NOTIFY pgrst, 'reload schema';

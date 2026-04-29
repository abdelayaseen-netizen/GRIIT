ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS task_mode text NOT NULL DEFAULT 'full';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_ins_task_mode_check'
  ) THEN
    ALTER TABLE public.check_ins
      ADD CONSTRAINT check_ins_task_mode_check
      CHECK (task_mode IN ('full', 'minimum'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_check_ins_task_mode
  ON public.check_ins(task_mode);

NOTIFY pgrst, 'reload schema';

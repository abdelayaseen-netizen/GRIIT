-- Routine anchors for Tiny Habits–style task reminders.

ALTER TABLE public.challenge_tasks
  ADD COLUMN IF NOT EXISTS routine_anchor TEXT NULL
    CHECK (
      routine_anchor IS NULL OR routine_anchor IN (
        'wake_up','morning_coffee','after_breakfast','after_work',
        'before_bed','after_brushing_teeth','lunch_break','custom'
      )
    ),
  ADD COLUMN IF NOT EXISTS routine_anchor_custom TEXT NULL
    CHECK (routine_anchor_custom IS NULL OR length(routine_anchor_custom) <= 80);

NOTIFY pgrst, 'reload schema';

-- Optional: update example tasks to use new verification options for testing.
-- Run after 20250330000000_task_verification_options.sql.

-- Photo required on run/mile-like tasks (if any)
UPDATE challenge_tasks
SET require_photo = true
WHERE id IN (
  SELECT id FROM challenge_tasks
  WHERE (title ILIKE '%run%' OR title ILIKE '%mile%')
    AND (require_photo IS NOT true)
  LIMIT 2
);

-- Timer: hard mode + countdown on HIIT/workout-like tasks
UPDATE challenge_tasks
SET timer_hard_mode = true,
    timer_direction = 'countdown',
    min_duration_minutes = COALESCE(min_duration_minutes, (config->>'duration_minutes')::int, 20)
WHERE id IN (
  SELECT id FROM challenge_tasks
  WHERE (title ILIKE '%HIIT%' OR title ILIKE '%workout%')
    AND task_type = 'timer'
  LIMIT 2
);

-- Timer: countup (stopwatch) on stretch/meditation
UPDATE challenge_tasks
SET timer_direction = 'countup',
    min_duration_minutes = COALESCE(min_duration_minutes, (config->>'duration_minutes')::int, 10)
WHERE id IN (
  SELECT id FROM challenge_tasks
  WHERE (title ILIKE '%stretch%' OR title ILIKE '%meditation%' OR title ILIKE '%meditate%')
    AND task_type = 'timer'
  LIMIT 2
);

NOTIFY pgrst, 'reload schema';

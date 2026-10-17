-- Build 90 SQL. Yaseen reviews each block with Claude and runs it by hand in Supabase.
-- Never run from the app, a script, or CI. Nothing here has been run against prod by Cursor.

-- ---------------------------------------------------------------------------
-- Chunk 03, item 03.4: seeded tasks whose title unit does not match the task unit.
-- Phone test: "Read 30 min" counted pages. No repo seed carries that row
-- (scripts/seed-challenges.sql, supabase/migrations/*starter*, lib/featured-catalog-seed.ts,
-- backend/lib/daily-challenge-templates.ts all store minutes as task_type 'timer').
-- It is live-only data, so step 1 lists the candidates and step 2 fixes only the rows you confirm.
-- ---------------------------------------------------------------------------

-- Step 1 (read only): counter-style rows whose title says minutes.
-- Expected: "Read 30 min" style rows of task_type 'reading' or 'counter'. Review before step 2.
SELECT
  t.id,
  c.title            AS challenge,
  c.visibility,
  c.status,
  t.title            AS task,
  t.task_type,
  t.config ->> 'target_pages'  AS target_pages,
  t.config ->> 'target_count'  AS target_count,
  t.config ->> 'target_value'  AS target_value,
  t.config ->> 'unit_label'    AS unit_label,
  t.config ->> 'duration_minutes' AS duration_minutes,
  t.config ->> 'reading_session_minutes' AS reading_session_minutes,
  t.min_duration_minutes
FROM public.challenge_tasks t
JOIN public.challenges c ON c.id = t.challenge_id
WHERE t.task_type IN ('reading', 'counter', 'water')
  AND t.title ~* '(\m[0-9]+\s*(min|mins|minute|minutes)\M)'
ORDER BY c.title, t.order_index;

-- Step 1b (read only): the reverse — timer rows whose title says pages / reps / cups.
SELECT
  t.id,
  c.title AS challenge,
  t.title AS task,
  t.task_type,
  t.config ->> 'duration_minutes' AS duration_minutes
FROM public.challenge_tasks t
JOIN public.challenges c ON c.id = t.challenge_id
WHERE t.task_type = 'timer'
  AND t.title ~* '\m(page|pages|rep|reps|cup|cups|glass|glasses)\M'
ORDER BY c.title, t.order_index;

-- Step 2: make a "Read N min" counter a timer of N minutes.
-- Guarded: only reading/counter rows whose title ends in "<N> min(s)/minute(s)".
-- Keeps every other config key. The app reads duration_minutes for a timer (chunk 02.5).
-- Existing check_ins are untouched; new days use the timer.
-- Review the step 1 result first; add "AND t.id IN (...)" if you want to limit it to specific rows.
UPDATE public.challenge_tasks t
SET
  task_type = 'timer',
  config = (coalesce(t.config, '{}'::jsonb) - 'target_pages' - 'target_count' - 'target_value' - 'reading_session_minutes')
           || jsonb_build_object(
                'duration_minutes',
                (regexp_match(t.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1]::int
              ),
  min_duration_minutes = coalesce(
    t.min_duration_minutes,
    (regexp_match(t.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1]::int
  )
WHERE t.task_type IN ('reading', 'counter')
  AND t.title ~* '\m[0-9]+\s*(min|mins|minute|minutes)\M'
  AND (regexp_match(t.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1] IS NOT NULL;

-- Step 3 (read only): confirm.
SELECT t.id, c.title AS challenge, t.title AS task, t.task_type, t.config ->> 'duration_minutes' AS duration_minutes
FROM public.challenge_tasks t
JOIN public.challenges c ON c.id = t.challenge_id
WHERE t.title ~* '\m[0-9]+\s*(min|mins|minute|minutes)\M'
ORDER BY c.title, t.order_index;

-- ============================================================
-- Chunk 06, item 06.4: "Workout everyday" → "Workout every day" in seeded content.
-- The challenge lives in public.challenges (title) and may be repeated in its tasks.
-- Review step 1 first; step 2 changes titles and descriptions only.
-- ============================================================

-- Step 1 (read only): what carries the word.
SELECT 'challenges' AS tbl, c.id, c.title AS text
FROM public.challenges c
WHERE c.title ~* '\meveryday\M' OR coalesce(c.description, '') ~* '\meveryday\M'
UNION ALL
SELECT 'challenge_tasks', t.id, t.title
FROM public.challenge_tasks t
WHERE t.title ~* '\meveryday\M'
ORDER BY 1, 3;

-- Step 2: the word is "every day" (two words) in a title or a description.
-- "everyday" as an adjective ("everyday habits") does not occur in the seeds; if step 1
-- shows one, add "AND id <> '<that id>'" before running.
UPDATE public.challenges
SET title = regexp_replace(title, '\meveryday\M', 'every day', 'gi'),
    description = regexp_replace(coalesce(description, ''), '\meveryday\M', 'every day', 'gi')
WHERE title ~* '\meveryday\M' OR coalesce(description, '') ~* '\meveryday\M';

UPDATE public.challenge_tasks
SET title = regexp_replace(title, '\meveryday\M', 'every day', 'gi')
WHERE title ~* '\meveryday\M';

-- Step 3 (read only): confirm nothing is left.
SELECT c.id, c.title FROM public.challenges c WHERE c.title ~* '\meveryday\M';

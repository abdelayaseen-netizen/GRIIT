-- Build 92 SQL. Yaseen reviews each block with Claude and runs it by hand in Supabase.
-- Never run from the app, a script, or CI. Nothing here has been run against prod by Cursor.

-- ---------------------------------------------------------------------------
-- RUN, Oct 18 (by Yaseen, on production). Step 2 converted 2 tasks to 30-minute timers:
--   8ae7e1d1-2be2-4ca4-bcb8-7eb4bfe42856, 5cb89dcb-f59b-4181-a2b6-c2c0c499bae1
-- Chunk 03, item 03.6: live counter / reading tasks whose CHALLENGE title says minutes
-- but whose task counts pages ("Read" inside "Read 30 min before bed").
-- Build 90's block covered task titles that say minutes; this one covers the challenge title.
-- No repo seed carries such a row, so step 1 lists the live candidates and step 2 changes
-- only the ids you paste in. No schema change; nothing in the app waits on this.
-- ---------------------------------------------------------------------------

-- Step 1 (read only): counter-style tasks under a challenge whose title says "<N> min".
-- Expected: rows like challenge "Read 30 min before bed" / task "Read" of task_type 'reading'
-- with target_pages or target_value set and no duration. Review before step 2.
SELECT
  t.id                                   AS task_id,
  c.id                                   AS challenge_id,
  c.title                                AS challenge,
  c.visibility,
  c.status,
  t.title                                AS task,
  t.task_type,
  t.config ->> 'target_pages'            AS target_pages,
  t.config ->> 'target_count'            AS target_count,
  t.config ->> 'target_value'            AS target_value,
  t.config ->> 'unit'                    AS unit,
  t.config ->> 'unit_label'              AS unit_label,
  t.config ->> 'duration_minutes'        AS duration_minutes,
  t.min_duration_minutes,
  (regexp_match(c.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1]::int AS minutes_in_challenge_title,
  (SELECT count(*) FROM public.active_challenges ac
     WHERE ac.challenge_id = c.id AND ac.status = 'active')          AS live_enrollments
FROM public.challenge_tasks t
JOIN public.challenges c ON c.id = t.challenge_id
WHERE t.task_type IN ('reading', 'counter')
  AND c.status = 'published'
  AND c.title ~* '\m[0-9]+\s*(min|mins|minute|minutes)\M'
  AND NOT (t.title ~* '\m[0-9]+\s*(min|mins|minute|minutes)\M')   -- build 90's block already lists these
  AND coalesce(t.config ->> 'unit', t.config ->> 'unit_label', '') !~* 'min'
ORDER BY c.title, t.order_index;

-- Step 2: make each confirmed task a timer of the minutes named in the challenge title.
-- Guarded three ways: an explicit id list (paste the task_id values from step 1), the same
-- type filter, and the challenge title must still name the minutes. Keeps every other config
-- key. Existing check_ins are untouched; the next day uses the timer.
-- Fill the id list first; with the placeholder left in, the statement updates nothing.
UPDATE public.challenge_tasks t
SET
  task_type = 'timer',
  config = (coalesce(t.config, '{}'::jsonb)
              - 'target_pages' - 'target_count' - 'target_value' - 'reading_session_minutes'
              - 'unit' - 'unit_label')
           || jsonb_build_object(
                'duration_minutes',
                (regexp_match(c.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1]::int
              ),
  min_duration_minutes = coalesce(
    t.min_duration_minutes,
    (regexp_match(c.title, '([0-9]+)\s*(min|mins|minute|minutes)\M', 'i'))[1]::int
  )
FROM public.challenges c
WHERE c.id = t.challenge_id
  AND t.task_type IN ('reading', 'counter')
  AND c.title ~* '\m[0-9]+\s*(min|mins|minute|minutes)\M'
  AND t.id IN (
    '00000000-0000-0000-0000-000000000000'::uuid   -- replace with the task_id values from step 1
  );

-- Step 3 (read only): confirm.
SELECT t.id, c.title AS challenge, t.title AS task, t.task_type,
       t.config ->> 'duration_minutes' AS duration_minutes, t.min_duration_minutes
FROM public.challenge_tasks t
JOIN public.challenges c ON c.id = t.challenge_id
WHERE t.id IN (
    '00000000-0000-0000-0000-000000000000'::uuid   -- the same list
  );

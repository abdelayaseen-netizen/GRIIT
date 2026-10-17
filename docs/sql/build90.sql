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

-- ============================================================
-- Chunk 08, "leaderboard board_opt_in is never set".
-- active_challenges.board_opt_in (chunk U, DEFAULT false) was never written by any code path,
-- so every challenge board said "A board needs two". From chunk 08 the server inserts new
-- enrollments with board_opt_in = true. This backfills the enrollments that already exist.
-- Review step 1 first; step 2 touches the flag only, on active enrollments only.
-- ============================================================

-- Step 1 (read only): how many active enrollments are off the board today.
SELECT count(*) AS active_off_board
FROM public.active_challenges
WHERE status = 'active' AND board_opt_in = false;

-- Step 2: put every active enrollment on its challenge board.
UPDATE public.active_challenges
SET board_opt_in = true
WHERE status = 'active' AND board_opt_in = false;

-- Step 3 (read only): confirm.
SELECT count(*) AS active_off_board_after
FROM public.active_challenges
WHERE status = 'active' AND board_opt_in = false;

-- ============================================================
-- Chunk 09, item 09.1 "secure the day if it was the last task" from the Strava webhook.
-- secure_day(uuid) reads auth.uid() and raises UNAUTHORIZED when it is null. A webhook request
-- carries no user JWT, so the backend (service role) calls this wrapper, which sets the JWT
-- claim for the duration of the transaction and then runs the same secure_day. No streak or
-- date logic is copied; the one function stays the source of truth.
-- Until this runs, the webhook completes the task, writes the post and the notification, and
-- logs "secure skipped: secure_day_for_user missing"; the app secures the day on its next open.
-- Review step 1 (read only), then run step 2.
-- ============================================================

-- Step 1 (read only): the wrapper does not exist yet.
SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('secure_day', 'secure_day_for_user');

-- Step 2: the wrapper. service_role only; authenticated users keep calling secure_day(uuid).
CREATE OR REPLACE FUNCTION public.secure_day_for_user(p_user_id uuid, p_active_challenge_id uuid)
RETURNS TABLE(streak int, secured boolean, challenge_done boolean, remaining_challenges int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;
  -- The enrollment must belong to the user; secure_day checks this too, after the claim is set.
  IF NOT EXISTS (SELECT 1 FROM active_challenges ac WHERE ac.id = p_active_challenge_id AND ac.user_id = p_user_id) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  -- auth.uid() reads request.jwt.claim.sub, then request.jwt.claims->>'sub'. Transaction-local (is_local = true).
  PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text, true);
  RETURN QUERY SELECT * FROM public.secure_day(p_active_challenge_id);
END;
$$;

REVOKE ALL ON FUNCTION public.secure_day_for_user(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.secure_day_for_user(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.secure_day_for_user(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.secure_day_for_user(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.secure_day_for_user(uuid, uuid) IS
  'Build 90 09.1. Service-role wrapper: sets the JWT sub claim for the transaction and runs secure_day(uuid). Strava webhook only.';

-- Step 3 (read only): confirm.
SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('secure_day', 'secure_day_for_user');

-- ============================================================
-- Chunk 01b follow-up: is_test enrollments stay off real leaderboards.
-- New joins by is_test profiles now insert board_opt_in = false. This backfill
-- matches existing test enrollments. dropTestAuthors already hides them from
-- real viewers even when the flag is true. Review step 1 first; never run
-- against prod from this chat.
-- ============================================================

-- Step 1 (read only): how many is_test enrollments are on a board.
SELECT count(*) AS test_on_board
FROM public.active_challenges ac
JOIN public.profiles p ON p.user_id = ac.user_id
WHERE p.is_test = true AND ac.board_opt_in = true;

-- Step 2: take is_test enrollments off every board.
UPDATE public.active_challenges ac
SET board_opt_in = false
FROM public.profiles p
WHERE ac.user_id = p.user_id
  AND p.is_test = true
  AND ac.board_opt_in = true;

-- Step 3 (read only): confirm.
SELECT count(*) AS test_on_board_after
FROM public.active_challenges ac
JOIN public.profiles p ON p.user_id = ac.user_id
WHERE p.is_test = true AND ac.board_opt_in = true;

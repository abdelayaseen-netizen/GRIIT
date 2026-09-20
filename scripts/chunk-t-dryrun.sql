-- Chunk T dry run. SELECT only. Do not apply 20260920220000_challenge_end.sql with this file.

-- 1. Status histogram. Migration ADD CONSTRAINT fails if any value is outside the four.
SELECT status, count(*)
FROM public.active_challenges
GROUP BY 1
ORDER BY 1;

-- 2. Every active row: current end_at, proposed end_at (E1 day-count / identity 24h), tz, zombie.
-- CTE text (tz + proposed) is character-identical between
-- supabase/migrations/20260920220000_challenge_end.sql and scripts/chunk-t-dryrun.sql.
WITH tz AS (
  SELECT
    ac.id,
    ac.user_id,
    ac.challenge_id,
    ac.start_at,
    ac.end_at AS current_end_at,
    COALESCE(c.duration_type, '') AS duration_type,
    COALESCE(c.duration_days, 1) AS duration_days,
    CASE
      WHEN COALESCE(c.duration_type, '') = '24h' THEN '24h'
      ELSE 'day-count'
    END AS kind,
    COALESCE(NULLIF(btrim(p.timezone), ''), NULLIF(btrim(p.reminder_timezone), ''), 'UTC') AS tz_used
  FROM public.active_challenges ac
  JOIN public.challenges c ON c.id = ac.challenge_id
  LEFT JOIN public.profiles p ON p.user_id = ac.user_id
  WHERE ac.status = 'active'
),
proposed AS (
  SELECT
    tz.*,
    CASE
      WHEN tz.kind = '24h' THEN tz.current_end_at
      ELSE (
        (
          (tz.start_at AT TIME ZONE tz.tz_used)::date
          + GREATEST(tz.duration_days, 1) - 1
        )::timestamp
        + time '23:59:59.999'
      ) AT TIME ZONE tz.tz_used
    END AS proposed_end_at
  FROM tz
)
SELECT
  id,
  user_id,
  challenge_id,
  kind,
  tz_used,
  current_end_at,
  proposed_end_at,
  (kind = '24h' AND proposed_end_at IS NOT DISTINCT FROM current_end_at) AS proposed_eq_current_24h,
  (now() > proposed_end_at) AS would_finish_as_zombie
FROM proposed
ORDER BY kind, id;

-- 3. Existing non-active: ended_at source; proposed = LEAST(end_at, now()).
SELECT
  id,
  status,
  end_at,
  CASE
    WHEN end_at IS NOT NULL THEN 'end_at'
    ELSE 'none'
  END AS ended_at_source,
  LEAST(end_at, now()) AS proposed_ended_at,
  LEAST(end_at, now()) AS proposed_end_seen_at
FROM public.active_challenges
WHERE status IS DISTINCT FROM 'active'
ORDER BY status, id;

-- 4. activity_events.metadata type + completed_challenge key occupancy.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'activity_events'
  AND column_name = 'metadata';

SELECT user_id, metadata->>'active_challenge_id', count(*)
FROM activity_events
WHERE event_type = 'completed_challenge'
GROUP BY 1, 2
ORDER BY 3 DESC;

-- 5. profiles identity / tz columns present.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('user_id', 'id', 'timezone', 'reminder_timezone')
ORDER BY column_name;

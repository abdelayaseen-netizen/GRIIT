-- Chunk T: enrollment end date (E1), end columns, zombie finish (E7),
-- completed_challenge duplicate guard (E3). Idempotent. Emits no events.
-- 24h enrollments keep clock-based end_at. Day-count: last local day 23:59:59.999.
-- start_team_challenge not replaced. team end_at not E1, deferred.

BEGIN;

ALTER TABLE public.active_challenges
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_seen_at TIMESTAMPTZ;

DO $$
DECLARE
  bad text;
BEGIN
  SELECT string_agg(s, ', ' ORDER BY s)
  INTO bad
  FROM (
    SELECT DISTINCT COALESCE(status, '<NULL>') AS s
    FROM public.active_challenges
    WHERE status IS NULL
       OR status NOT IN ('active', 'completed', 'abandoned', 'failed')
  ) t;

  IF bad IS NOT NULL THEN
    RAISE EXCEPTION
      'active_challenges.status CHECK refused; unexpected values: %',
      bad;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'active_challenges_status_check'
      AND conrelid = 'public.active_challenges'::regclass
  ) THEN
    ALTER TABLE public.active_challenges
      ADD CONSTRAINT active_challenges_status_check
      CHECK (status IN ('active', 'completed', 'abandoned', 'failed'));
  END IF;
END $$;

-- E3: one completed_challenge event per enrollment. Phase 2 writes metadata.active_challenge_id.
CREATE UNIQUE INDEX IF NOT EXISTS activity_events_unique_completed_challenge
  ON public.activity_events (user_id, (metadata->>'active_challenge_id'))
  WHERE event_type = 'completed_challenge'
    AND metadata->>'active_challenge_id' IS NOT NULL;

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
UPDATE public.active_challenges ac
SET end_at = pr.proposed_end_at
FROM proposed pr
WHERE pr.id = ac.id
  AND pr.kind = 'day-count'
  AND ac.end_at IS DISTINCT FROM pr.proposed_end_at;

-- E7: finish zombies. ended_at = normalized end_at. end_seen_at = ended_at. No events.
UPDATE public.active_challenges
SET
  status = 'completed',
  ended_at = end_at,
  end_seen_at = end_at
WHERE status = 'active'
  AND end_at < now();

-- Existing non-active: ended_at / end_seen_at = LEAST(COALESCE(ended_at, completed_at, end_at), now()).
UPDATE public.active_challenges
SET
  ended_at = LEAST(COALESCE(ended_at, completed_at, end_at), now()),
  end_seen_at = LEAST(COALESCE(ended_at, completed_at, end_at), now())
WHERE status IS DISTINCT FROM 'active'
  AND (ended_at IS NULL OR end_seen_at IS NULL);

NOTIFY pgrst, 'reload schema';

COMMIT;

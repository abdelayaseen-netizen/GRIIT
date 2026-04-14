-- Backfill day_secures, streaks, profiles, and active_challenges.current_day for historical
-- completed check-ins that matched secure_day eligibility (required tasks from config JSONB).
-- Idempotent: safe to re-run; INSERT uses ON CONFLICT DO NOTHING; recomputes from full day_secures.
-- DO NOT RUN automatically — review and execute manually in Supabase SQL editor when ready.

BEGIN;

-- Optional: align with daily-reset / client usage (safe if column already exists)
ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS last_secured_date TEXT;

-- 1) Insert missing day_secures: (user_id, date_key) where some active_challenge has all required tasks completed.
INSERT INTO public.day_secures (user_id, date_key)
SELECT DISTINCT s.user_id, s.date_key
FROM (
  SELECT ac.user_id, ci.date_key, ac.id AS ac_id, ac.challenge_id
  FROM public.check_ins ci
  INNER JOIN public.active_challenges ac ON ac.id = ci.active_challenge_id
  WHERE ci.status = 'completed'
) s
WHERE NOT EXISTS (
  SELECT 1
  FROM public.challenge_tasks ct
  WHERE ct.challenge_id = s.challenge_id
    AND COALESCE((ct.config->>'required')::boolean, true) = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.check_ins ci2
      WHERE ci2.active_challenge_id = s.ac_id
        AND ci2.date_key = s.date_key
        AND ci2.status = 'completed'
        AND ci2.task_id = ct.id
    )
)
AND NOT EXISTS (
  SELECT 1
  FROM public.day_secures ds
  WHERE ds.user_id = s.user_id
    AND ds.date_key = s.date_key
)
ON CONFLICT (user_id, date_key) DO NOTHING;

-- 2) Longest consecutive run per user from day_secures (date_key as YYYY-MM-DD)
WITH RECURSIVE ordered AS (
  SELECT
    ds.user_id,
    ds.date_key::date AS d,
    ds.date_key::date
      - ROW_NUMBER() OVER (PARTITION BY ds.user_id ORDER BY ds.date_key::date) AS grp
  FROM public.day_secures ds
),
runs AS (
  SELECT user_id, grp, COUNT(*)::int AS run_len
  FROM ordered
  GROUP BY user_id, grp
),
longest_by_user AS (
  SELECT user_id, MAX(run_len)::int AS longest_streak_count
  FROM runs
  GROUP BY user_id
),
-- Anchor for active streak: today or yesterday in profile timezone (same idea as product: streak continues if secured today or yesterday)
profiles_tz AS (
  SELECT
    p.user_id,
    COALESCE(NULLIF(trim(p.timezone), ''), 'UTC') AS tz
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM public.day_secures ds WHERE ds.user_id = p.user_id)
),
anchors AS (
  SELECT
    z.user_id,
    (now() AT TIME ZONE z.tz)::date AS today_d,
    ((now() AT TIME ZONE z.tz)::date - interval '1 day')::date AS yesterday_d
  FROM profiles_tz z
),
anchor_pick AS (
  SELECT
    a.user_id,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.day_secures ds
        WHERE ds.user_id = a.user_id
          AND ds.date_key = a.today_d::text
      ) THEN a.today_d
      WHEN EXISTS (
        SELECT 1 FROM public.day_secures ds
        WHERE ds.user_id = a.user_id
          AND ds.date_key = a.yesterday_d::text
      ) THEN a.yesterday_d
      ELSE NULL::date
    END AS anchor_d
  FROM anchors a
),
rec AS (
  SELECT user_id, anchor_d::date AS d, 1 AS len
  FROM anchor_pick
  WHERE anchor_d IS NOT NULL
  UNION ALL
  SELECT
    r.user_id,
    (r.d - interval '1 day')::date,
    r.len + 1
  FROM rec r
  WHERE r.len < 1000
    AND EXISTS (
      SELECT 1
      FROM public.day_secures ds
      WHERE ds.user_id = r.user_id
        AND ds.date_key = ((r.d - interval '1 day')::date)::text
    )
),
active_by_user AS (
  SELECT user_id, MAX(len)::int AS active_streak_count
  FROM rec
  GROUP BY user_id
),
max_date AS (
  SELECT user_id, MAX(date_key)::text AS last_completed_date_key
  FROM public.day_secures
  GROUP BY user_id
),
streak_payload AS (
  SELECT
    m.user_id,
    COALESCE(abu.active_streak_count, 0) AS active_streak_count,
    COALESCE(l.longest_streak_count, 0) AS longest_streak_count,
    m.last_completed_date_key
  FROM max_date m
  LEFT JOIN longest_by_user l ON l.user_id = m.user_id
  LEFT JOIN active_by_user abu ON abu.user_id = m.user_id
)
INSERT INTO public.streaks (
  user_id,
  active_streak_count,
  longest_streak_count,
  last_completed_date_key,
  last_secured_date
)
SELECT
  sp.user_id,
  sp.active_streak_count,
  sp.longest_streak_count,
  sp.last_completed_date_key,
  sp.last_completed_date_key
FROM streak_payload sp
ON CONFLICT (user_id) DO UPDATE SET
  active_streak_count = EXCLUDED.active_streak_count,
  longest_streak_count = GREATEST(COALESCE(public.streaks.longest_streak_count, 0), EXCLUDED.longest_streak_count),
  last_completed_date_key = EXCLUDED.last_completed_date_key,
  last_secured_date = EXCLUDED.last_secured_date;

-- 3) Profiles: total_days_secured, tier, updated_at
UPDATE public.profiles p
SET
  total_days_secured = s.cnt,
  tier = CASE
    WHEN s.cnt >= 90 THEN 'Elite'
    WHEN s.cnt >= 30 THEN 'Relentless'
    WHEN s.cnt >= 7 THEN 'Builder'
    ELSE 'Starter'
  END,
  updated_at = now()
FROM (
  SELECT user_id, COUNT(*)::int AS cnt
  FROM public.day_secures
  GROUP BY user_id
) s
WHERE p.user_id = s.user_id;

-- 4) active_challenges.current_day = secured days in challenge window (user tz; 24h uses challenge end cap)
UPDATE public.active_challenges ac
SET current_day = COALESCE(sub.cnt, 0)
FROM (
  SELECT
    ac.id,
    COUNT(ds.id)::int AS cnt
  FROM public.active_challenges ac
  INNER JOIN public.profiles p ON p.user_id = ac.user_id
  INNER JOIN public.challenges c ON c.id = ac.challenge_id
  LEFT JOIN public.day_secures ds
    ON ds.user_id = ac.user_id
    AND ds.date_key::date >= GREATEST(
      (ac.start_at AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date,
      (COALESCE(c.live_date, ac.start_at) AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date
    )
    AND ds.date_key::date <= LEAST(
      (now() AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date,
      CASE
        WHEN c.duration_type = '24h' THEN
          LEAST(
            (now() AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date,
            (COALESCE(c.ends_at, c.live_date + interval '24 hours', ac.end_at) AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date
          )
        ELSE (now() AT TIME ZONE COALESCE(NULLIF(trim(p.timezone), ''), 'UTC'))::date
      END
    )
  GROUP BY ac.id
) sub
WHERE ac.id = sub.id;

COMMIT;

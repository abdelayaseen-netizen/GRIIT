-- Shared "enrollment done today" predicate. secure_day remaining-count and
-- today_state.secured_today must use this function — do not copy the subquery.

CREATE OR REPLACE FUNCTION public.enrollment_done_today(p_active_challenge_id uuid, p_date_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.active_challenges ac
    JOIN public.challenge_tasks ct ON ct.challenge_id = ac.challenge_id
    WHERE ac.id = p_active_challenge_id
      AND COALESCE((ct.config->>'required')::boolean, true) = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.check_ins ci
        WHERE ci.active_challenge_id = ac.id
          AND ci.task_id = ct.id
          AND ci.date_key = p_date_key
          AND ci.status = 'completed'
      )
  );
$$;

COMMENT ON FUNCTION public.enrollment_done_today(uuid, text) IS
  'True when every required task on this enrollment has a completed check_in for date_key.';

CREATE OR REPLACE FUNCTION public.secure_day(p_active_challenge_id uuid)
RETURNS TABLE(streak int, secured boolean, challenge_done boolean, remaining_challenges int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_date_key text;
  v_tz text;
  v_ac_id uuid;
  v_ac_current_day int;
  v_challenge_id uuid;
  v_last_secured text;
  v_required_ids uuid[];
  v_completed_ids uuid[];
  v_remaining int;
  v_secured boolean;
  v_had_secure boolean;
  v_streak_last_key text;
  v_streak_active int;
  v_streak_longest int;
  v_streak_stands int;
  v_streak_stands_used int;
  v_yesterday_key text;
  v_new_streak int;
  v_longest_streak int;
  v_secures_last7 int;
  v_earn_stand boolean;
  v_total_days int;
  v_tier text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  v_tz := COALESCE(
    (SELECT NULLIF(trim(timezone), '') FROM profiles WHERE user_id = v_uid),
    'UTC'
  );
  v_date_key := (now() AT TIME ZONE v_tz)::date::text;

  SELECT ac.id, ac.current_day, ac.challenge_id, ac.last_secured_date_key
    INTO v_ac_id, v_ac_current_day, v_challenge_id, v_last_secured
  FROM active_challenges ac
  WHERE ac.id = p_active_challenge_id AND ac.user_id = v_uid;
  IF v_ac_id IS NULL THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT ARRAY_AGG(ct.id) INTO v_required_ids
  FROM challenge_tasks ct
  WHERE ct.challenge_id = v_challenge_id
    AND COALESCE((ct.config->>'required')::boolean, true) = true;

  SELECT ARRAY_AGG(ci.task_id) INTO v_completed_ids
  FROM check_ins ci
  WHERE ci.active_challenge_id = p_active_challenge_id AND ci.date_key = v_date_key AND ci.status = 'completed';

  IF v_required_ids IS NOT NULL AND (
    SELECT COUNT(*) FROM unnest(v_required_ids) id
    WHERE id = ANY(COALESCE(v_completed_ids, ARRAY[]::uuid[]))
  ) < array_length(v_required_ids, 1) THEN
    RAISE EXCEPTION 'NOT_ALL_REQUIRED' USING errcode = 'P0001';
  END IF;

  IF v_last_secured IS DISTINCT FROM v_date_key THEN
    UPDATE active_challenges
    SET current_day = COALESCE(current_day, 0) + 1,
        progress_percent = 100,
        last_secured_date_key = v_date_key
    WHERE id = p_active_challenge_id;
  END IF;

  SELECT COUNT(*)::int INTO v_remaining
  FROM active_challenges ac
  WHERE ac.user_id = v_uid
    AND ac.status = 'active'
    AND ac.start_at <= now()
    AND ac.end_at >= now()
    AND NOT public.enrollment_done_today(ac.id, v_date_key);

  v_remaining := COALESCE(v_remaining, 0);
  v_secured := (v_remaining = 0);

  SELECT EXISTS (
    SELECT 1 FROM day_secures WHERE user_id = v_uid AND date_key = v_date_key
  ) INTO v_had_secure;

  SELECT last_completed_date_key, COALESCE(active_streak_count, 0), COALESCE(longest_streak_count, 0),
         COALESCE(last_stands_available, 0), COALESCE(last_stands_used_total, 0)
  INTO v_streak_last_key, v_streak_active, v_streak_longest, v_streak_stands, v_streak_stands_used
  FROM streaks WHERE user_id = v_uid;

  v_new_streak := COALESCE(v_streak_active, 0);

  IF v_secured AND NOT COALESCE(v_had_secure, false) THEN
    v_yesterday_key := ((v_date_key::date) - interval '1 day')::date::text;
    IF v_streak_last_key = v_yesterday_key THEN
      v_new_streak := COALESCE(v_streak_active, 0) + 1;
    ELSE
      v_new_streak := 1;
    END IF;
    v_longest_streak := GREATEST(v_new_streak, COALESCE(v_streak_longest, 0));

    SELECT COUNT(DISTINCT date_key) + 1 INTO v_secures_last7
    FROM day_secures
    WHERE user_id = v_uid AND date_key >= ((v_date_key::date) - interval '6 days')::date::text AND date_key <= v_date_key;
    v_secures_last7 := LEAST(v_secures_last7, 7);

    v_earn_stand := false;
    IF v_secures_last7 >= 6 AND COALESCE(v_streak_stands, 0) < 2 THEN
      v_earn_stand := true;
      v_streak_stands := LEAST(2, COALESCE(v_streak_stands, 0) + 1);
    END IF;

    INSERT INTO day_secures (user_id, date_key) VALUES (v_uid, v_date_key)
    ON CONFLICT (user_id, date_key) DO NOTHING;

    INSERT INTO streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key)
    VALUES (v_uid, v_new_streak, v_longest_streak, v_date_key)
    ON CONFLICT (user_id) DO UPDATE SET
      active_streak_count = v_new_streak,
      longest_streak_count = GREATEST(streaks.longest_streak_count, v_longest_streak),
      last_completed_date_key = v_date_key,
      last_stands_available = CASE WHEN v_earn_stand THEN LEAST(2, COALESCE(streaks.last_stands_available, 0) + 1) ELSE COALESCE(streaks.last_stands_available, 0) END,
      last_stands_used_total = CASE WHEN v_earn_stand THEN COALESCE(streaks.last_stands_used_total, 0) + 1 ELSE COALESCE(streaks.last_stands_used_total, 0) END;

    SELECT total_days_secured INTO v_total_days FROM profiles WHERE user_id = v_uid;
    v_total_days := COALESCE(v_total_days, 0) + 1;
    v_tier := CASE
      WHEN v_total_days >= 90 THEN 'Elite'
      WHEN v_total_days >= 30 THEN 'Relentless'
      WHEN v_total_days >= 7 THEN 'Builder'
      ELSE 'Starter'
    END;

    UPDATE profiles SET total_days_secured = v_total_days, tier = v_tier, updated_at = now() WHERE user_id = v_uid;
  END IF;

  RETURN QUERY SELECT v_new_streak::int, v_secured, true, v_remaining::int;
END;
$$;

CREATE OR REPLACE FUNCTION public.today_state(p_uid uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tz text;
  v_date_key text;
  v_streak int;
  v_secured boolean;
  v_keys jsonb;
  v_enrollments jsonb;
  v_remaining int;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_uid THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  v_tz := COALESCE(
    (SELECT NULLIF(trim(timezone), '') FROM profiles WHERE user_id = p_uid),
    'UTC'
  );
  v_date_key := (now() AT TIME ZONE v_tz)::date::text;

  SELECT COALESCE(s.active_streak_count, 0) INTO v_streak
  FROM streaks s WHERE s.user_id = p_uid;
  v_streak := COALESCE(v_streak, 0);

  SELECT EXISTS (
    SELECT 1 FROM day_secures WHERE user_id = p_uid AND date_key = v_date_key
  ) INTO v_secured;

  SELECT COALESCE(jsonb_agg(ds.date_key ORDER BY ds.date_key), '[]'::jsonb)
  INTO v_keys
  FROM day_secures ds
  WHERE ds.user_id = p_uid
    AND ds.date_key >= ((v_date_key::date) - interval '6 days')::date::text
    AND ds.date_key <= v_date_key;

  SELECT COALESCE(jsonb_agg(enr.obj ORDER BY enr.start_at), '[]'::jsonb)
  INTO v_enrollments
  FROM (
    SELECT
      ac.start_at,
      jsonb_build_object(
        'active_challenge_id', ac.id,
        'challenge_id', ac.challenge_id,
        'title', COALESCE(c.title, 'Challenge'),
        'current_day', COALESCE(ac.current_day, 1),
        'secured_today', public.enrollment_done_today(ac.id, v_date_key),
        'tasks', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', ct.id,
              'title', COALESCE(ct.title, 'Task'),
              'done', EXISTS (
                SELECT 1 FROM check_ins ci
                WHERE ci.active_challenge_id = ac.id
                  AND ci.task_id = ct.id
                  AND ci.date_key = v_date_key
                  AND ci.status = 'completed'
              ),
              'require_photo', COALESCE(ct.require_photo, false),
              'require_location', COALESCE(ct.require_location, false),
              'config', COALESCE(ct.config, '{}'::jsonb)
            )
            ORDER BY ct.order_index NULLS LAST
          )
          FROM challenge_tasks ct
          WHERE ct.challenge_id = ac.challenge_id
            AND COALESCE((ct.config->>'required')::boolean, true) = true
        ), '[]'::jsonb)
      ) AS obj
    FROM active_challenges ac
    JOIN challenges c ON c.id = ac.challenge_id
    WHERE ac.user_id = p_uid
      AND ac.status = 'active'
      AND ac.start_at <= now()
      AND ac.end_at >= now()
  ) enr;

  SELECT COUNT(*)::int INTO v_remaining
  FROM jsonb_array_elements(COALESCE(v_enrollments, '[]'::jsonb)) e
  WHERE (e->>'secured_today')::boolean IS DISTINCT FROM true;
  v_remaining := COALESCE(v_remaining, 0);

  RETURN jsonb_build_object(
    'date_key', v_date_key,
    'secured', v_secured,
    'streak', v_streak,
    'secured_date_keys', COALESCE(v_keys, '[]'::jsonb),
    'enrollments', COALESCE(v_enrollments, '[]'::jsonb),
    'remaining_challenges', v_remaining
  );
END;
$$;

COMMENT ON FUNCTION public.today_state(uuid) IS
  'One payload for Home / active / Secured / ChallengeDone. enrollment_done_today is the sole required-task predicate.';

GRANT EXECUTE ON FUNCTION public.enrollment_done_today(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enrollment_done_today(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.secure_day(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.secure_day(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.today_state(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.today_state(uuid) TO service_role;

NOTIFY pgrst, 'reload schema';

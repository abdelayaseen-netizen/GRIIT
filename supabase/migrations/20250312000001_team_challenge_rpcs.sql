-- Team challenge RPCs: start_team_challenge, evaluate_team_day.
-- join_challenge is unchanged (solo only); team join is done in tRPC (insert challenge_members).

-- =============================================
-- start_team_challenge(p_challenge_id uuid): start a waiting team/shared_goal run.
-- =============================================
CREATE OR REPLACE FUNCTION public.start_team_challenge(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_challenge challenges%ROWTYPE;
  v_member record;
  v_ac_id uuid;
  v_date_key text;
  v_start_at timestamptz;
  v_end_at timestamptz;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING errcode = 'P0002';
  END IF;

  IF v_challenge.participation_type NOT IN ('team', 'shared_goal') THEN
    RAISE EXCEPTION 'NOT_TEAM_CHALLENGE' USING errcode = 'P0001';
  END IF;

  IF v_challenge.run_status IS NULL OR v_challenge.run_status != 'waiting' THEN
    RAISE EXCEPTION 'RUN_NOT_WAITING' USING errcode = 'P0001';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM challenge_members WHERE challenge_id = p_challenge_id AND user_id = v_uid AND role = 'creator') THEN
    IF (SELECT COUNT(*) FROM challenge_members WHERE challenge_id = p_challenge_id) < v_challenge.team_size THEN
      RAISE EXCEPTION 'ONLY_CREATOR_OR_FULL' USING errcode = 'P0001';
    END IF;
  END IF;

  v_start_at := now();
  IF v_challenge.duration_type = '24h' THEN
    v_end_at := v_start_at + interval '24 hours';
  ELSE
    v_end_at := v_start_at + (COALESCE(v_challenge.duration_days, 1) || ' days')::interval;
  END IF;
  v_date_key := (now() AT TIME ZONE 'utc')::date::text;

  UPDATE challenges
  SET started_at = v_start_at, run_status = 'active'
  WHERE id = p_challenge_id;

  IF v_challenge.participation_type = 'team' THEN
    FOR v_member IN SELECT user_id FROM challenge_members WHERE challenge_id = p_challenge_id AND status = 'active'
    LOOP
      INSERT INTO active_challenges (user_id, challenge_id, status, start_at, end_at, current_day, progress_percent)
      VALUES (v_member.user_id, p_challenge_id, 'active', v_start_at, v_end_at, 1, 0)
      RETURNING id INTO v_ac_id;

      INSERT INTO check_ins (user_id, active_challenge_id, task_id, date_key, status)
      SELECT v_member.user_id, v_ac_id, ct.id, v_date_key, 'pending'
      FROM challenge_tasks ct
      WHERE ct.challenge_id = p_challenge_id;
    END LOOP;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.start_team_challenge(uuid) IS 'Start a waiting team or shared_goal run. Creator or when full. For team daily discipline, creates active_challenges + check_ins for all members.';

-- =============================================
-- evaluate_team_day(p_challenge_id uuid, p_date_key text): if date passed and not all secured, set run_status = failed.
-- =============================================
CREATE OR REPLACE FUNCTION public.evaluate_team_day(p_challenge_id uuid, p_date_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_start_at timestamptz;
  v_required_ids uuid[];
  v_ac record;
  v_completed_ids uuid[];
  v_all_secured boolean;
BEGIN
  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
  IF NOT FOUND OR v_challenge.participation_type != 'team' OR v_challenge.run_status != 'active' THEN
    RETURN;
  END IF;

  v_start_at := v_challenge.started_at;
  IF v_start_at IS NULL THEN
    RETURN;
  END IF;

  SELECT ARRAY_AGG(ct.id) INTO v_required_ids
  FROM challenge_tasks ct
  WHERE ct.challenge_id = p_challenge_id
    AND COALESCE((ct.config->>'required')::boolean, true) = true;

  IF v_required_ids IS NULL OR array_length(v_required_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  v_all_secured := true;
  FOR v_ac IN
    SELECT ac.id
    FROM active_challenges ac
    WHERE ac.challenge_id = p_challenge_id AND ac.start_at = v_start_at AND ac.status = 'active'
  LOOP
    SELECT ARRAY_AGG(ci.task_id) INTO v_completed_ids
    FROM check_ins ci
    WHERE ci.active_challenge_id = v_ac.id AND ci.date_key = p_date_key AND ci.status = 'completed';

    IF (SELECT COUNT(*) FROM unnest(v_required_ids) id WHERE id = ANY(COALESCE(v_completed_ids, ARRAY[]::uuid[]))) < array_length(v_required_ids, 1) THEN
      v_all_secured := false;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_all_secured THEN
    UPDATE challenges SET run_status = 'failed' WHERE id = p_challenge_id;
    UPDATE active_challenges SET status = 'failed' WHERE challenge_id = p_challenge_id AND start_at = v_start_at;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.evaluate_team_day(uuid, text) IS 'For team daily discipline: if not all members secured the given date_key, mark run and all member active_challenges as failed. Call lazily (e.g. on getById or after secureDay).';

NOTIFY pgrst, 'reload schema';

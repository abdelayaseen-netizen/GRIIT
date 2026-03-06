-- Atomic join_challenge RPC: one transaction for active_challenge + check_ins + streak.
-- Backend calls with user's JWT so auth.uid() is set. Returns the new active_challenge row.

CREATE OR REPLACE FUNCTION public.join_challenge(p_challenge_id uuid)
RETURNS SETOF active_challenges
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_challenge challenges%ROWTYPE;
  v_ac_id uuid;
  v_start_at timestamptz;
  v_end_at timestamptz;
  v_date_key text;
  v_task record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF EXISTS (
    SELECT 1 FROM active_challenges
    WHERE user_id = v_uid AND challenge_id = p_challenge_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'ALREADY_JOINED' USING errcode = 'P0001';
  END IF;

  SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND' USING errcode = 'P0002';
  END IF;

  v_start_at := now();
  IF v_challenge.duration_type = '24h' THEN
    v_end_at := v_start_at + interval '24 hours';
  ELSE
    v_end_at := v_start_at + (v_challenge.duration_days || ' days')::interval;
  END IF;
  v_date_key := (now() AT TIME ZONE 'utc')::date::text;

  INSERT INTO active_challenges (
    user_id, challenge_id, status, start_at, end_at, current_day, progress_percent
  ) VALUES (
    v_uid, p_challenge_id, 'active', v_start_at, v_end_at, 1, 0
  )
  RETURNING id INTO v_ac_id;

  INSERT INTO check_ins (user_id, active_challenge_id, task_id, date_key, status)
  SELECT v_uid, v_ac_id, ct.id, v_date_key, 'pending'
  FROM challenge_tasks ct
  WHERE ct.challenge_id = p_challenge_id;

  INSERT INTO streaks (user_id, active_streak_count, longest_streak_count)
  VALUES (v_uid, 0, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    active_streak_count = COALESCE(streaks.active_streak_count, 0),
    longest_streak_count = COALESCE(streaks.longest_streak_count, 0);

  RETURN QUERY SELECT * FROM active_challenges WHERE id = v_ac_id;
END;
$$;

COMMENT ON FUNCTION public.join_challenge(uuid) IS 'Atomically join a challenge: insert active_challenge, check_ins, upsert streak. Call with user JWT.';

NOTIFY pgrst, 'reload schema';

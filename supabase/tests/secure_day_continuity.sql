-- Hand run, after 20261003040000_profiles_server_columns_secure_day.sql is applied.
-- SQL editor, as postgres. The block rolls back. A failed check raises.
-- auth.uid() / auth.role() must read request.jwt.claim.sub and request.jwt.claim.role
-- (Supabase default). date_key values are text YYYY-MM-DD, matching secure_day.
--
-- Verify date_key types in prod before relying on the text comparison:
--   SELECT table_name, column_name, data_type, udt_name
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name IN ('freeze_uses', 'last_stand_uses')
--     AND column_name = 'date_key';

BEGIN;

DO $test$
DECLARE
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_challenge uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  v_task uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  v_freeze uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  v_bridge uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
  v_gap uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3';
  v_free uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4';
  v_premium uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5';
  v_trigger uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6';
  v_ac uuid;
  v_streak int;
  v_again int;
  v_stands int;
  v_status text;
  v_bio text;
  v_key text;
  i int;
BEGIN
  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    u.id,
    'authenticated',
    'authenticated',
    u.email,
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    ''
  FROM (
    VALUES
      (v_freeze, 'streak-freeze@example.com'),
      (v_bridge, 'streak-bridge@example.com'),
      (v_gap, 'streak-gap@example.com'),
      (v_free, 'streak-free@example.com'),
      (v_premium, 'streak-premium@example.com'),
      (v_trigger, 'streak-trigger@example.com')
  ) AS u(id, email);

  INSERT INTO public.profiles (id, user_id, username, timezone, subscription_status, total_days_secured, bio)
  VALUES
    (v_freeze, v_freeze, 'streak_freeze', 'UTC', 'free', 0, 'freeze'),
    (v_bridge, v_bridge, 'streak_bridge', 'UTC', 'free', 0, 'bridge'),
    (v_gap, v_gap, 'streak_gap', 'UTC', 'free', 0, 'gap'),
    (v_free, v_free, 'streak_free', 'UTC', 'free', 0, 'free'),
    (v_premium, v_premium, 'streak_premium', 'UTC', 'premium', 0, 'premium'),
    (v_trigger, v_trigger, 'streak_trigger', 'UTC', 'free', 0, 'before')
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    username = EXCLUDED.username,
    timezone = EXCLUDED.timezone,
    subscription_status = EXCLUDED.subscription_status,
    total_days_secured = EXCLUDED.total_days_secured,
    bio = EXCLUDED.bio;

  INSERT INTO public.challenges (id, title, duration_days)
  VALUES (v_challenge, 'Streak continuity scratch', 30)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.challenge_tasks (id, challenge_id, title, task_type, config)
  VALUES (v_task, v_challenge, 'Show up', 'manual', '{"required": true}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- freeze yesterday, secure today → restored + 1. Second call does not increment.
  v_ac := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  INSERT INTO public.active_challenges (id, user_id, challenge_id, status, start_at, end_at, current_day, last_secured_date_key)
  VALUES (v_ac, v_freeze, v_challenge, 'active', now() - interval '10 days', now() + interval '20 days', 1, (v_today - 2)::text);
  INSERT INTO public.check_ins (user_id, active_challenge_id, task_id, date_key, status)
  VALUES (v_freeze, v_ac, v_task, v_today::text, 'completed');
  INSERT INTO public.streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total)
  VALUES (v_freeze, 5, 5, (v_today - 2)::text, 0, 0);
  INSERT INTO public.freeze_uses (user_id, date_key) VALUES (v_freeze, (v_today - 1)::text);
  PERFORM set_config('request.jwt.claim.sub', v_freeze::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_freeze, 'role', 'authenticated')::text, true);
  SELECT s.streak INTO v_streak FROM public.secure_day(v_ac) AS s;
  IF v_streak IS DISTINCT FROM 6 THEN
    RAISE EXCEPTION 'freeze yesterday: expected streak 6, got %', v_streak;
  END IF;
  SELECT s.streak INTO v_again FROM public.secure_day(v_ac) AS s;
  IF v_again IS DISTINCT FROM 6 THEN
    RAISE EXCEPTION 'second secure same day: expected streak 6, got %', v_again;
  END IF;

  -- Last Stand on day-2, freeze on yesterday, secure today → continues.
  v_ac := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2';
  INSERT INTO public.active_challenges (id, user_id, challenge_id, status, start_at, end_at, current_day)
  VALUES (v_ac, v_bridge, v_challenge, 'active', now() - interval '10 days', now() + interval '20 days', 1);
  INSERT INTO public.check_ins (user_id, active_challenge_id, task_id, date_key, status)
  VALUES (v_bridge, v_ac, v_task, v_today::text, 'completed');
  INSERT INTO public.streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total)
  VALUES (v_bridge, 4, 4, (v_today - 3)::text, 0, 0);
  INSERT INTO public.last_stand_uses (user_id, date_key) VALUES (v_bridge, (v_today - 2)::text);
  INSERT INTO public.freeze_uses (user_id, date_key) VALUES (v_bridge, (v_today - 1)::text);
  PERFORM set_config('request.jwt.claim.sub', v_bridge::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_bridge, 'role', 'authenticated')::text, true);
  SELECT s.streak INTO v_streak FROM public.secure_day(v_ac) AS s;
  IF v_streak IS DISTINCT FROM 5 THEN
    RAISE EXCEPTION 'last stand + freeze: expected streak 5, got %', v_streak;
  END IF;

  -- One uncovered day in the gap → 1.
  v_ac := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';
  INSERT INTO public.active_challenges (id, user_id, challenge_id, status, start_at, end_at, current_day)
  VALUES (v_ac, v_gap, v_challenge, 'active', now() - interval '10 days', now() + interval '20 days', 1);
  INSERT INTO public.check_ins (user_id, active_challenge_id, task_id, date_key, status)
  VALUES (v_gap, v_ac, v_task, v_today::text, 'completed');
  INSERT INTO public.streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total)
  VALUES (v_gap, 9, 9, (v_today - 3)::text, 0, 0);
  INSERT INTO public.freeze_uses (user_id, date_key) VALUES (v_gap, (v_today - 1)::text);
  PERFORM set_config('request.jwt.claim.sub', v_gap::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_gap, 'role', 'authenticated')::text, true);
  SELECT s.streak INTO v_streak FROM public.secure_day(v_ac) AS s;
  IF v_streak IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'uncovered gap: expected streak 1, got %', v_streak;
  END IF;

  -- 5 secured days in the window, plus today, is 6 of 7.
  FOR i IN 1..5 LOOP
    v_key := (v_today - i)::text;
    INSERT INTO public.day_secures (user_id, date_key) VALUES (v_free, v_key);
    INSERT INTO public.day_secures (user_id, date_key) VALUES (v_premium, v_key);
  END LOOP;

  v_ac := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4';
  INSERT INTO public.active_challenges (id, user_id, challenge_id, status, start_at, end_at, current_day)
  VALUES (v_ac, v_free, v_challenge, 'active', now() - interval '10 days', now() + interval '20 days', 1);
  INSERT INTO public.check_ins (user_id, active_challenge_id, task_id, date_key, status)
  VALUES (v_free, v_ac, v_task, v_today::text, 'completed');
  INSERT INTO public.streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total)
  VALUES (v_free, 5, 5, (v_today - 1)::text, 0, 0);
  PERFORM set_config('request.jwt.claim.sub', v_free::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_free, 'role', 'authenticated')::text, true);
  PERFORM public.secure_day(v_ac);
  SELECT last_stands_available INTO v_stands FROM public.streaks WHERE user_id = v_free;
  IF v_stands IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'free user at 6 of 7: expected no award, stands %, got %', 0, v_stands;
  END IF;

  v_ac := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc5';
  INSERT INTO public.active_challenges (id, user_id, challenge_id, status, start_at, end_at, current_day)
  VALUES (v_ac, v_premium, v_challenge, 'active', now() - interval '10 days', now() + interval '20 days', 1);
  INSERT INTO public.check_ins (user_id, active_challenge_id, task_id, date_key, status)
  VALUES (v_premium, v_ac, v_task, v_today::text, 'completed');
  INSERT INTO public.streaks (user_id, active_streak_count, longest_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total)
  VALUES (v_premium, 5, 5, (v_today - 1)::text, 0, 0);
  PERFORM set_config('request.jwt.claim.sub', v_premium::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_premium, 'role', 'authenticated')::text, true);
  PERFORM public.secure_day(v_ac);
  SELECT last_stands_available INTO v_stands FROM public.streaks WHERE user_id = v_premium;
  IF v_stands IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'premium at 6 of 7: expected award, stands 1, got %', v_stands;
  END IF;

  -- User JWT cannot change subscription_status. Other columns save.
  PERFORM set_config('request.jwt.claim.sub', v_trigger::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_trigger, 'role', 'authenticated')::text, true);
  UPDATE public.profiles
  SET bio = 'after', subscription_status = 'premium'
  WHERE user_id = v_trigger;
  SELECT bio, subscription_status INTO v_bio, v_status FROM public.profiles WHERE user_id = v_trigger;
  IF v_bio IS DISTINCT FROM 'after' OR v_status IS DISTINCT FROM 'free' THEN
    RAISE EXCEPTION 'user update: expected bio after and status free, got % / %', v_bio, v_status;
  END IF;

  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_trigger, 'role', 'service_role')::text, true);
  UPDATE public.profiles SET subscription_status = 'premium' WHERE user_id = v_trigger;
  SELECT subscription_status INTO v_status FROM public.profiles WHERE user_id = v_trigger;
  IF v_status IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION 'service-role update: expected premium, got %', v_status;
  END IF;

  RAISE NOTICE 'secure_day continuity checks passed';
END
$test$;

ROLLBACK;

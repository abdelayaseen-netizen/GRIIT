-- streaks: production had RLS enabled and zero policies, so user-scoped
-- SELECTs returned 0 rows with no error. getStats collapsed that to
-- activeStreak 0. secure_day still writes (SECURITY DEFINER). day_secures
-- still reads (has a SELECT policy) — header right, streak number wrong.
--
-- SELECT may already be live (applied ad-hoc). DROP IF EXISTS then CREATE
-- so this file is safe to run again.
--
-- UPDATE is required for two user-JWT writes in getStats:
--   last-stand decrement (last_stands_available / last_stands_used_total)
--   miss-day reset (active_streak_count = 0)
-- secure_day does not need UPDATE (SECURITY DEFINER bypasses RLS).
--
-- RISK: a client UPDATE policy on streaks lets the row owner write
-- active_streak_count. Until the follow-up below, WITH CHECK only
-- allows: count unchanged or 0, last_stands_available unchanged or
-- down, last_completed_date_key and longest_streak_count unchanged.
-- A modified client can still zero its own streak or burn last stands;
-- it cannot inflate the count. INSERT is limited to own user_id and
-- active_streak_count = 0 (joinChallengeDirect / starters upsert).
--
-- FOLLOW-UP (intended end state): last-stand and miss-reset should be
-- decided in SQL like secure_day is (SECURITY DEFINER), so the client
-- never writes streak values at all. Not done here — the decision
-- currently lives in getStats (tz, freezes, last_stand_uses, premium).
-- A thin RPC that takes the new count from the client is no safer.

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
CREATE POLICY "Users can view own streaks" ON public.streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
CREATE POLICY "Users can insert own streaks" ON public.streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND COALESCE(active_streak_count, 0) = 0
  );

-- DEFINER read of the current row; RLS on streaks would recurse if the
-- policy selected the table directly. auth.uid() must match p_user_id.
CREATE OR REPLACE FUNCTION public.streaks_client_update_permitted(
  p_user_id uuid,
  p_new_active integer,
  p_new_longest integer,
  p_new_last_key text,
  p_new_stands_avail integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.streaks s
    WHERE s.user_id = p_user_id
      AND p_user_id = auth.uid()
      AND COALESCE(p_new_active, 0) IN (0, COALESCE(s.active_streak_count, 0))
      AND p_new_longest IS NOT DISTINCT FROM s.longest_streak_count
      AND p_new_last_key IS NOT DISTINCT FROM s.last_completed_date_key
      AND COALESCE(p_new_stands_avail, 0) <= COALESCE(s.last_stands_available, 0)
      AND COALESCE(p_new_stands_avail, 0) >= 0
  );
$$;

REVOKE ALL ON FUNCTION public.streaks_client_update_permitted(uuid, integer, integer, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.streaks_client_update_permitted(uuid, integer, integer, text, integer) TO authenticated;

DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
CREATE POLICY "Users can update own streaks" ON public.streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND public.streaks_client_update_permitted(
      user_id,
      active_streak_count,
      longest_streak_count,
      last_completed_date_key,
      last_stands_available
    )
  );

NOTIFY pgrst, 'reload schema';

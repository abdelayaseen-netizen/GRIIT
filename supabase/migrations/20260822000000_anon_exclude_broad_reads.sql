-- Anonymous JWTs use role=authenticated with is_anonymous=true.
-- Broad-read policies (USING true) would otherwise expose all profiles / activity
-- to anyone who opens the app without signing up.
--
-- Decision: own-row OR non-anonymous.
--   - Signed-in users (is_anonymous false / claim absent): unchanged full SELECT.
--   - Anonymous sessions: own rows only (auth.uid() = user_id).
-- Does NOT touch streaks, check_ins, challenges, or active_challenges.

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

DROP POLICY IF EXISTS "Anyone can read activity" ON public.activity_events;
CREATE POLICY "Anyone can read activity" ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

NOTIFY pgrst, 'reload schema';

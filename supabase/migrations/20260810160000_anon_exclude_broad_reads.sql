-- Phase 2B: anonymous JWTs use role=authenticated with is_anonymous=true.
-- Broad-read policies (qual=true) would otherwise expose all profiles / activity.
-- Non-anonymous authenticated keeps full read; anonymous sessions see own rows only.
-- Does NOT add policies on streaks. Does NOT alter check_ins (already own-scoped).

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

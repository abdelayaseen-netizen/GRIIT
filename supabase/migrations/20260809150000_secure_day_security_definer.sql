-- streaks has RLS enabled with zero policies, so SECURITY INVOKER secure_day
-- fails on the streaks upsert (42501) after day_secures insert and rolls back
-- the whole transaction — day_secures never persists.
--
-- Authorization is already inside the function: auth.uid() (UNAUTHORIZED if null)
-- and active_challenges ownership (FORBIDDEN). DEFINER is required so writes to
-- streaks (and other tables) succeed. SET search_path = public must remain locked
-- for SECURITY DEFINER.

ALTER FUNCTION public.secure_day(uuid)
  SECURITY DEFINER
  SET search_path = public;

COMMENT ON FUNCTION public.secure_day(uuid) IS 'Atomically secure the day (SECURITY DEFINER). Auth via auth.uid() + active_challenge ownership. date_key uses profiles.timezone. Streaks upsert on user_id.';

NOTIFY pgrst, 'reload schema';

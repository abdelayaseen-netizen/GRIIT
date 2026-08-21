-- streaks: production has RLS enabled and zero policies, so user-scoped
-- SELECTs return 0 rows with no error. getStats then collapses that to
-- activeStreak 0. secure_day still writes (SECURITY DEFINER). day_secures
-- still reads (has a SELECT policy) — header right, streak number wrong.
--
-- getStats also UPDATEs this table on the user-scoped client:
--   last-stand decrement (profiles-stats.ts last_stands_available)
--   miss-day reset (active_streak_count = 0)
-- joinChallengeDirect INSERT and starters upsert also use the user JWT.
-- Without INSERT/UPDATE those writes fail silently under the same gap.

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
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
CREATE POLICY "Users can update own streaks" ON public.streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

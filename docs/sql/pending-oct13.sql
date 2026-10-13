-- Pending for the morning of Oct 13. Do not run this from the app or from CI.
-- After it runs, turn on the flags named in each section (all default OFF until then).

-- App Review shows in the real feed because the demo profile was created with is_test left false.
-- Feeds, people search, suggestions, and leaderboards already drop is_test for a real viewer.
-- Discover counts subtract active enrollments whose profile is_test is true.
-- APPLIED the morning of Oct 13. Left here as the record. Do not run it again.
UPDATE public.profiles
SET is_test = true
WHERE display_name = 'App Review'
  AND is_test IS DISTINCT FROM true;

-- Discover category tags. Not applied. No flag. The app already reads challenges.category.
-- 5-Minute Morning Prayer is stored as mind in the discover seed. Drink Water Today is stored as Fitness.
-- Checked from repo seeds (not a live catalog query): featured builtins are fitness, health, discipline,
-- faith, mind, learning. Public seed titles and categories:
--   75 Day Hard fitness, 30 Day Mindful mind, Morning Warrior discipline, Read 30 Pages mind,
--   5K Training fitness, Daily Gratitude mind, Cold Shower Challenge discipline, No Phone Before 9 AM discipline,
--   Quick Steps fitness, Read Something mind, Journal Today mind, Breathe 1 Min mind, Consistent Bedtime discipline,
--   Show Up 7 fitness, 7K Steps health, Early Riser 7 discipline, Fajr Before Sunrise faith,
--   3 Good Things mind, 10 Pages a Day learning, Quran Daily faith, 30-Second Cold Finish discipline.
-- Prayer Group, Pray 5 times, Quran Daily, and Pray in Masjid were already in pending-oct12.sql.
UPDATE public.challenges
SET category = 'faith'
WHERE title = '5-Minute Morning Prayer'
  AND category IS DISTINCT FROM 'faith';

UPDATE public.challenges
SET category = 'health'
WHERE title = 'Drink Water Today'
  AND category IS DISTINCT FROM 'health';

-- Starter task. Not applied. STARTER_TASK_ENABLED stays false until this exists.
-- One row per person. The title is never shown to anyone else. A written title is at most 40 characters.
CREATE TABLE IF NOT EXISTS public.starter_tasks (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 40),
  source text NOT NULL CHECK (source IN ('picked', 'written')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done_now', 'later', 'expired')),
  freeze_granted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.starter_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS starter_tasks_own ON public.starter_tasks;
CREATE POLICY starter_tasks_own ON public.starter_tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

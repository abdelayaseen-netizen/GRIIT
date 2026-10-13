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

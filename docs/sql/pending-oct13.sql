-- Pending for the morning of Oct 13. Do not run this from the app or from CI.
-- After it runs, turn on the flags named in each section (all default OFF until then).

-- App Review shows in the real feed because the demo profile was created with is_test left false.
-- Feeds, people search, suggestions, and leaderboards already drop is_test for a real viewer.
-- Discover counts subtract active enrollments whose profile is_test is true.
UPDATE public.profiles
SET is_test = true
WHERE display_name = 'App Review'
  AND is_test IS DISTINCT FROM true;

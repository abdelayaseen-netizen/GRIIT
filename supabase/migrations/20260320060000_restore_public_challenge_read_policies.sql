-- Restore public read access so Discover/challenge detail can load before join.
-- Keep active-participation policies for private/joined visibility.

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read public challenges" ON public.challenges;
CREATE POLICY "Anyone can read public challenges" ON public.challenges
  FOR SELECT
  USING (
    lower(coalesce(visibility, 'public')) = 'public'
  );

DROP POLICY IF EXISTS "Anyone can read challenge_tasks for public challenges" ON public.challenge_tasks;
CREATE POLICY "Anyone can read challenge_tasks for public challenges" ON public.challenge_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.challenges c
      WHERE c.id = challenge_tasks.challenge_id
        AND lower(coalesce(c.visibility, 'public')) = 'public'
    )
  );

NOTIFY pgrst, 'reload schema';

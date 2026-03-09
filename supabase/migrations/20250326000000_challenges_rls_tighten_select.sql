-- Tighten challenges SELECT: only PUBLIC + published visible to anon/authenticated.
-- Keeps getFeatured and getById safe; other visibility/status not exposed.

DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges viewable by everyone" ON public.challenges
  FOR SELECT USING (
    visibility = 'PUBLIC' AND status = 'published'
  );

NOTIFY pgrst, 'reload schema';

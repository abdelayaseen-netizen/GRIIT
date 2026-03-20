-- Users must read challenge + challenge_tasks rows for challenges they joined, even when
-- visibility/status would block the generic "PUBLIC + published" policy (20250326000000).
-- Without this, listMyActive / getActive nested selects fail and Home shows "Couldn't load your challenges."

DROP POLICY IF EXISTS "Users can read challenges via active participation" ON public.challenges;
CREATE POLICY "Users can read challenges via active participation" ON public.challenges
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.active_challenges ac
      WHERE ac.challenge_id = challenges.id
        AND ac.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read challenge_tasks via active participation" ON public.challenge_tasks;
CREATE POLICY "Users can read challenge_tasks via active participation" ON public.challenge_tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.active_challenges ac
      WHERE ac.challenge_id = challenge_tasks.challenge_id
        AND ac.user_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';

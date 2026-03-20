-- Ensure authenticated users can read their own active challenge rows.
-- This unblocks challenges.listMyActive for Home/Profile screens under RLS.

ALTER TABLE public.active_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own active challenges" ON public.active_challenges;
CREATE POLICY "Users can read own active challenges" ON public.active_challenges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

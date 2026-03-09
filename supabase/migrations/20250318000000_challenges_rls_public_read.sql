-- Ensure challenges and challenge_tasks are readable by everyone (anon + authenticated).
-- Required for Discover (getFeatured) and challenge detail. Safe to re-run.

-- Enable RLS if not already (idempotent; no-op if already enabled)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;

-- Challenges: allow SELECT for all (so getFeatured and getById return rows)
DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update (create challenge flow)
DROP POLICY IF EXISTS "Challenges insertable by authenticated" ON public.challenges;
CREATE POLICY "Challenges insertable by authenticated" ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (true);

-- Challenge tasks: allow SELECT for all (needed with challenges)
DROP POLICY IF EXISTS "Challenge tasks viewable by everyone" ON public.challenge_tasks;
CREATE POLICY "Challenge tasks viewable by everyone" ON public.challenge_tasks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Challenge tasks insertable by authenticated" ON public.challenge_tasks;
CREATE POLICY "Challenge tasks insertable by authenticated" ON public.challenge_tasks
  FOR INSERT TO authenticated WITH CHECK (true);

-- active_challenges: ensure user can insert own row (for join_challenge RPC)
-- If missing, join would fail with RLS violation.
DROP POLICY IF EXISTS "Users can insert own active challenges" ON public.active_challenges;
CREATE POLICY "Users can insert own active challenges" ON public.active_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

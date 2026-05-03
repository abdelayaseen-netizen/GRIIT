-- Allow users to update their own active_challenges row.
-- Required for backend/trpc/routes/checkins.ts:
--   - completeCheckin updates progress_percent (line ~396)
--   - setMilestoneShared updates milestone_30_shared / milestone_75_shared (line ~568)
-- Both call sites are user-JWT-scoped (ctx.supabase) and gated by assertActiveChallengeOwnership.
-- Without this policy, those updates fail silently under RLS.

ALTER TABLE public.active_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own active challenges" ON public.active_challenges;
CREATE POLICY "Users can update own active challenges" ON public.active_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

-- Group invites. Model: challenge_members + participation_type team.
-- Does not create or alter teams / team_members / team_invites / challenge_type.

CREATE TABLE IF NOT EXISTS public.challenge_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE (challenge_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_invites_invitee
  ON public.challenge_invites (invited_user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_invites_challenge
  ON public.challenge_invites (challenge_id, status);

ALTER TABLE public.challenge_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_invites_select_own" ON public.challenge_invites;
CREATE POLICY "challenge_invites_select_own" ON public.challenge_invites
  FOR SELECT TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);

DROP POLICY IF EXISTS "challenge_invites_insert_member" ON public.challenge_invites;
CREATE POLICY "challenge_invites_insert_member" ON public.challenge_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1
      FROM public.challenge_members cm
      WHERE cm.challenge_id = challenge_invites.challenge_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "challenge_invites_update_status" ON public.challenge_invites;
CREATE POLICY "challenge_invites_update_status" ON public.challenge_invites
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = invited_user_id
    OR auth.uid() = invited_by
  )
  WITH CHECK (
    (
      auth.uid() = invited_user_id
      AND status IN ('accepted', 'declined')
    )
    OR (
      auth.uid() = invited_by
      AND status = 'cancelled'
    )
  );

NOTIFY pgrst, 'reload schema';

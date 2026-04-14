-- challenge_reports: user-submitted reports of inappropriate challenges.
-- One report per (user, challenge) — UNIQUE constraint prevents spam.
-- Moderator notified via push on insert (handled in app code).

CREATE TABLE IF NOT EXISTS public.challenge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  CONSTRAINT challenge_reports_status_check CHECK (status IN ('pending', 'reviewed_kept', 'reviewed_removed', 'dismissed')),
  CONSTRAINT challenge_reports_reason_check CHECK (length(reason) BETWEEN 1 AND 50),
  CONSTRAINT challenge_reports_details_check CHECK (details IS NULL OR length(details) <= 500),
  UNIQUE (challenge_id, reporter_user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_reports_challenge_id ON public.challenge_reports(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_reports_status ON public.challenge_reports(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_challenge_reports_created_at ON public.challenge_reports(created_at DESC);

ALTER TABLE public.challenge_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_insert_own_reports"
  ON public.challenge_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "users_can_view_own_reports"
  ON public.challenge_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user_id);

NOTIFY pgrst, 'reload schema';

-- Allow archived + rejected challenge statuses (for moderation / dedup).
-- Apply before 20260407000002_unpublish_inappropriate_challenges.sql if using migrations in order.

ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
ALTER TABLE public.challenges ADD CONSTRAINT challenges_status_check
  CHECK (status IN ('draft', 'published', 'archived', 'rejected'));

NOTIFY pgrst, 'reload schema';

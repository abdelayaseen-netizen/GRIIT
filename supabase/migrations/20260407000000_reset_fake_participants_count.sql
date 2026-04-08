-- Reset fake participants_count on challenges to match real active joins.
-- Run in Supabase SQL Editor when applying manually, or via your migration workflow.

UPDATE public.challenges c
SET participants_count = (
  SELECT COUNT(*)
  FROM public.active_challenges ac
  WHERE ac.challenge_id = c.id
    AND ac.status = 'active'
);

NOTIFY pgrst, 'reload schema';

-- Ensure challenges.creator_id references auth.users(id).
-- Fixes inserts that pass auth.uid() when the FK was mistakenly bound to profiles(id).
-- Backfill: rows that stored profiles.id as creator_id are updated to the matching auth user id.

UPDATE public.challenges c
SET creator_id = p.user_id
FROM public.profiles p
WHERE c.creator_id = p.id
  AND p.user_id IS NOT NULL
  AND c.creator_id IS DISTINCT FROM p.user_id;

ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_creator_id_fkey;

ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_creator_id_fkey
  FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';

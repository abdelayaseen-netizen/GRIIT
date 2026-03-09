-- Normalize challenges.visibility to uppercase (PUBLIC, FRIENDS, PRIVATE).
-- Run in Supabase SQL Editor. Safe to re-run.

-- Update existing rows to uppercase
UPDATE public.challenges
SET visibility = UPPER(visibility)
WHERE visibility IN ('public', 'private', 'friends');

-- Drop existing check constraint if it exists (name may vary)
DO $$
BEGIN
  ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_visibility_check;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Drop visibility constraint: %', SQLERRM;
END $$;

-- Add check constraint for uppercase only
ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_visibility_check
  CHECK (visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE'));

NOTIFY pgrst, 'reload schema';

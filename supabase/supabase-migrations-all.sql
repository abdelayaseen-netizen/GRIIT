-- ============================================================
-- GRIIT — Bundled SQL for Supabase SQL Editor (manual apply)
-- Run ONCE when you prefer a single paste over CLI migrations.
-- Idempotent where possible (IF NOT EXISTS, OR REPLACE, DROP IF EXISTS).
-- The same changes exist as files under supabase/migrations/ (20260407*).
-- ============================================================

-- 1. Reset fake participant counts to real values
UPDATE public.challenges c
SET participants_count = (
  SELECT COUNT(*)
  FROM public.active_challenges ac
  WHERE ac.challenge_id = c.id
    AND ac.status = 'active'
);

-- 2. Add 'rejected' and 'archived' to challenge status constraint
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
ALTER TABLE public.challenges ADD CONSTRAINT challenges_status_check
  CHECK (status IN ('draft', 'published', 'archived', 'rejected'));

-- 3. Unpublish inappropriate challenges
UPDATE public.challenges
SET status = 'rejected', visibility = 'PRIVATE'
WHERE (
  LOWER(title) LIKE '%hater%'
  OR LOWER(title) LIKE '%hate %'
  OR LOWER(title) LIKE '%bully%'
  OR LOWER(title) LIKE '%nude%'
  OR LOWER(title) LIKE '%naked%'
  OR LOWER(title) LIKE '%strip%'
  OR LOWER(title) LIKE '%nsfw%'
)
AND creator_id IS NOT NULL;

-- 4. Deduplicate: if same user created the same title multiple times, keep newest
WITH ranked AS (
  SELECT id, title, creator_id,
    ROW_NUMBER() OVER (PARTITION BY creator_id, LOWER(title) ORDER BY created_at DESC) AS rn
  FROM public.challenges
  WHERE creator_id IS NOT NULL
    AND status = 'published'
)
UPDATE public.challenges
SET status = 'archived'
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

-- 5. Add comeback push tracking column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_comeback_push_at TIMESTAMPTZ;

-- 6. Add increment_last_stands_used RPC for daily reset cron
CREATE OR REPLACE FUNCTION public.increment_last_stands_used(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.streaks
  SET last_stands_used_total = COALESCE(last_stands_used_total, 0) + 1
  WHERE user_id = p_user_id;
END;
$$;

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

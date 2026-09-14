ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_streak integer NULL
  CHECK (target_streak IS NULL OR (target_streak >= 3 AND target_streak <= 365));

COMMENT ON COLUMN public.profiles.target_streak IS
  'Onboarding day target. Home Day X of Y uses this when longer than enrollment duration.';

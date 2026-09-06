-- profiles.challenge_visibility + profiles.activity_visibility
-- default 'public'; same allowed values as profile_visibility.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS challenge_visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS activity_visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_challenge_visibility_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_challenge_visibility_check
  CHECK (challenge_visibility IN ('public', 'friends', 'private'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_activity_visibility_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_activity_visibility_check
  CHECK (activity_visibility IN ('public', 'friends', 'private'));

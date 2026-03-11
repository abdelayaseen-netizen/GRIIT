-- Add profile_visibility to profiles for Settings > Privacy (who can see profile).
-- Values: public, friends, private (lowercase for profile; challenges use uppercase elsewhere).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';
-- Optional: constrain to known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_profile_visibility_check' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_profile_visibility_check
      CHECK (profile_visibility IS NULL OR profile_visibility IN ('public', 'friends', 'private'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles_profile_visibility_check: %', SQLERRM;
END $$;

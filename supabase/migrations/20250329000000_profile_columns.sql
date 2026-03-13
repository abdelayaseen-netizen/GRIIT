-- Add missing columns to profiles (safe: IF NOT EXISTS).
-- Ensures app code that reads onboarding_answers, primary_goal, etc. does not crash.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_time_budget text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discipline_level text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ensure username unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles_username_unique: %', SQLERRM;
END $$;

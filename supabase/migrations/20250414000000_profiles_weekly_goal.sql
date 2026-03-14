-- Weekly goal: 3, 5, or 7 days per week (default 5)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weekly_goal integer DEFAULT 5
  CHECK (weekly_goal IN (3, 5, 7));

COMMENT ON COLUMN profiles.weekly_goal IS 'Target days to secure per week (3=casual, 5=regular, 7=committed).';

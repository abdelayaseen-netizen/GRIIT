-- Persist Last Call and Friend Activity notification toggles (settings screen).
-- Daily reminder already uses reminder_time + reminder_enabled (or preferred_secure_time) on profiles.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_call_enabled boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friend_activity_enabled boolean DEFAULT true;
COMMENT ON COLUMN profiles.last_call_enabled IS '60 min before day reset reminder';
COMMENT ON COLUMN profiles.friend_activity_enabled IS 'When friends respect or secure';

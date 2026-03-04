-- Add Expo push token to profiles for server-side push (e.g. nudge notifications).
-- Run in Supabase SQL Editor. Safe to run multiple times.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

COMMENT ON COLUMN profiles.expo_push_token IS 'Expo push token (ExponentPushToken[...]) for server-sent push notifications';

NOTIFY pgrst, 'reload schema';

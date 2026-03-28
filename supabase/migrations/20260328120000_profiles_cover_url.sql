-- Add cover_url to profiles table (used by profile settings / future public header).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

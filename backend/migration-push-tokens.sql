-- Push tokens for server-sent notifications (Expo). One row per device.
-- Run in Supabase SQL Editor. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own push_tokens" ON push_tokens;
CREATE POLICY "Users can view own push_tokens" ON push_tokens FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own push_tokens" ON push_tokens;
CREATE POLICY "Users can insert own push_tokens" ON push_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own push_tokens" ON push_tokens;
CREATE POLICY "Users can update own push_tokens" ON push_tokens FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own push_tokens" ON push_tokens;
CREATE POLICY "Users can delete own push_tokens" ON push_tokens FOR DELETE USING (auth.uid() = user_id);

-- Reminder settings on profiles (preferred_secure_time already exists; add enabled + timezone)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_timezone TEXT DEFAULT 'UTC';

NOTIFY pgrst, 'reload schema';

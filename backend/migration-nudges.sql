-- Nudges: one row per nudge sent (sender -> recipient with message).
-- Run in Supabase SQL Editor. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS nudges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nudges_to_user_created ON nudges(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nudges_from_to_created ON nudges(from_user_id, to_user_id, created_at DESC);

ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view nudges" ON nudges;
CREATE POLICY "Users can view nudges" ON nudges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own nudges" ON nudges;
CREATE POLICY "Users can insert own nudges" ON nudges FOR INSERT WITH CHECK (auth.uid() = from_user_id);

NOTIFY pgrst, 'reload schema';

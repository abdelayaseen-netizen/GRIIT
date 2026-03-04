-- Last Stand: streak protection (max 2, auto-use when 1 missed day)
-- Run in Supabase SQL editor or via: supabase db push

-- Add Last Stand fields to streaks
ALTER TABLE streaks
  ADD COLUMN IF NOT EXISTS last_stands_available INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_stands_used_total INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_stand_earned_at TIMESTAMPTZ NULL;

-- Constraint: 0 <= last_stands_available <= 2
ALTER TABLE streaks DROP CONSTRAINT IF EXISTS chk_last_stands_available;
ALTER TABLE streaks ADD CONSTRAINT chk_last_stands_available
  CHECK (last_stands_available >= 0 AND last_stands_available <= 2);

-- Table: which dates were protected by a Last Stand (like streak_freezes)
CREATE TABLE IF NOT EXISTS last_stand_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date_key)
);

CREATE INDEX IF NOT EXISTS idx_last_stand_uses_user_id ON last_stand_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_last_stand_uses_date_key ON last_stand_uses(date_key);

ALTER TABLE last_stand_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own last_stand_uses"
  ON last_stand_uses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own last_stand_uses"
  ON last_stand_uses FOR INSERT WITH CHECK (auth.uid() = user_id);

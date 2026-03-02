-- Core fixes: leaderboard, respects, progression, push (structure)
-- Run in Supabase SQL Editor. Safe to run multiple times.

-- =============================================
-- 1) day_secures: one row per user per day secured (for weekly leaderboard)
-- =============================================
CREATE TABLE IF NOT EXISTS day_secures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date_key)
);
CREATE INDEX IF NOT EXISTS idx_day_secures_user_id ON day_secures(user_id);
CREATE INDEX IF NOT EXISTS idx_day_secures_date_key ON day_secures(date_key);

ALTER TABLE day_secures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view day_secures" ON day_secures;
CREATE POLICY "Users can view day_secures" ON day_secures FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own day_secures" ON day_secures;
CREATE POLICY "Users can insert own day_secures" ON day_secures FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 2) respects: actor gives respect to recipient
-- =============================================
CREATE TABLE IF NOT EXISTS respects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_respects_recipient_id ON respects(recipient_id);
CREATE INDEX IF NOT EXISTS idx_respects_actor_id ON respects(actor_id);

ALTER TABLE respects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view respects" ON respects;
CREATE POLICY "Users can view respects" ON respects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own respects" ON respects;
CREATE POLICY "Users can insert own respects" ON respects FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- =============================================
-- 3) profiles: progression + push preference
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_days_secured INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Starter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_secure_time TEXT DEFAULT '20:00';

NOTIFY pgrst, 'reload schema';

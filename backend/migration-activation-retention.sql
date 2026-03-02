-- Activation/Retention: starter challenges (source_starter_id) + streak freeze persistence
-- Run in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS / ON CONFLICT).

-- =============================================
-- 1) Challenges: source_starter_id for onboarding starters
-- =============================================
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS source_starter_id TEXT UNIQUE;

-- =============================================
-- 2) Profiles: streak freeze usage tracking
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_used_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_reset_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- 3) Streak freezes table (one row per frozen date per user)
-- =============================================
CREATE TABLE IF NOT EXISTS streak_freezes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date_key)
);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_id ON streak_freezes(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_date_key ON streak_freezes(date_key);

ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own streak freezes" ON streak_freezes;
CREATE POLICY "Users can view own streak freezes" ON streak_freezes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own streak freezes" ON streak_freezes;
CREATE POLICY "Users can insert own streak freezes" ON streak_freezes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4) Seed: 6 onboarding starter challenges (idempotent by source_starter_id)
-- =============================================
INSERT INTO challenges (
  id, title, description, short_hook, theme_color, rules_text,
  duration_type, duration_days, difficulty, category, visibility, status,
  is_featured, created_by, participants_count, source_starter_id
) VALUES
  (uuid_generate_v4(), 'Water', 'Drink 2 bottles today', 'Quick win', '#3B82F6', 'Complete today.', 'days', 1, 'easy', 'fitness', 'public', 'published', false, 'system', 0, 'onboard-water'),
  (uuid_generate_v4(), 'Steps', '2,000 steps today', 'Quick win', '#10B981', 'Complete today.', 'days', 1, 'easy', 'fitness', 'public', 'published', false, 'system', 0, 'onboard-steps'),
  (uuid_generate_v4(), 'Read 5 min', 'Read for 5 minutes', 'Quick win', '#8B5CF6', 'Complete today.', 'days', 1, 'easy', 'mind', 'public', 'published', false, 'system', 0, 'onboard-read'),
  (uuid_generate_v4(), 'Journal', 'Write 3 sentences about today', 'Quick win', '#F59E0B', 'Complete today.', 'days', 1, 'easy', 'mind', 'public', 'published', false, 'system', 0, 'onboard-journal'),
  (uuid_generate_v4(), '2-Minute Breath', 'One 2-minute breathing exercise', 'Quick win', '#06B6D4', 'Complete today.', 'days', 1, 'easy', 'mind', 'public', 'published', false, 'system', 0, 'onboard-breath'),
  (uuid_generate_v4(), 'Make Your Bed', 'Make your bed today', 'Quick win', '#6366F1', 'Complete today.', 'days', 1, 'easy', 'discipline', 'public', 'published', false, 'system', 0, 'onboard-bed')
ON CONFLICT (source_starter_id) DO NOTHING;

-- Seed tasks for starters (only if challenges were inserted; use source_starter_id to get challenge id)
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes)
SELECT c.id, t.task_title, t.task_type, true, t.duration_mins
FROM (VALUES
  ('onboard-water', 'Drink 2 bottles of water', 'checkin', NULL),
  ('onboard-steps', 'Walk 2,000 steps', 'checkin', NULL),
  ('onboard-read', 'Read for 5 minutes', 'timer', 5),
  ('onboard-journal', 'Write 3 sentences about today', 'journal', NULL),
  ('onboard-breath', '2-minute breathing exercise', 'timer', 2),
  ('onboard-bed', 'Make your bed', 'checkin', NULL)
) AS t(starter_id, task_title, task_type, duration_mins)
JOIN challenges c ON c.source_starter_id = t.starter_id
WHERE NOT EXISTS (SELECT 1 FROM challenge_tasks ct WHERE ct.challenge_id = c.id);

NOTIFY pgrst, 'reload schema';

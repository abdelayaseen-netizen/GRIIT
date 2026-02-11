-- GRIT Database Schema and Seed Data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Story views table
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rules_text TEXT,
  duration_type TEXT CHECK (duration_type IN ('days', '24h', 'multi_day')),
  duration_days INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  category TEXT DEFAULT 'other',
  visibility TEXT CHECK (visibility IN ('public', 'private', 'friends')) DEFAULT 'public',
  status TEXT CHECK (status IN ('published', 'draft')) DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'system',
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participants_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  short_hook TEXT,
  theme_color TEXT,
  live_date TIMESTAMPTZ,
  replay_policy TEXT DEFAULT 'allow_replay',
  require_same_rules BOOLEAN DEFAULT true,
  show_replay_label BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge tasks table
CREATE TABLE IF NOT EXISTS challenge_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('toggle', 'journal', 'timer', 'photo', 'manual', 'time_window', 'run', 'checkin')),
  required BOOLEAN DEFAULT true,
  goal_value NUMERIC,
  time_window_start TEXT,
  time_window_end TEXT,
  min_words INTEGER,
  target_value NUMERIC,
  unit TEXT,
  tracking_mode TEXT,
  photo_required BOOLEAN,
  location_name TEXT,
  radius_meters NUMERIC,
  duration_minutes NUMERIC,
  must_complete_in_session BOOLEAN,
  locations JSONB,
  start_time TEXT,
  start_window_minutes INTEGER,
  min_session_minutes INTEGER,
  journal_type JSONB,
  journal_prompt TEXT,
  allow_free_write BOOLEAN,
  capture_mood BOOLEAN,
  capture_energy BOOLEAN,
  capture_body_state BOOLEAN,
  word_limit_enabled BOOLEAN DEFAULT false,
  word_limit_mode TEXT,
  word_limit_words INTEGER,
  time_enforcement_enabled BOOLEAN DEFAULT false,
  schedule_type TEXT,
  anchor_time_local TEXT,
  task_duration_minutes INTEGER,
  window_start_offset_min INTEGER,
  window_end_offset_min INTEGER,
  hard_window_enabled BOOLEAN DEFAULT false,
  hard_window_start_offset_min INTEGER,
  hard_window_end_offset_min INTEGER,
  timezone_mode TEXT,
  challenge_timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active challenges table
CREATE TABLE IF NOT EXISTS active_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'quit')) DEFAULT 'active',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  current_day INTEGER DEFAULT 1,
  progress_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  active_challenge_id UUID REFERENCES active_challenges(id) ON DELETE CASCADE,
  task_id UUID REFERENCES challenge_tasks(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  value NUMERIC,
  note_text TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(active_challenge_id, task_id, date_key)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_streak_count INTEGER DEFAULT 0,
  longest_streak_count INTEGER DEFAULT 0,
  last_completed_date_key TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_active_challenges_user_id ON active_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_active_challenges_status ON active_challenges(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_date_key ON check_ins(date_key);
CREATE INDEX IF NOT EXISTS idx_check_ins_active_challenge ON check_ins(active_challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured, visibility, status);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Stories are viewable by authenticated users" ON stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Story views policies
CREATE POLICY "Story views viewable by authenticated users" ON story_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own story views" ON story_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Active challenges policies
CREATE POLICY "Users can view own active challenges" ON active_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own active challenges" ON active_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own active challenges" ON active_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON check_ins FOR UPDATE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);

-- Challenges and tasks are public
CREATE POLICY "Challenges viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Challenges insertable by authenticated" ON challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Challenge tasks viewable by everyone" ON challenge_tasks FOR SELECT USING (true);
CREATE POLICY "Challenge tasks insertable by authenticated" ON challenge_tasks FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- SEED: 10 Featured Starter Challenges
-- =============================================

INSERT INTO challenges (id, title, description, short_hook, theme_color, rules_text, duration_type, duration_days, difficulty, category, visibility, status, is_featured, created_by, participants_count) VALUES
  ('c-75-hard',       '75 Day Hard',           'The ultimate discipline challenge. Complete daily tasks without exception for 75 days.',                   '75 days. No excuses. Most people quit.',       '#E87D4F', 'No excuses. No cheating. No days off.',                              'days', 75,  'extreme', 'fitness',     'public', 'published', true, 'system', 2847),
  ('c-30-mindful',    '30 Day Mindful',        'Build a meditation and journaling practice over 30 days.',                                                 '30 days to build a calmer mind.',              '#6B8E7B', 'Be present. Build consistency. Transform your mind.',               'days', 30,  'medium',  'mind',        'public', 'published', true, 'system', 1523),
  ('c-21-morning',    'Morning Warrior',        'Wake up at 5 AM and complete a morning routine for 21 days.',                                              'Win the morning. Win the day.',                '#FFB347', 'Win the morning, win the day.',                                      'days', 21,  'hard',    'discipline',  'public', 'published', true, 'system', 892),
  ('c-14-gratitude',  'Daily Gratitude',        'Write three things you are grateful for every day for 14 days.',                                           'Gratitude changes everything.',                '#9B8EC5', 'Gratitude changes everything.',                                      'days', 14,  'easy',    'mind',        'public', 'published', true, 'system', 456),
  ('c-30-runner',     '30 Day Runner',          'Run every single day for 30 days. Start with 1 mile and build up.',                                        'Lace up. Show up. Every day.',                 '#3B82F6', 'Run at least 1 mile daily. GPS verified.',                          'days', 30,  'hard',    'fitness',     'public', 'published', true, 'system', 1105),
  ('c-7-digital',     '7 Day Digital Detox',    'Drastically reduce screen time for 7 days. Journal your experience.',                                      'Unplug. Reconnect with life.',                 '#14B8A6', 'No social media. Max 30 min phone time outside essentials.',         'days', 7,   'medium',  'mental',      'public', 'published', true, 'system', 734),
  ('c-14-cold',       '14 Day Cold Shower',     'Take a cold shower every morning for 14 days. Build mental toughness.',                                    'Embrace the cold. Build grit.',                '#0EA5E9', 'Cold water only. Minimum 2 minutes. Photo proof required.',          'days', 14,  'hard',    'discipline',  'public', 'published', true, 'system', 967),
  ('c-30-read',       '30 Day Reading',         'Read for at least 30 minutes every day. Journal key takeaways.',                                            'A chapter a day sharpens the mind.',           '#F59E0B', 'Read 30 min daily. Journal what you learned.',                       'days', 30,  'easy',    'mind',        'public', 'published', true, 'system', 1289),
  ('c-21-noexcuse',   '21 Day No Excuses',      'Complete 3 non-negotiable tasks daily: workout, journal, and a cold shower. No skipping.',                  'Zero excuses for 21 days straight.',           '#EF4444', 'All 3 tasks required daily. Miss one = day not secured.',            'days', 21,  'extreme', 'discipline',  'public', 'published', true, 'system', 643),
  ('c-14-walk',       '14 Day Walk & Reflect',  'Walk at least 20 minutes and write a short reflection every day for 14 days.',                              'Move your body. Clear your mind.',             '#8B5CF6', 'Walk 20 min (GPS). Write 50-word reflection.',                       'days', 14,  'easy',    'mental',      'public', 'published', true, 'system', 512);

-- Tasks for 75 Day Hard
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes) VALUES
  ('c-75-hard', 'Run 1 mile', 'run', true, NULL),
  ('c-75-hard', 'Journal entry (120 words)', 'journal', true, NULL);

-- Tasks for 30 Day Mindful
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes) VALUES
  ('c-30-mindful', '10-minute meditation', 'timer', true, 10),
  ('c-30-mindful', 'Evening reflection', 'journal', true, NULL);

-- Tasks for Morning Warrior
INSERT INTO challenge_tasks (challenge_id, title, type, required) VALUES
  ('c-21-morning', '5 AM wake up photo', 'photo', true),
  ('c-21-morning', 'Morning workout (20 min)', 'timer', true);

-- Tasks for Daily Gratitude
INSERT INTO challenge_tasks (challenge_id, title, type, required, min_words) VALUES
  ('c-14-gratitude', 'Gratitude journal', 'journal', true, 50);

-- Tasks for 30 Day Runner
INSERT INTO challenge_tasks (challenge_id, title, type, required) VALUES
  ('c-30-runner', 'Run 1 mile (GPS)', 'run', true),
  ('c-30-runner', 'Post-run check-in', 'checkin', true);

-- Tasks for 7 Day Digital Detox
INSERT INTO challenge_tasks (challenge_id, title, type, required, min_words) VALUES
  ('c-7-digital', 'Screen-free morning check-in', 'checkin', true, NULL),
  ('c-7-digital', 'End-of-day journal', 'journal', true, 80);

-- Tasks for 14 Day Cold Shower
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes) VALUES
  ('c-14-cold', 'Cold shower photo proof', 'photo', true, NULL),
  ('c-14-cold', '2-minute cold timer', 'timer', true, 2);

-- Tasks for 30 Day Reading
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes, min_words) VALUES
  ('c-30-read', 'Read for 30 minutes', 'timer', true, 30, NULL),
  ('c-30-read', 'Key takeaway journal', 'journal', true, NULL, 50);

-- Tasks for 21 Day No Excuses
INSERT INTO challenge_tasks (challenge_id, title, type, required, duration_minutes) VALUES
  ('c-21-noexcuse', 'Workout (30 min)', 'timer', true, 30),
  ('c-21-noexcuse', 'Journal (120 words)', 'journal', true, NULL),
  ('c-21-noexcuse', 'Cold shower proof', 'photo', true, NULL);

-- Tasks for 14 Day Walk & Reflect
INSERT INTO challenge_tasks (challenge_id, title, type, required, min_words) VALUES
  ('c-14-walk', 'Walk 20 minutes (GPS)', 'run', true, NULL),
  ('c-14-walk', 'Short reflection', 'journal', true, 50);

-- Storage buckets setup (run in Supabase dashboard or via supabase CLI)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
-- insert into storage.buckets (id, name, public) values ('stories', 'stories', true);
-- insert into storage.buckets (id, name, public) values ('proofs', 'proofs', true);

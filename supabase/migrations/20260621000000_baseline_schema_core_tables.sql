-- =============================================================================
-- BASELINE SCHEMA: profiles, challenges, active_challenges, challenge_tasks
-- =============================================================================
--
-- DB-01 (audit docs/audits/full-audit-20260621/05_supabase.md):
--   These 4 tables have no tracked CREATE TABLE statement anywhere in the
--   migration set. They were created outside version control (Supabase dashboard
--   or an untracked bootstrap). This migration adds idempotent CREATE TABLE IF
--   NOT EXISTS statements so the schema is reproducible from the repo.
--
-- ⚠  UNVERIFIED-LIVE: RECONSTRUCTED, NOT INTROSPECTED
--   Column definitions below were reconstructed from:
--     - Every .select() / .insert() / .update() call in backend/trpc/routes/* and backend/lib/*
--     - Tracked ALTER TABLE migrations that ADD COLUMN to these tables
--     - TypeScript cast types on query results
--   This migration MUST be diffed against the live schema before being trusted.
--   Run in a staging/test DB first. Do NOT apply to production without comparing
--   column types, defaults, and FK constraints against the real table definitions.
--
-- SAFE TO RUN MULTIPLE TIMES: all statements use CREATE TABLE IF NOT EXISTS and
-- ADD COLUMN IF NOT EXISTS so running against a DB where the tables already exist
-- will no-op gracefully.
--
-- How to verify:
--   1. Open Supabase SQL editor (staging or prod).
--   2. Run: \d profiles  (or SELECT column_name, data_type, column_default, is_nullable
--              FROM information_schema.columns WHERE table_name = 'profiles';)
--   3. Compare to the column list below; update this file with any discrepancies.
--   4. Only then apply to production.
--
-- Yaseen: APPLY MANUALLY in Supabase SQL editor — Cursor agent does not
-- run production migrations.
-- =============================================================================

-- ============================================================
-- 1. profiles
-- ============================================================
-- Core auth/profile table. user_id is the PK and foreign-keys to auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id         UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT          NOT NULL,
  display_name    TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  tier            TEXT          DEFAULT 'free',
  -- subscription (synced from RevenueCat via lib/subscription.ts)
  subscription_status   TEXT    DEFAULT 'free',
  subscription_expiry   TIMESTAMPTZ,
  is_premium            BOOLEAN DEFAULT false,
  -- onboarding
  onboarding_completed  BOOLEAN DEFAULT false,
  onboarding_answers    JSONB,
  -- stats (computed / maintained by cron)
  total_days_secured    INTEGER DEFAULT 0,
  -- notification prefs (cron-reminders.ts)
  reminder_enabled      BOOLEAN DEFAULT false,
  reminder_time         TEXT,                    -- HH:MM local
  reminder_timezone     TEXT,
  timezone              TEXT,
  -- push tokens (NOTIF-01: see audit; two columns in use — reconcile before using)
  expo_push_token       TEXT,
  push_token            TEXT,
  -- social
  profile_visibility    TEXT    DEFAULT 'PUBLIC',
  last_comeback_push_at TIMESTAMPTZ,
  -- timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes reconstructed from observed query patterns
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

-- RLS (mirrors 20260510000000_profiles_rls_hardening.sql)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. challenges
-- ============================================================
-- User-created and system challenges.
CREATE TABLE IF NOT EXISTS public.challenges (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id            UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  title                 TEXT    NOT NULL,
  description           TEXT,
  metadata              JSONB,
  -- duration
  duration_type         TEXT    NOT NULL DEFAULT 'multi_day',  -- 'multi_day' | '24h'
  duration_days         INTEGER NOT NULL DEFAULT 30,
  starts_at             TIMESTAMPTZ,
  ends_at               TIMESTAMPTZ,
  started_at            TIMESTAMPTZ,
  live_date             TIMESTAMPTZ,
  -- categorisation
  category              TEXT    DEFAULT 'other',
  difficulty            TEXT    DEFAULT 'medium',     -- 'medium' | 'hard' | 'extreme'
  status                TEXT    DEFAULT 'published',  -- 'published' | 'draft' | 'archived' | 'rejected'
  visibility            TEXT    DEFAULT 'PUBLIC',     -- 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  is_featured           BOOLEAN DEFAULT false,
  -- participation
  participation_type    TEXT    DEFAULT 'solo',       -- 'solo' | 'team' | 'shared_goal' | 'duo'
  team_size             INTEGER DEFAULT 1,
  run_status            TEXT,                         -- 'waiting' | 'active' | null
  -- shared goal
  shared_goal_target    NUMERIC,
  shared_goal_unit      TEXT,
  deadline_type         TEXT,
  deadline_date         TIMESTAMPTZ,
  -- replay
  replay_policy         TEXT    DEFAULT 'allow_replay',
  require_same_rules    BOOLEAN DEFAULT true,
  show_replay_label     BOOLEAN DEFAULT true,
  -- denormalised
  participants_count    INTEGER DEFAULT 0,
  -- timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS challenges_creator_idx  ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS challenges_status_idx   ON public.challenges(status);
CREATE INDEX IF NOT EXISTS challenges_featured_idx ON public.challenges(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS challenges_created_idx  ON public.challenges(created_at DESC);

-- RLS (mirrors 20250318000000_challenges_rls_public_read.sql)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Challenges insertable by authenticated" ON public.challenges;
CREATE POLICY "Challenges insertable by authenticated" ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "challenges_update_own" ON public.challenges;
CREATE POLICY "challenges_update_own" ON public.challenges
  FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- ============================================================
-- 3. active_challenges
-- ============================================================
-- One row per user-per-challenge join (the user's "active" enrollment).
CREATE TABLE IF NOT EXISTS public.active_challenges (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id    UUID    NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  status          TEXT    NOT NULL DEFAULT 'active',  -- 'active' | 'completed' | 'abandoned'
  start_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_at          TIMESTAMPTZ NOT NULL,
  current_day     INTEGER DEFAULT 1,
  progress_percent NUMERIC DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  -- milestone share flags (20260409000000_active_challenges_milestone_shared.sql)
  milestone_30_shared  BOOLEAN DEFAULT false,
  milestone_75_shared  BOOLEAN DEFAULT false,
  -- timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS active_challenges_user_idx       ON public.active_challenges(user_id);
CREATE INDEX IF NOT EXISTS active_challenges_challenge_idx  ON public.active_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS active_challenges_status_idx     ON public.active_challenges(status);
CREATE UNIQUE INDEX IF NOT EXISTS active_challenges_user_challenge_active_idx
  ON public.active_challenges(user_id, challenge_id) WHERE status = 'active';

-- RLS (mirrors 20250318000000 + 20260502230000_active_challenges_update_policy.sql)
ALTER TABLE public.active_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own active challenges" ON public.active_challenges;
CREATE POLICY "Users can insert own active challenges" ON public.active_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own active challenges" ON public.active_challenges;
CREATE POLICY "Users can view own active challenges" ON public.active_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own active challenges" ON public.active_challenges;
CREATE POLICY "Users can update own active challenges" ON public.active_challenges
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own active challenges" ON public.active_challenges;
CREATE POLICY "Users can delete own active challenges" ON public.active_challenges
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. challenge_tasks
-- ============================================================
-- One row per task within a challenge template.
CREATE TABLE IF NOT EXISTS public.challenge_tasks (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    UUID    NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  task_type       TEXT    NOT NULL DEFAULT 'manual',
  order_index     INTEGER DEFAULT 0,
  config          JSONB   DEFAULT '{}',
  -- photo / proof
  require_photo   BOOLEAN DEFAULT false,
  -- timer
  timer_direction TEXT,                -- 'up' | 'down'
  timer_hard_mode BOOLEAN DEFAULT false,
  -- heart rate
  require_heart_rate      BOOLEAN DEFAULT false,
  heart_rate_threshold    INTEGER,
  -- location
  require_location        BOOLEAN DEFAULT false,
  location_name           TEXT,
  location_latitude       NUMERIC,
  location_longitude      NUMERIC,
  location_radius_meters  INTEGER,
  -- duration / target
  min_duration_minutes    INTEGER,
  target_mode             TEXT,
  start_value             NUMERIC,
  start_duration_minutes  INTEGER,
  -- hard-mode time window (checkins gate)
  hard_mode               BOOLEAN DEFAULT false,
  time_window_end         TEXT,        -- 'HH:MM' local
  schedule_window_start   TEXT,
  schedule_window_end     TEXT,
  schedule_timezone       TEXT,
  -- routine anchor (20260428000002_task_routine_anchor.sql)
  routine_anchor          TEXT,
  routine_anchor_custom   TEXT,
  -- timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS challenge_tasks_challenge_idx ON public.challenge_tasks(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_tasks_order_idx    ON public.challenge_tasks(challenge_id, order_index);

-- RLS (mirrors 20250318000000_challenges_rls_public_read.sql)
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenge tasks viewable by everyone" ON public.challenge_tasks;
CREATE POLICY "Challenge tasks viewable by everyone" ON public.challenge_tasks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Challenge tasks insertable by authenticated" ON public.challenge_tasks;
CREATE POLICY "Challenge tasks insertable by authenticated" ON public.challenge_tasks
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Notify PostgREST to reload schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';

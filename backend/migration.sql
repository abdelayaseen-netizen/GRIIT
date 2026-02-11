-- Migration: Add missing columns to challenges and challenge_tasks tables
-- Run this in Supabase SQL Editor if tables already exist but are missing columns.
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- =============================================
-- 1) Fix challenges table
-- =============================================

-- Add 'friends' to visibility CHECK constraint
-- First drop old constraint, then re-add with 'friends' included
DO $$
BEGIN
  ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_visibility_check;
  ALTER TABLE challenges ADD CONSTRAINT challenges_visibility_check
    CHECK (visibility IN ('public', 'private', 'friends'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update visibility constraint: %', SQLERRM;
END $$;

-- Add missing columns to challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS live_date TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS replay_policy TEXT DEFAULT 'allow_replay';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS require_same_rules BOOLEAN DEFAULT true;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS show_replay_label BOOLEAN DEFAULT true;

-- =============================================
-- 2) Fix challenge_tasks table
-- =============================================

-- Journal fields
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS journal_type JSONB;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS journal_prompt TEXT;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS allow_free_write BOOLEAN;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS capture_mood BOOLEAN;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS capture_energy BOOLEAN;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS capture_body_state BOOLEAN;

-- Word limit fields
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS word_limit_enabled BOOLEAN DEFAULT false;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS word_limit_mode TEXT;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS word_limit_words INTEGER;

-- Time enforcement fields
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS time_enforcement_enabled BOOLEAN DEFAULT false;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS schedule_type TEXT;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS anchor_time_local TEXT;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS task_duration_minutes INTEGER;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS window_start_offset_min INTEGER;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS window_end_offset_min INTEGER;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS hard_window_enabled BOOLEAN DEFAULT false;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS hard_window_start_offset_min INTEGER;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS hard_window_end_offset_min INTEGER;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS timezone_mode TEXT;
ALTER TABLE challenge_tasks ADD COLUMN IF NOT EXISTS challenge_timezone TEXT;

-- =============================================
-- 3) Refresh PostgREST schema cache
-- =============================================
-- After running this migration, go to Supabase Dashboard > Settings > API
-- and click "Reload schema cache" or restart the API.
-- Alternatively, run: NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

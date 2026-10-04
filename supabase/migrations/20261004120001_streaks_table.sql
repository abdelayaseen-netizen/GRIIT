-- DRAFT. DO NOT APPLY until reviewed.
-- Prod already has public.streaks. There is no CREATE TABLE in earlier migrations.
-- CREATE TABLE IF NOT EXISTS is a no-op when the table already exists.
-- Every column below is [UNVERIFIED]: best known from secure_day writes,
-- the sync trigger (current_streak, best_streak), and the last-stand alters.
-- Not confirmed against production information_schema.

create table if not exists public.streaks (
  -- [UNVERIFIED] primary key. A unique index on user_id exists; a separate id column was not found in code.
  user_id uuid primary key,
  -- [UNVERIFIED]
  active_streak_count integer,
  -- [UNVERIFIED]
  longest_streak_count integer,
  -- [UNVERIFIED]
  last_completed_date_key text,
  -- [UNVERIFIED] kept in sync with active_streak_count by trg_sync_streak_columns
  current_streak integer,
  -- [UNVERIFIED] kept in sync with longest_streak_count by trg_sync_streak_columns
  best_streak integer,
  -- [UNVERIFIED]
  last_stands_available integer,
  -- [UNVERIFIED]
  last_stands_used_total integer,
  -- [UNVERIFIED]
  last_stand_earned_at timestamptz
);

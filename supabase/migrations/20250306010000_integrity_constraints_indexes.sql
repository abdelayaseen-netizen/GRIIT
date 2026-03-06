-- Database-level integrity: unique constraints and indexes for second-pass hardening.
-- Run after 20250306000000_join_challenge_rpc.sql. Safe to run multiple times (IF NOT EXISTS / DO blocks).

-- =============================================
-- 1) day_secures: one row per (user_id, date_key)
-- =============================================
DO $$
BEGIN
  ALTER TABLE day_secures DROP CONSTRAINT IF EXISTS day_secures_user_id_date_key_key;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'drop day_secures constraint: %', SQLERRM;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS day_secures_user_id_date_key_key
  ON day_secures (user_id, date_key);

-- =============================================
-- 2) active_challenges: one active join per (user_id, challenge_id)
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS active_challenges_one_active_per_user_challenge
  ON active_challenges (user_id, challenge_id)
  WHERE status = 'active';

-- =============================================
-- 3) Indexes for hot paths
-- =============================================
CREATE INDEX IF NOT EXISTS idx_active_challenges_user_status
  ON active_challenges (user_id, status);

CREATE INDEX IF NOT EXISTS idx_check_ins_active_date
  ON check_ins (active_challenge_id, date_key);

CREATE INDEX IF NOT EXISTS idx_day_secures_date_key
  ON day_secures (date_key);

CREATE INDEX IF NOT EXISTS idx_day_secures_user_date
  ON day_secures (user_id, date_key);

-- streaks: ensure unique on user_id for upsert (may already exist as PK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'streaks'::regclass AND contype = 'u' AND array_length(conkey, 1) = 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS streaks_user_id_key ON streaks (user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'streaks user_id unique: %', SQLERRM;
END $$;

-- respects: unique (actor_id, recipient_id) for idempotent give
CREATE UNIQUE INDEX IF NOT EXISTS respects_actor_recipient_key
  ON respects (actor_id, recipient_id);

-- accountability_pairs: unique (user_id, partner_id) if not already
CREATE UNIQUE INDEX IF NOT EXISTS accountability_pairs_user_partner_key
  ON accountability_pairs (user_id, partner_id);

NOTIFY pgrst, 'reload schema';

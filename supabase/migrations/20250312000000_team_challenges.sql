-- Team challenges: add columns to challenges, create challenge_members and shared_goal_logs.
-- Solo behavior unchanged. Run after 20250311000000_connected_accounts_strava.sql.

-- =============================================
-- 1) challenges: new columns for participation type and team/shared-goal run
-- =============================================
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS participation_type TEXT DEFAULT 'solo';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS shared_goal_target NUMERIC;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS shared_goal_unit TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS deadline_type TEXT;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS deadline_date DATE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS run_status TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_participation_type_check') THEN
    ALTER TABLE challenges ADD CONSTRAINT challenges_participation_type_check
      CHECK (participation_type IN ('solo', 'duo', 'team', 'shared_goal'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_run_status_check') THEN
    ALTER TABLE challenges ADD CONSTRAINT challenges_run_status_check
      CHECK (run_status IS NULL OR run_status IN ('waiting', 'active', 'completed', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_team_size_check') THEN
    ALTER TABLE challenges ADD CONSTRAINT challenges_team_size_check
      CHECK (team_size >= 1 AND team_size <= 10);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'constraints: %', SQLERRM;
END $$;

-- =============================================
-- 2) challenge_members: who is in a challenge (run). For team/shared_goal, multiple rows per challenge.
-- =============================================
CREATE TABLE IF NOT EXISTS challenge_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quit', 'failed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_members_challenge_id ON challenge_members(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_members_user_id ON challenge_members(user_id);

ALTER TABLE challenge_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_members_select" ON challenge_members;
CREATE POLICY "challenge_members_select" ON challenge_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM challenge_members cm2 WHERE cm2.challenge_id = challenge_members.challenge_id AND cm2.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "challenge_members_insert_own" ON challenge_members;
CREATE POLICY "challenge_members_insert_own" ON challenge_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_members_update_own" ON challenge_members;
CREATE POLICY "challenge_members_update_own" ON challenge_members FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 3) shared_goal_logs: progress entries for shared_goal challenges. Total derived as SUM(amount).
-- =============================================
CREATE TABLE IF NOT EXISTS shared_goal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_shared_goal_logs_challenge_id ON shared_goal_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_shared_goal_logs_user_id ON shared_goal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_goal_logs_challenge_logged ON shared_goal_logs(challenge_id, logged_at);

ALTER TABLE shared_goal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_goal_logs_select_member" ON shared_goal_logs;
CREATE POLICY "shared_goal_logs_select_member" ON shared_goal_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM challenge_members cm WHERE cm.challenge_id = shared_goal_logs.challenge_id AND cm.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "shared_goal_logs_insert_own" ON shared_goal_logs;
CREATE POLICY "shared_goal_logs_insert_own" ON shared_goal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

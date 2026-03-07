-- Connected accounts for OAuth providers (Strava, future: Apple Health, WHOOP, etc.)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider);

ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own connected_accounts" ON connected_accounts;
CREATE POLICY "Users can view own connected_accounts" ON connected_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own connected_accounts" ON connected_accounts;
CREATE POLICY "Users can insert own connected_accounts" ON connected_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own connected_accounts" ON connected_accounts;
CREATE POLICY "Users can update own connected_accounts" ON connected_accounts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own connected_accounts" ON connected_accounts;
CREATE POLICY "Users can delete own connected_accounts" ON connected_accounts
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE connected_accounts IS 'OAuth provider connections (Strava, etc.). Tokens stored server-side only.';

-- check_ins: proof and verification fields for Strava/activity verification
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS proof_source TEXT;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS proof_payload_json JSONB;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS external_activity_id TEXT;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS verification_status TEXT;

COMMENT ON COLUMN check_ins.proof_source IS 'e.g. manual, photo, strava';
COMMENT ON COLUMN check_ins.proof_payload_json IS 'Provider-specific proof payload (e.g. Strava activity snapshot)';
COMMENT ON COLUMN check_ins.external_activity_id IS 'External ID (e.g. Strava activity id)';
COMMENT ON COLUMN check_ins.verification_status IS 'e.g. pending, verified, failed';

-- challenge_tasks: verification method lives in config JSONB (no new columns).
-- Config may include: verification_method, verification_rule_json
-- Example: verification_method = "strava_activity", verification_rule_json = {"sport":"Run","min_distance_m":3000,"min_moving_time_s":900}

NOTIFY pgrst, 'reload schema';

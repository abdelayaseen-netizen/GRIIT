-- Invite/referral attribution: who referred whom, from which link, and whether they joined.
CREATE TABLE IF NOT EXISTS invite_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  invite_code TEXT,
  source TEXT NOT NULL DEFAULT 'invite',
  joined_challenge BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_tracking_referrer ON invite_tracking(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_invite_tracking_referred ON invite_tracking(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_invite_tracking_challenge ON invite_tracking(challenge_id);

ALTER TABLE invite_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals as referrer" ON invite_tracking;
CREATE POLICY "Users can view own referrals as referrer" ON invite_tracking
  FOR SELECT USING (auth.uid() = referrer_user_id);

DROP POLICY IF EXISTS "Users can view own referrals as referred" ON invite_tracking;
CREATE POLICY "Users can view own referrals as referred" ON invite_tracking
  FOR SELECT USING (auth.uid() = referred_user_id);

-- Referred user can insert a row where they are the referred_user_id (attribution on open/signup).
DROP POLICY IF EXISTS "Users can insert self as referred" ON invite_tracking;
CREATE POLICY "Users can insert self as referred" ON invite_tracking
  FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- Referred user can update their row to set joined_challenge.
DROP POLICY IF EXISTS "Users can update own referred row" ON invite_tracking;
CREATE POLICY "Users can update own referred row" ON invite_tracking
  FOR UPDATE USING (auth.uid() = referred_user_id);

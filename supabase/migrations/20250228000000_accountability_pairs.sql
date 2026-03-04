-- Accountability partners (Accountability Circle): 1-3 partners per user
-- Run this migration in Supabase SQL editor or via: supabase db push

CREATE TABLE IF NOT EXISTS accountability_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_accountability_pairs_user_status_created
  ON accountability_pairs(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_accountability_pairs_partner_status_created
  ON accountability_pairs(partner_id, status, created_at DESC);

ALTER TABLE accountability_pairs ENABLE ROW LEVEL SECURITY;

-- SELECT: only if auth.uid() is user_id or partner_id
CREATE POLICY "Users can view own pairs as user or partner"
  ON accountability_pairs FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- INSERT: only if auth.uid() = user_id (inviter)
CREATE POLICY "Users can insert as inviter"
  ON accountability_pairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only if participant; accept/decline enforced in app (partner_id only)
CREATE POLICY "Users can update pairs they are part of"
  ON accountability_pairs FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- DELETE: optional; allow either participant to remove/block
CREATE POLICY "Users can delete pairs they are part of"
  ON accountability_pairs FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

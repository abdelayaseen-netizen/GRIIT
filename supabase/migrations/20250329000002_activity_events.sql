-- activity_events: feed of community actions (secured_day, lost_streak, unlocked_achievement, completed_challenge, joined_challenge, last_stand).
CREATE TABLE IF NOT EXISTS activity_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  challenge_id uuid REFERENCES challenges(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_created ON activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON activity_events(user_id, created_at DESC);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read activity" ON activity_events;
CREATE POLICY "Anyone can read activity"
  ON activity_events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own activity" ON activity_events;
CREATE POLICY "Users can insert own activity"
  ON activity_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

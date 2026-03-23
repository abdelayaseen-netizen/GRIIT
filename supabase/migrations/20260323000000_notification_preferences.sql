ALTER TABLE profiles ADD COLUMN IF NOT EXISTS morning_kickoff_enabled boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_summary_enabled boolean DEFAULT true;

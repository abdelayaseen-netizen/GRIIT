-- One-time milestone celebration (Day 30, Day 75) — show share modal once per milestone per challenge.
ALTER TABLE active_challenges ADD COLUMN IF NOT EXISTS milestone_30_shared BOOLEAN DEFAULT false;
ALTER TABLE active_challenges ADD COLUMN IF NOT EXISTS milestone_75_shared BOOLEAN DEFAULT false;

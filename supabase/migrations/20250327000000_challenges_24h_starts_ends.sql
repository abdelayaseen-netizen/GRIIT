-- Add starts_at and ends_at for 24-hour challenges (countdown and expiry).
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS).

ALTER TABLE challenges ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Optional: backfill ends_at for existing 24h challenges that have live_date but no ends_at
UPDATE challenges
SET
  starts_at = live_date,
  ends_at = live_date + INTERVAL '24 hours'
WHERE duration_type = '24h'
  AND live_date IS NOT NULL
  AND ends_at IS NULL;

NOTIFY pgrst, 'reload schema';

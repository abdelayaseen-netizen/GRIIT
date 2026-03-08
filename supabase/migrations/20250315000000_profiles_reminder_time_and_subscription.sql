-- reminder_time: morning daily reminder (default 09:00). preferred_secure_time remains for backward compat / evening.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reminder_time TEXT DEFAULT '09:00';

-- Subscription fields for premium (future launch)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_platform TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;

COMMENT ON COLUMN profiles.reminder_time IS 'Daily morning reminder time (HH:mm) in user local timezone';
COMMENT ON COLUMN profiles.subscription_status IS 'free | premium | trial';
COMMENT ON COLUMN profiles.subscription_expiry IS 'When subscription or trial ends';
COMMENT ON COLUMN profiles.subscription_platform IS 'ios | android when purchased via app store';

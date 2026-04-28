-- Cached Pro status; can be updated from RevenueCat webhooks or client sync.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_updated_at TIMESTAMPTZ NULL;

NOTIFY pgrst, 'reload schema';

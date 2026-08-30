-- profiles.timezone must be set explicitly by the client (device IANA).
-- A DEFAULT of 'UTC' silently mis-aligned day boundaries for users who never
-- wrote a timezone (live onboarding / profiles.create). Column stays nullable;
-- secure_day and date helpers already COALESCE to UTC when null/blank.
-- No backfill — production rows were corrected by hand.

ALTER TABLE public.profiles
  ALTER COLUMN timezone DROP DEFAULT;

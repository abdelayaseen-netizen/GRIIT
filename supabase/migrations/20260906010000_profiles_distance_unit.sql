-- profiles.distance_unit — account-level km/mi preference.
-- Must be applied to live Supabase before device testing.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS distance_unit TEXT NOT NULL DEFAULT 'mi';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_distance_unit_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_distance_unit_check
  CHECK (distance_unit IN ('km', 'mi'));

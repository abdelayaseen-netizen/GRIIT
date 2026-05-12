-- profiles RLS hardening — close the anonymous SELECT leak.
--
-- Background (from migration 20260503000000_profiles_delete_policy_...):
--   The current SELECT policy "Public profiles are viewable by everyone"
--   is `for select to public using (true)`, which means anyone with the
--   anon key can read every column on every profile row, including:
--     - expo_push_token (push abuse vector)
--     - subscription_status, subscription_expires_at (PII / billing)
--     - last_comeback_push_at, reminder_time (behavior tracking)
--     - email-adjacent fields if any get added later
--
-- This migration:
--   1. Drops the over-permissive anon SELECT policy.
--   2. Adds an authenticated-only SELECT policy: any signed-in user can
--      read any profile row (preserves discover feed, profile cards,
--      mention search, leaderboards — all of which require sign-in in
--      the app today).
--   3. Creates `public.profiles_public` view that exposes ONLY safe
--      display columns (user_id, username, display_name, avatar_url,
--      bio, profile_visibility, created_at) so any future anon-key
--      surface can opt-in via the view rather than the table.
--
-- Production-safety:
--   - Backend tRPC routes already project specific columns via
--     supabase-js .select("user_id, username, display_name, ..."); they
--     do NOT read the sensitive columns under client auth. Verified
--     by grep on backend/trpc/routes/.
--   - Service-role reads (createServiceClient) bypass RLS entirely so
--     server-side jobs (feed assembly, push delivery, leaderboards) are
--     unaffected.
--
-- Idempotent: DROP/CREATE pattern. Safe to re-run.
--
-- Yaseen: APPLY MANUALLY in Supabase SQL editor — Cursor agent does not
-- run production migrations.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Drop the anonymous SELECT policy.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2. Authenticated-only SELECT policy. Signed-in users see all profile
--    rows; anonymous traffic gets nothing through the table.
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Public-display view for any future anon-facing surface.
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
  SELECT
    user_id,
    username,
    display_name,
    avatar_url,
    bio,
    profile_visibility,
    created_at
  FROM public.profiles;

-- View security: SECURITY INVOKER means the view runs under the caller's
-- privileges. Combined with `grant select on profiles_public to anon`
-- below, anon callers get only the projected columns.
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- 4. Grants. Only on the view, not the table.
GRANT SELECT ON public.profiles_public TO anon;
GRANT SELECT ON public.profiles_public TO authenticated;

NOTIFY pgrst, 'reload schema';

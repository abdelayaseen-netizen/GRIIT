-- profiles RLS: sync prod with committed migrations + harden UPDATE policy.
--
-- Production state captured 2026-05-02 via docs/db/VERIFY_PROFILES_RLS_STATE.sql:
--   - RLS enabled: yes (rowsecurity=true, forcerowsecurity=false)
--   - INSERT policy: "Users can create their own profile" (authenticated, with_check ok)
--   - SELECT policy: "Public profiles are viewable by everyone" (public, using=true)
--   - UPDATE policy: "Users can update their own profile" (authenticated, using ok, with_check NULL)
--   - DELETE policy: NONE (causes profiles.deleteAccount to silently fail under RLS)
--
-- This migration:
--   1. Adds a DELETE policy so account deletion actually deletes the row.
--      (App Store compliance: account deletion must work end-to-end.)
--   2. Hardens the UPDATE policy with WITH CHECK (auth.uid() = user_id) to
--      prevent re-assigning user_id during an UPDATE. Same pattern as
--      supabase/migrations/20260502230000_active_challenges_update_policy.sql.
--
-- This migration deliberately does NOT touch:
--   - The SELECT policy (using=true, public). That policy makes every profile
--     row readable by anonymous requests with the anon key. This is probably
--     intentional for discover feed / profile cards but conflicts with
--     profile_visibility='private' and leaks columns like expo_push_token,
--     subscription_status/expiry, last_comeback_push_at. Tightening this is a
--     product decision plus app-layer work (separate public-card view or RPC).
--     Tracked as a follow-up ticket.
--   - The INSERT policy (already correct).
--
-- Idempotent: DROP POLICY IF EXISTS ... CREATE POLICY. Safe to re-run.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. DELETE: required for backend/trpc/routes/profiles.ts:498-499 (deleteAccount).
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. UPDATE: drop the existing loose policy, recreate with WITH CHECK.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';

-- Run in Supabase SQL Editor against PRODUCTION (project ref: iazdfbqwudlodozgoyov).
--
-- Purpose: capture the actual RLS state of public.profiles so we can write a
-- correct migration. The audit found only a DELETE policy in committed
-- migrations, but the codebase clearly uses SELECT / INSERT / UPDATE against
-- profiles — so production must have those policies, just not committed.
--
-- Three things to capture:
--   1. Is RLS enabled on public.profiles?
--   2. What policies exist? (name, cmd, roles, using, with_check)
--   3. Cross-reference against codebase user-JWT call sites (listed below).
--
-- Codebase call sites that hit public.profiles via user JWT (ctx.supabase or
-- client supabase) — the migration must support all of these operations:
--
-- SELECT (user JWT, representative — 30+ total):
--   backend/trpc/routes/checkins.ts:379
--   backend/trpc/routes/profiles-stats.ts:129
--   backend/trpc/routes/feed.ts:191
--   backend/trpc/routes/profiles.ts:54
--   backend/trpc/routes/respects.ts:98
--   app/auth/login.tsx:143
--   app/_layout.tsx:111
--
-- INSERT / UPSERT:
--   backend/trpc/routes/profiles.ts:54-55  (upsert, primary create path)
--   backend/trpc/routes/user.ts:49         (upsert)
--   backend/trpc/routes/challenges-create.ts:162  (upsert side-effect)
--   components/onboarding/screens/ProfileSetup.tsx:120  (client upsert)
--   app/create-profile.tsx:120             (client upsert)
--   app/auth/signup.tsx:181-182            (client upsert)
--   contexts/AppContext.tsx:221-222        (client upsert)
--
-- UPDATE:
--   backend/trpc/routes/profiles.ts:175-176, :269-270, :329-330
--   backend/trpc/routes/notifications.ts:204
--   backend/trpc/routes/streaks.ts:69-70, :97-98
--   lib/subscription.ts:112-113            (RC sync — client JWT)
--   components/onboarding/screens/AutoSuggestChallengeScreen.tsx:101-102
--
-- DELETE:
--   backend/trpc/routes/profiles.ts:498-499  (deleteAccount — only in-tree DELETE)
--
-- After running:
--   - If RLS is OFF, profiles is wide open. That's a P0. Stop and report.
--   - If RLS is ON, the policy table tells us exactly what migrations to write.

-- Step 1 — is RLS enabled on public.profiles?
-- (Uses pg_class because pg_tables.forcerowsecurity is not exposed on all
-- Supabase Postgres versions and produces "column does not exist" errors.)
SELECT
  n.nspname AS schemaname,
  c.relname AS tablename,
  c.relrowsecurity      AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'profiles';

-- Step 2 — every policy on public.profiles
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual::text       AS using_clause,
  with_check::text AS with_check_clause,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY cmd, policyname;

-- Step 3 — sanity check: which columns does profiles actually have?
-- The migration set referenced multiple ADD COLUMN IF NOT EXISTS statements
-- across many files; this confirms the live shape.
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

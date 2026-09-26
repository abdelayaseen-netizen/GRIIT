-- Drop leftover permissive RLS on challenges / challenge_tasks.
-- Live keep-list is not redefined here (prod already has those policies).
-- Write only — do not apply in this session.
--
-- KEEP on public.challenges:
--   "Anyone can read public published challenges"
--   "Users can read challenges via active participation"
--   "challenges_select"
--   "challenges_update"
-- KEEP on public.challenge_tasks:
--   "Users can read challenge_tasks via active participation"
--   "challenge_tasks_select"
--   "challenge_tasks_insert" (roles only: TO authenticated)

BEGIN;

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- challenges SELECT: drop USING (true) and NULL-as-public
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.challenges;
DROP POLICY IF EXISTS "Anyone can read public challenges" ON public.challenges;

-- ---------------------------------------------------------------------------
-- challenges INSERT: any-creator (incl. NULL catalog) → own uid only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Challenges insertable by authenticated" ON public.challenges;
DROP POLICY IF EXISTS "challenges_insert" ON public.challenges;
CREATE POLICY "challenges_insert" ON public.challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- ---------------------------------------------------------------------------
-- challenge_tasks SELECT: drop USING (true) and NULL-as-public
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Challenge tasks viewable by everyone" ON public.challenge_tasks;
DROP POLICY IF EXISTS "Anyone can read challenge_tasks for public challenges" ON public.challenge_tasks;

-- ---------------------------------------------------------------------------
-- challenge_tasks INSERT: drop WITH CHECK (true); keep challenge_tasks_insert
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Challenge tasks insertable by authenticated" ON public.challenge_tasks;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'challenge_tasks'
      AND policyname = 'challenge_tasks_insert'
  ) THEN
    ALTER POLICY challenge_tasks_insert ON public.challenge_tasks TO authenticated;
  ELSE
    -- Fresh DBs that never got the live policy: creator may add tasks on own rows only.
    CREATE POLICY challenge_tasks_insert ON public.challenge_tasks
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.challenges c
          WHERE c.id = challenge_tasks.challenge_id
            AND c.creator_id = auth.uid()
        )
      );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- =============================================================================
-- Verification (run after apply; not part of the migration)
-- Replace <private_id>, <user_a>, <user_b>. user_b is not creator/member.
-- Run as postgres in the SQL editor. Each block is its own transaction.
-- =============================================================================
--
-- 1) Policies
--
-- SELECT tablename, policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('challenges', 'challenge_tasks')
-- ORDER BY tablename, cmd, policyname;
--
-- Expect GONE:
--   Challenges viewable by everyone
--   Anyone can read public challenges
--   Challenges insertable by authenticated
--   Challenge tasks viewable by everyone
--   Anyone can read challenge_tasks for public challenges
--   Challenge tasks insertable by authenticated
-- Expect PRESENT:
--   Anyone can read public published challenges (SELECT)
--   Users can read challenges via active participation (SELECT)
--   challenges_select (SELECT)
--   challenges_update (UPDATE)
--   challenges_insert (INSERT, roles {authenticated}, with_check creator_id = auth.uid())
--   Users can read challenge_tasks via active participation (SELECT)
--   challenge_tasks_select (SELECT)
--   challenge_tasks_insert (INSERT, roles {authenticated})
--
-- 2) Anon cannot read a PRIVATE challenge or its tasks
--
-- BEGIN;
-- SET LOCAL ROLE anon;
-- SELECT id, visibility FROM public.challenges WHERE id = '<private_id>';
-- SELECT id FROM public.challenge_tasks WHERE challenge_id = '<private_id>';
-- -- expect 0 rows each
-- ROLLBACK;
--
-- 3) Second user (not creator / not member) cannot read the same rows
--
-- BEGIN;
-- SELECT set_config(
--   'request.jwt.claims',
--   json_build_object('sub', '<user_b>', 'role', 'authenticated')::text,
--   true
-- );
-- SET LOCAL ROLE authenticated;
-- SELECT id, visibility FROM public.challenges WHERE id = '<private_id>';
-- SELECT id FROM public.challenge_tasks WHERE challenge_id = '<private_id>';
-- -- expect 0 rows each
-- ROLLBACK;
--
-- 4) Insert creator_id NULL rejected (authenticated as user_b)
--
-- BEGIN;
-- SELECT set_config(
--   'request.jwt.claims',
--   json_build_object('sub', '<user_b>', 'role', 'authenticated')::text,
--   true
-- );
-- SET LOCAL ROLE authenticated;
-- INSERT INTO public.challenges (creator_id, title, duration_days, visibility, status)
-- VALUES (NULL, 'rls-null-creator', 1, 'PRIVATE', 'published');
-- -- expect 42501 / new row violates row-level security
-- ROLLBACK;
--
-- 5) Insert another user's creator_id rejected (authenticated as user_b, creator_id = user_a)
--
-- BEGIN;
-- SELECT set_config(
--   'request.jwt.claims',
--   json_build_object('sub', '<user_b>', 'role', 'authenticated')::text,
--   true
-- );
-- SET LOCAL ROLE authenticated;
-- INSERT INTO public.challenges (creator_id, title, duration_days, visibility, status)
-- VALUES ('<user_a>'::uuid, 'rls-other-creator', 1, 'PRIVATE', 'published');
-- -- expect 42501 / new row violates row-level security
-- ROLLBACK;

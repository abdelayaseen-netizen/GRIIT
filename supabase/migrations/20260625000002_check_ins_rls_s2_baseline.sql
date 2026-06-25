-- S2 RLS baseline: REPO-HISTORY RECORD ONLY.
--
-- These policies were applied directly in the Supabase SQL editor and are
-- already live on production. DO NOT run this file against the production
-- database — the policies are already correct and running this would cause
-- an unnecessary (even if brief) policy-drop window.
--
-- Purpose of this file: record the exact live policy definitions in the
-- migration history so a fresh-DB setup (e.g. staging, CI, local dev)
-- gets the correct policies automatically.
--
-- Safety guarantee: each block is wrapped in a DO $$ BEGIN ... END $$ guard
-- that checks pg_policies first. If the policy already exists it is left
-- completely untouched — no DROP, no momentary gap.
--
-- Gap closed: old INSERT policy only checked auth.uid() = user_id.
-- An authenticated user who knew a target's active_challenge_id / task_id
-- could INSERT a fake check_in via PostgREST, bypassing tRPC ownership
-- guards. The tightened policies add an active_challenges ownership
-- sub-select to both INSERT and UPDATE.

-- INSERT: user must own the active_challenge referenced by the new row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'check_ins'
      AND policyname = 'Users can insert own check_ins'
  ) THEN
    -- Remove any legacy variant that may exist under the old name first
    DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;

    EXECUTE $policy$
      CREATE POLICY "Users can insert own check_ins"
        ON public.check_ins
        FOR INSERT
        WITH CHECK (
          auth.uid() = user_id
          AND EXISTS (
            SELECT 1
            FROM public.active_challenges ac
            WHERE ac.id = check_ins.active_challenge_id
              AND ac.user_id = auth.uid()
          )
        )
    $policy$;
  END IF;
END $$;

-- UPDATE: existing row must be owned, and active_challenge must still be owned
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'check_ins'
      AND policyname = 'Users can update own check_ins'
  ) THEN
    DROP POLICY IF EXISTS "Users can update own check-ins" ON public.check_ins;

    EXECUTE $policy$
      CREATE POLICY "Users can update own check_ins"
        ON public.check_ins
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (
          auth.uid() = user_id
          AND EXISTS (
            SELECT 1
            FROM public.active_challenges ac
            WHERE ac.id = check_ins.active_challenge_id
              AND ac.user_id = auth.uid()
          )
        )
    $policy$;
  END IF;
END $$;

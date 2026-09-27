-- Ensure only ONE unique on (user_id, challenge_id): partial, status = 'active'.
-- A finished or left row must not block start-again.
-- Write only — do not apply in this session.
--
-- Repo already created:
--   20250306010000 active_challenges_one_active_per_user_challenge WHERE status = 'active'
--   20260621000000 active_challenges_user_challenge_active_idx WHERE status = 'active'
-- Prod may also have an unrestricted UNIQUE(user_id, challenge_id) from a dashboard edit.

BEGIN;

DROP INDEX IF EXISTS public.active_challenges_user_id_challenge_id_key;
DROP INDEX IF EXISTS public.active_challenges_user_challenge_key;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'active_challenges'
      AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) ILIKE '%user_id%challenge_id%'
      AND pg_get_constraintdef(c.oid) NOT ILIKE '%WHERE%'
  LOOP
    EXECUTE format('ALTER TABLE public.active_challenges DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS active_challenges_one_active_per_user_challenge
  ON public.active_challenges (user_id, challenge_id)
  WHERE status = 'active';

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verification (run after apply; not part of the migration)
--
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'active_challenges'
-- ORDER BY indexname;
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.active_challenges'::regclass AND contype = 'u';

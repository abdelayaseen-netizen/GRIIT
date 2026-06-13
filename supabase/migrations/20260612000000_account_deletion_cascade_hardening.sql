-- Account deletion cascade hardening.
-- Apple Guideline 5.1.1(v): deleting an account must remove ALL of the user's data.
--
-- Phase 0 audit (docs in PR description) found gaps that this migration closes:
--
--   1. active_challenges, streaks, respects are NOT defined in any tracked
--      migration (they live in the base/production schema). Their FK on-delete
--      behaviour cannot be verified from the repo, so we (re)assert
--      ON DELETE CASCADE on the owner columns. Idempotent: any existing FK on the
--      column (whatever its name) is dropped first, then re-added with CASCADE.
--
--   2. challenge_reports.reviewed_by REFERENCES auth.users(id) with the default
--      NO ACTION. Deleting a user who had reviewed a report is BLOCKED by that FK.
--      We change it to ON DELETE SET NULL so deletion is never blocked. reviewed_by
--      is an admin back-reference, not the deleting user's own data, so SET NULL
--      (not CASCADE) is correct: it preserves the moderation record and only clears
--      the reviewer pointer.
--
-- Intentionally left as ON DELETE SET NULL (reference columns to OTHER users, not
-- the deleting user's owned rows; already non-blocking, so no change needed):
--   invite_tracking.referred_user_id, team_invites.invited_user_id,
--   in_app_notifications.actor_id, challenges.creator_id.
--
-- Safe to re-run. Guarded with to_regclass() / column-existence checks so it
-- no-ops on any environment where a table or column is absent.

-- 1. Owner columns on untracked tables: force ON DELETE CASCADE.
DO $$
DECLARE
  targets CONSTANT text[][] := ARRAY[
    ARRAY['active_challenges', 'user_id',      'auth', 'users', 'id'],
    ARRAY['streaks',           'user_id',      'auth', 'users', 'id'],
    ARRAY['respects',          'actor_id',     'auth', 'users', 'id'],
    ARRAY['respects',          'recipient_id', 'auth', 'users', 'id']
  ];
  t text[];
  rec RECORD;
  col_attnum smallint;
BEGIN
  FOREACH t SLICE 1 IN ARRAY targets LOOP
    -- Skip if the table does not exist in this environment.
    IF to_regclass('public.' || t[1]) IS NULL THEN
      CONTINUE;
    END IF;

    -- Skip if the column does not exist.
    SELECT a.attnum INTO col_attnum
    FROM pg_attribute a
    WHERE a.attrelid = ('public.' || t[1])::regclass
      AND a.attname = t[2]
      AND NOT a.attisdropped;
    IF col_attnum IS NULL THEN
      CONTINUE;
    END IF;

    -- Drop every existing single-column FK on this column, whatever it is named.
    FOR rec IN
      SELECT con.conname
      FROM pg_constraint con
      WHERE con.contype = 'f'
        AND con.conrelid = ('public.' || t[1])::regclass
        AND con.conkey = ARRAY[col_attnum]::smallint[]
    LOOP
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', t[1], rec.conname);
    END LOOP;

    -- Re-add with ON DELETE CASCADE.
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I (%I) ON DELETE CASCADE',
      t[1], t[1] || '_' || t[2] || '_fkey', t[2], t[3], t[4], t[5]
    );
  END LOOP;
END $$;

-- 2. challenge_reports.reviewed_by: NO ACTION -> SET NULL (unblock deletion, keep report).
DO $$
BEGIN
  IF to_regclass('public.challenge_reports') IS NOT NULL THEN
    ALTER TABLE public.challenge_reports DROP CONSTRAINT IF EXISTS challenge_reports_reviewed_by_fkey;
    ALTER TABLE public.challenge_reports
      ADD CONSTRAINT challenge_reports_reviewed_by_fkey
      FOREIGN KEY (reviewed_by) REFERENCES auth.users (id) ON DELETE SET NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

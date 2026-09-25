-- Chunk U: activity_events.share_state (unanswered | shared | kept)
-- and active_challenges.board_opt_in. Not applied this session.
-- Keep activity_events.shared in sync for build-61 clients (R2).

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_share_state') THEN
    CREATE TYPE public.activity_share_state AS ENUM ('unanswered', 'shared', 'kept');
  END IF;
END $$;

ALTER TABLE public.activity_events
  ADD COLUMN IF NOT EXISTS share_state public.activity_share_state;

-- Backfill: shared=true → shared, false → kept. Unanswered is write-time only.
UPDATE public.activity_events
  SET share_state = CASE
    WHEN shared IS TRUE THEN 'shared'::public.activity_share_state
    ELSE 'kept'::public.activity_share_state
  END
  WHERE share_state IS NULL;

ALTER TABLE public.activity_events
  ALTER COLUMN share_state SET DEFAULT 'shared';

ALTER TABLE public.activity_events
  ALTER COLUMN share_state SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_activity_event_shared()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.shared := (NEW.share_state = 'shared');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_activity_event_shared ON public.activity_events;
CREATE TRIGGER trg_sync_activity_event_shared
  BEFORE INSERT OR UPDATE OF share_state
  ON public.activity_events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_activity_event_shared();

COMMENT ON COLUMN public.activity_events.share_state IS
  'Chunk U three-valued share: unanswered | shared | kept. Boolean shared stays in sync for build-61.';

ALTER TABLE public.active_challenges
  ADD COLUMN IF NOT EXISTS board_opt_in boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.active_challenges.board_opt_in IS
  'Chunk U per-challenge board. Default false; opt-in only.';

NOTIFY pgrst, 'reload schema';

COMMIT;

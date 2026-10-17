-- Build 83: a new activity row is private until an explicit share tap.
-- Does not rewrite existing rows. The backfill is printed for a person to run.

ALTER TABLE public.activity_events
  ALTER COLUMN share_state SET DEFAULT 'unanswered';

NOTIFY pgrst, 'reload schema';

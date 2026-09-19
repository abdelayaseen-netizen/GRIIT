-- Chunk Q A1. activity_events holds task_completed (and secured_day, etc.).
-- shared: feed visibility. DEFAULT true so omitted writes stay public (R2 old clients).
-- shared_at: stamped only when a row flips to shared.
--
-- Writer (R6): no user UPDATE policy. The share flip is service-role after an
-- ownership check (A2 mutation). INSERT still uses the existing own-row JWT
-- policy; column default true applies when the write omits shared.

ALTER TABLE public.activity_events
  ADD COLUMN IF NOT EXISTS shared boolean NOT NULL DEFAULT true;

ALTER TABLE public.activity_events
  ADD COLUMN IF NOT EXISTS shared_at timestamptz;

UPDATE public.activity_events
  SET shared = true
  WHERE shared IS DISTINCT FROM true;

COMMENT ON COLUMN public.activity_events.shared IS
  'Feed visibility. Default true. Flip is service-role after ownership check; no user UPDATE policy.';

COMMENT ON COLUMN public.activity_events.shared_at IS
  'Set by service-role when shared flips to true. Null on historical backfill.';

NOTIFY pgrst, 'reload schema';

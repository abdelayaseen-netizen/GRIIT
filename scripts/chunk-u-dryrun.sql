-- Chunk U dry run. SELECT only. Do not apply 20260923120000_chunk_u_share_state.sql with this file.

-- 1. shared histogram. Backfill maps true → shared, false → kept.
SELECT shared, count(*)
FROM public.activity_events
GROUP BY 1
ORDER BY 1;

-- 2. Proposed share_state after backfill (character-identical CASE to the migration).
SELECT
  CASE
    WHEN shared IS TRUE THEN 'shared'
    ELSE 'kept'
  END AS proposed_share_state,
  count(*)
FROM public.activity_events
GROUP BY 1
ORDER BY 1;

-- 3. Rows that would disagree after a later write if shared and share_state drift.
SELECT count(*) AS would_need_sync
FROM public.activity_events
WHERE (shared IS TRUE AND false) OR (shared IS NOT TRUE AND false);

-- 4. board_opt_in default: every existing enrollment would be false.
SELECT count(*) AS enrollments_that_would_default_false
FROM public.active_challenges;

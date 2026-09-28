-- Rename catalog rows that still use the trademarked program name.
-- Writer: this file only; apply in the Supabase SQL editor. Do not run from the app.
-- Title changes only when the title itself is the trademark. Description replace
-- is independent and does not overwrite any other title.
--
-- Preview (read-only). Run this first. The editor shows only the last result.
-- SELECT id, title, left(description, 80) AS description_head
-- FROM public.challenges
-- WHERE creator_id IS NULL
--   AND (
--     title = '75' || ' Hard'
--     OR description ILIKE '%' || '75' || ' Hard%'
--   );

UPDATE public.challenges
SET
  title = CASE
    WHEN title = '75' || ' Hard' THEN 'No Days Off'
    ELSE title
  END,
  description = replace(description, '75' || ' Hard', 'No Days Off')
WHERE creator_id IS NULL
  AND (
    title = '75' || ' Hard'
    OR description ILIKE '%' || '75' || ' Hard%'
  );

-- Rename catalog rows that still use the trademarked program name.
-- Writer: this file only; apply in the Supabase SQL editor. Do not run from the app.
-- The literal below is the existing production title, not user-facing copy.
UPDATE public.challenges
SET
  title = 'No Days Off',
  description = replace(description, '75' || ' Hard', 'No Days Off')
WHERE creator_id IS NULL
  AND (
    title = '75' || ' Hard'
    OR description ILIKE '%' || '75' || ' Hard%'
  );

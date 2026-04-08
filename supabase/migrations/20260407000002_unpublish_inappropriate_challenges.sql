-- Unpublish user-created challenges matching obvious abuse patterns; dedupe duplicate titles per creator.

UPDATE public.challenges
SET status = 'rejected', visibility = 'PRIVATE'
WHERE (
  LOWER(title) LIKE '%hater%'
  OR LOWER(title) LIKE '%hate %'
  OR LOWER(title) LIKE '%bully%'
  OR LOWER(title) LIKE '%nude%'
  OR LOWER(title) LIKE '%naked%'
  OR LOWER(title) LIKE '%strip%'
  OR LOWER(title) LIKE '%nsfw%'
)
AND creator_id IS NOT NULL;

WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY creator_id, LOWER(title) ORDER BY created_at DESC) AS rn
  FROM public.challenges
  WHERE creator_id IS NOT NULL
    AND status = 'published'
)
UPDATE public.challenges
SET status = 'archived'
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

NOTIFY pgrst, 'reload schema';

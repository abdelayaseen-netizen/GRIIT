-- Align require_photo column with JSON config when only config had photo flags (e.g. hard difficulty).
UPDATE challenge_tasks
SET require_photo = true
WHERE require_photo IS NOT true
  AND (
    (config->>'photo_required')::boolean = true
    OR (config->>'require_photo_proof')::boolean = true
  );

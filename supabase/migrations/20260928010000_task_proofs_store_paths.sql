-- Rewrite stored task-proofs public/signed URLs to object paths.
-- Wait for build 66, then apply this, then flip the bucket.
-- Preview first: docs/sql-drafts/20260928010000_task_proofs_store_paths_preview.sql
-- Writer: this file, applied by hand. No user UPDATE policy.

BEGIN;

UPDATE public.check_ins
SET photo_url = regexp_replace(
  regexp_replace(photo_url, '\?.*$', ''),
  '^.*\/storage\/v1\/object\/(public|sign)\/task-proofs\/',
  ''
)
WHERE photo_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

UPDATE public.check_ins
SET proof_url = regexp_replace(
  regexp_replace(proof_url, '\?.*$', ''),
  '^.*\/storage\/v1\/object\/(public|sign)\/task-proofs\/',
  ''
)
WHERE proof_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

UPDATE public.check_ins
SET completion_image_url = regexp_replace(
  regexp_replace(completion_image_url, '\?.*$', ''),
  '^.*\/storage\/v1\/object\/(public|sign)\/task-proofs\/',
  ''
)
WHERE completion_image_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

UPDATE public.activity_events
SET metadata = jsonb_set(
  metadata,
  '{photo_url}',
  to_jsonb(
    regexp_replace(
      regexp_replace(metadata->>'photo_url', '\?.*$', ''),
      '^.*\/storage\/v1\/object\/(public|sign)\/task-proofs\/',
      ''
    )
  )
)
WHERE metadata ? 'photo_url'
  AND metadata->>'photo_url' ~ '/storage/v1/object/(public|sign)/task-proofs/';

UPDATE public.activity_events
SET metadata = jsonb_set(
  metadata,
  '{proof_photo_url}',
  to_jsonb(
    regexp_replace(
      regexp_replace(metadata->>'proof_photo_url', '\?.*$', ''),
      '^.*\/storage\/v1\/object\/(public|sign)\/task-proofs\/',
      ''
    )
  )
)
WHERE metadata ? 'proof_photo_url'
  AND metadata->>'proof_photo_url' ~ '/storage/v1/object/(public|sign)/task-proofs/';

COMMIT;

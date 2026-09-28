-- Preview only. One statement per block. Do not run the UPDATE migration
-- (supabase/migrations/20260928010000_task_proofs_store_paths.sql) from this session.

SELECT count(*) AS photo_url_storage
FROM public.check_ins
WHERE photo_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

SELECT count(*) AS proof_url_storage
FROM public.check_ins
WHERE proof_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

SELECT count(*) AS completion_image_url_storage
FROM public.check_ins
WHERE completion_image_url ~ '/storage/v1/object/(public|sign)/task-proofs/';

SELECT count(*) AS metadata_photo_url_storage
FROM public.activity_events
WHERE metadata ? 'photo_url'
  AND metadata->>'photo_url' ~ '/storage/v1/object/(public|sign)/task-proofs/';

SELECT count(*) AS metadata_proof_photo_url_storage
FROM public.activity_events
WHERE metadata ? 'proof_photo_url'
  AND metadata->>'proof_photo_url' ~ '/storage/v1/object/(public|sign)/task-proofs/';

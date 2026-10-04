-- DRAFT. DO NOT APPLY.
-- v44 featured catalog. creator_id NULL, published, PUBLIC.
-- Preview first. The INSERT is the seed an operator would run later.

SELECT id, title, duration_days, category, status, visibility, creator_id, participants_count
FROM public.challenges
WHERE id IN (
  'e44f0001-4000-4000-8000-000000000001',
  'e44f0001-4000-4000-8000-000000000002',
  'e44f0001-4000-4000-8000-000000000003',
  'e44f0001-4000-4000-8000-000000000004',
  'e44f0001-4000-4000-8000-000000000005',
  'e44f0001-4000-4000-8000-000000000006',
  'e44f0001-4000-4000-8000-000000000007',
  'e44f0001-4000-4000-8000-000000000008'
);

-- INSERT INTO public.challenges (
--   id, creator_id, title, description, duration_days, visibility, difficulty,
--   category, status, is_featured, participants_count, is_hard_mode
-- ) VALUES
--   ('e44f0001-4000-4000-8000-000000000001', NULL, 'Show Up 7', 'Go to the gym.', 7, 'PUBLIC', 'easy', 'fitness', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000002', NULL, '7K Steps', '7,000 steps.', 7, 'PUBLIC', 'easy', 'health', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000003', NULL, 'Early Riser 7', 'Out of bed photo.', 7, 'PUBLIC', 'easy', 'discipline', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000004', NULL, 'Fajr Before Sunrise', 'Pray Fajr.', 7, 'PUBLIC', 'easy', 'faith', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000005', NULL, '3 Good Things', 'Write 3 gratitudes.', 7, 'PUBLIC', 'easy', 'mind', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000006', NULL, '10 Pages a Day', 'Read 10 pages.', 14, 'PUBLIC', 'easy', 'learning', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000007', NULL, 'Quran Daily', 'Read Quran.', 30, 'PUBLIC', 'easy', 'faith', 'published', true, 0, false),
--   ('e44f0001-4000-4000-8000-000000000008', NULL, '30-Second Cold Finish', 'Cold shower, 30 seconds.', 14, 'PUBLIC', 'easy', 'discipline', 'published', true, 0, false);
--
-- INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, require_photo, config)
-- SELECT v.challenge_id, v.title, v.task_type, 0, v.require_photo, v.config
-- FROM (VALUES
--   ('e44f0001-4000-4000-8000-000000000001'::uuid, 'Go to the gym', 'checkin', true, '{"required":true,"photo_mode":"required","require_photo_proof":true,"require_photo":true,"require_location":true,"gates":["camera","place"]}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000002'::uuid, '7,000 steps', 'counter', false, '{"required":true,"photo_mode":"none","require_photo":false,"target_value":7000}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000003'::uuid, 'Out of bed photo', 'photo', true, '{"required":true,"photo_mode":"required","require_photo_proof":true,"require_photo":true,"require_camera_only":true,"gateTime":{"mode":"by","start":"06:30","end":null}}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000004'::uuid, 'Pray Fajr', 'checkin', false, '{"required":true,"photo_mode":"optional","require_photo":false,"gateTime":{"mode":"by","start":"07:00","end":null}}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000005'::uuid, 'Write 3 gratitudes', 'journal', false, '{"required":true,"photo_mode":"none","require_photo":false,"min_words":3}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000006'::uuid, 'Read 10 pages', 'reading', false, '{"required":true,"photo_mode":"none","require_photo":false,"target_pages":10}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000007'::uuid, 'Read Quran', 'reading', false, '{"required":true,"photo_mode":"none","require_photo":false}'::jsonb),
--   ('e44f0001-4000-4000-8000-000000000008'::uuid, 'Cold shower, 30 seconds', 'photo', true, '{"required":true,"photo_mode":"required","require_photo_proof":true,"require_photo":true,"require_camera_only":true}'::jsonb)
-- ) AS v(challenge_id, title, task_type, require_photo, config)
-- WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id);

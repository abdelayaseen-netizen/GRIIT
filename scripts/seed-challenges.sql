-- Seed challenges for Discover page (featured + starter pack).
-- Run in Supabase SQL Editor. Safe to re-run (ON CONFLICT DO NOTHING / WHERE NOT EXISTS).
-- Ensures: getFeatured returns rows (visibility=PUBLIC, status=published), getStarterPack returns rows (source_starter_id set).

-- Ensure columns exist
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'multi_day';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS source_starter_id TEXT;

-- ========== FEATURED CHALLENGES (show in Discover "Featured" / "More") ==========
INSERT INTO public.challenges (
  id,
  creator_id,
  title,
  description,
  duration_days,
  duration_type,
  visibility,
  difficulty,
  category,
  status,
  is_featured,
  participants_count,
  metadata
) VALUES
  ('a1000001-4000-4000-8000-000000000001', NULL, '75 Day Hard', '75 days. No excuses. Most people quit.', 75, 'multi_day', 'PUBLIC', 'extreme', 'Fitness', 'published', true, 0, '{"short_hook": "75 days. No excuses.", "theme_color": "#E8613C"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000002', NULL, '30 Day Mindful', '30 days to build a calmer mind.', 30, 'multi_day', 'PUBLIC', 'medium', 'Mind', 'published', true, 0, '{"short_hook": "Build a calmer mind.", "theme_color": "#8B5CF6"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003', NULL, 'Morning Warrior', 'Win the morning. Win the day.', 21, 'multi_day', 'PUBLIC', 'medium', 'Discipline', 'published', true, 0, '{"short_hook": "Win the morning.", "theme_color": "#F59E0B"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004', NULL, 'Read 30 Pages', 'Feed your mind daily.', 21, 'multi_day', 'PUBLIC', 'medium', 'Mind', 'published', true, 0, '{"short_hook": "Feed your mind daily.", "theme_color": "#10B981"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000005', NULL, '5K Training', 'From zero to 5K in 30 days.', 30, 'multi_day', 'PUBLIC', 'medium', 'Fitness', 'published', true, 0, '{"short_hook": "Zero to 5K in 30 days.", "theme_color": "#0EA5E9"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000006', NULL, 'Daily Gratitude', 'Gratitude changes everything.', 14, 'multi_day', 'PUBLIC', 'easy', 'Mind', 'published', true, 0, '{"short_hook": "Gratitude changes everything.", "theme_color": "#EC4899"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000007', NULL, 'Cold Shower Challenge', 'Embrace the cold. Build the mind.', 30, 'multi_day', 'PUBLIC', 'medium', 'Discipline', 'published', true, 0, '{"short_hook": "Embrace the cold.", "theme_color": "#0EA5E9"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000008', NULL, 'No Phone Before 9 AM', 'Reclaim your mornings.', 14, 'multi_day', 'PUBLIC', 'easy', 'Discipline', 'published', true, 0, '{"short_hook": "Reclaim your mornings.", "theme_color": "#10B981"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tasks for featured challenges (at least 2 per challenge)
INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config
FROM (VALUES
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Complete a workout', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Read 10 pages', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Drink a gallon of water', 'manual', 2, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000002'::uuid, 'Meditate 5 minutes', 'timer', 0, '{"required": true, "duration_minutes": 5}'::jsonb),
  ('a1000001-4000-4000-8000-000000000002'::uuid, 'Journal 3 things', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003'::uuid, 'Wake before 6am', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003'::uuid, '10 min movement', 'timer', 1, '{"required": true, "duration_minutes": 10}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004'::uuid, 'Read 30 pages', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004'::uuid, 'Log what you read', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000005'::uuid, 'Run or walk', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000005'::uuid, 'Stretch 5 min', 'timer', 1, '{"required": true, "duration_minutes": 5}'::jsonb),
  ('a1000001-4000-4000-8000-000000000006'::uuid, 'Write 3 gratitudes', 'journal', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000006'::uuid, 'Share one with someone', 'manual', 1, '{"required": false}'::jsonb),
  ('a1000001-4000-4000-8000-000000000007'::uuid, 'Cold shower 2+ minutes', 'timer', 0, '{"required": true, "duration_minutes": 2}'::jsonb),
  ('a1000001-4000-4000-8000-000000000007'::uuid, 'Log it', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000008'::uuid, 'No phone until 9am', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000008'::uuid, 'Morning activity instead', 'manual', 1, '{"required": true}'::jsonb)
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id);

-- ========== STARTER PACK (getStarterPack: source_starter_id required) ==========
INSERT INTO public.challenges (
  id,
  creator_id,
  title,
  description,
  duration_days,
  duration_type,
  visibility,
  difficulty,
  category,
  status,
  is_featured,
  participants_count,
  source_starter_id,
  metadata
) VALUES
  ('b2000001-4000-4000-8000-000000000001', NULL, 'Drink Water Today', 'Drink water and post a photo.', 1, 'multi_day', 'PUBLIC', 'easy', 'Fitness', 'published', false, 0, 'onboard-water', '{}'::jsonb),
  ('b2000001-4000-4000-8000-000000000002', NULL, 'Quick Steps', 'Get moving. Log your steps.', 1, 'multi_day', 'PUBLIC', 'easy', 'Fitness', 'published', false, 0, 'onboard-steps', '{}'::jsonb),
  ('b2000001-4000-4000-8000-000000000003', NULL, 'Read Something', 'Read a few pages today.', 1, 'multi_day', 'PUBLIC', 'easy', 'Mind', 'published', false, 0, 'onboard-read', '{}'::jsonb),
  ('b2000001-4000-4000-8000-000000000004', NULL, 'Journal Today', 'Write a short journal entry.', 1, 'multi_day', 'PUBLIC', 'easy', 'Mind', 'published', false, 0, 'onboard-journal', '{}'::jsonb),
  ('b2000001-4000-4000-8000-000000000005', NULL, 'Breathe 1 Min', 'One minute of focused breathing.', 1, 'multi_day', 'PUBLIC', 'easy', 'Mind', 'published', false, 0, 'onboard-breath', '{}'::jsonb),
  ('b2000001-4000-4000-8000-000000000006', NULL, 'Consistent Bedtime', 'Hit your bedtime window.', 1, 'multi_day', 'PUBLIC', 'easy', 'Discipline', 'published', false, 0, 'onboard-bed', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config
FROM (VALUES
  ('b2000001-4000-4000-8000-000000000001'::uuid, 'Drink water and post a photo', 'photo', 0, '{"required": true}'::jsonb),
  ('b2000001-4000-4000-8000-000000000002'::uuid, 'Log your steps', 'manual', 0, '{"required": true}'::jsonb),
  ('b2000001-4000-4000-8000-000000000003'::uuid, 'Read and log pages', 'manual', 0, '{"required": true}'::jsonb),
  ('b2000001-4000-4000-8000-000000000004'::uuid, 'Write a short journal entry', 'journal', 0, '{"required": true}'::jsonb),
  ('b2000001-4000-4000-8000-000000000005'::uuid, 'Breathe 1 minute', 'timer', 0, '{"required": true, "duration_minutes": 1}'::jsonb),
  ('b2000001-4000-4000-8000-000000000006'::uuid, 'Hit your bedtime', 'manual', 0, '{"required": true}'::jsonb)
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id);

NOTIFY pgrst, 'reload schema';

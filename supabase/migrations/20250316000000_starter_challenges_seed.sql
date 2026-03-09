-- Seed 5 starter challenges for Discover page.
-- Run in Supabase SQL Editor. Safe to re-run (ON CONFLICT DO NOTHING).
-- Visibility "everyone" = public. These show on Discover when status = published and visibility = public.

-- Ensure duration_type exists (some DBs have it from backend create flow)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'multi_day';

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
  ('a1000001-4000-4000-8000-000000000001', NULL, '75 Hard', 'The ultimate mental toughness challenge. Follow the 75 Hard program daily.', 75, 'multi_day', 'PUBLIC', 'extreme', 'fitness', 'published', true, 0, '{"short_hook": "The ultimate mental toughness challenge.", "theme_color": "#E8613C"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000002', NULL, '30 Day Cold Shower', 'Build mental resilience with daily cold showers.', 30, 'multi_day', 'PUBLIC', 'medium', 'discipline', 'published', true, 0, '{"short_hook": "Build mental resilience with daily cold showers.", "theme_color": "#0EA5E9"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003', NULL, 'Morning Routine Challenge', 'Build a powerful morning routine. Wake up early, journal, and move your body.', 21, 'multi_day', 'PUBLIC', 'medium', 'mind', 'published', true, 0, '{"short_hook": "Build a powerful morning routine.", "theme_color": "#8B5CF6"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004', NULL, 'No Phone Before 9am', 'Break the scroll habit. No phone for the first hour after waking.', 14, 'multi_day', 'PUBLIC', 'easy', 'discipline', 'published', true, 0, '{"short_hook": "Break the scroll habit.", "theme_color": "#10B981"}'::jsonb),
  ('a1000001-4000-4000-8000-000000000005', NULL, 'Read Every Day', 'Read at least 20 pages every single day. Build the reading habit.', 30, 'multi_day', 'PUBLIC', 'medium', 'mind', 'published', true, 0, '{"short_hook": "Build the reading habit.", "theme_color": "#F59E0B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tasks: use challenge_tasks (challenge_id, title, task_type, order_index, config)
INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config
FROM (VALUES
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Complete a workout', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Read 10 pages', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Drink a gallon of water', 'manual', 2, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Follow a diet', 'manual', 3, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000001'::uuid, 'Take a progress photo', 'manual', 4, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000002'::uuid, 'Take a cold shower for at least 2 minutes', 'timer', 0, '{"required": true, "duration_minutes": 2}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003'::uuid, 'Wake up before 6am', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003'::uuid, 'Journal for 10 minutes', 'timer', 1, '{"required": true, "duration_minutes": 10}'::jsonb),
  ('a1000001-4000-4000-8000-000000000003'::uuid, '10 minutes of movement', 'timer', 2, '{"required": true, "duration_minutes": 10}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004'::uuid, 'No phone until 9am', 'manual', 0, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000004'::uuid, 'Do a morning activity instead', 'manual', 1, '{"required": true}'::jsonb),
  ('a1000001-4000-4000-8000-000000000005'::uuid, 'Read 20 pages', 'manual', 0, '{"required": true}'::jsonb)
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id);

NOTIFY pgrst, 'reload schema';

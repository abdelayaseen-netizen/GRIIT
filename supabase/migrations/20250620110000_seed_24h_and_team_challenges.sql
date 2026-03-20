-- Seed 24-hour (duration_type 24h, duration_days 1) and team/duo challenges for Discover.
-- ON CONFLICT DO NOTHING so safe to re-run.

-- 24-hour challenges (8)
INSERT INTO public.challenges (
  id, creator_id, title, description, duration_days, duration_type,
  visibility, difficulty, category, status, is_featured, participants_count,
  metadata, participation_type, team_size, run_status
) VALUES
  ('a1111111-0001-4000-8000-000000000001', NULL, 'No Social Media', 'Stay off all social media for 24 hours.', 1, '24h', 'PUBLIC', 'easy', 'discipline', 'published', false, 0, '{"short_hook": "One day off the feed.", "theme_color": "#E8845F"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000002', NULL, '5AM Wake Up', 'Wake up at 5AM tomorrow.', 1, '24h', 'PUBLIC', 'medium', 'discipline', 'published', false, 0, '{"short_hook": "Own the morning.", "theme_color": "#F59E0B"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000003', NULL, '10K Steps', 'Hit 10,000 steps in one day.', 1, '24h', 'PUBLIC', 'medium', 'fitness', 'published', false, 0, '{"short_hook": "Move more today.", "theme_color": "#EF4444"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000004', NULL, 'Cold Shower Only', 'Only take cold showers today.', 1, '24h', 'PUBLIC', 'hard', 'fitness', 'published', false, 0, '{"short_hook": "Cold exposure discipline.", "theme_color": "#0EA5E9"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000005', NULL, 'No Complaining', 'Go 24 hours without a single complaint.', 1, '24h', 'PUBLIC', 'medium', 'mind', 'published', false, 0, '{"short_hook": "Reset your language.", "theme_color": "#7C6BC4"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000006', NULL, 'Digital Detox', 'No screens after 8PM tonight.', 1, '24h', 'PUBLIC', 'easy', 'discipline', 'published', false, 0, '{"short_hook": "Evening offline.", "theme_color": "#14B8A6"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000007', NULL, 'Gratitude Blitz', 'Write 10 things you''re grateful for today.', 1, '24h', 'PUBLIC', 'easy', 'mind', 'published', false, 0, '{"short_hook": "10 lines of gratitude.", "theme_color": "#8B5CF6"}'::jsonb, 'solo', 1, NULL),
  ('a1111111-0001-4000-8000-000000000008', NULL, 'Reading Marathon', 'Read for at least 2 hours today.', 1, '24h', 'PUBLIC', 'medium', 'mind', 'published', false, 0, '{"short_hook": "Deep reading day.", "theme_color": "#F59E0B"}'::jsonb, 'solo', 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Team / duo challenges (8)
INSERT INTO public.challenges (
  id, creator_id, title, description, duration_days, duration_type,
  visibility, difficulty, category, status, is_featured, participants_count,
  metadata, participation_type, team_size, run_status
) VALUES
  ('a2222222-0001-4000-8000-000000000001', NULL, 'Accountability Duo', 'Partner up. Check in daily.', 14, 'multi_day', 'PUBLIC', 'easy', 'discipline', 'published', false, 0, '{"short_hook": "Duo discipline.", "theme_color": "#10B981"}'::jsonb, 'duo', 2, 'waiting'),
  ('a2222222-0001-4000-8000-000000000002', NULL, 'Gym Buddy Challenge', 'Hit the gym together 5x this week.', 7, 'multi_day', 'PUBLIC', 'medium', 'fitness', 'published', false, 0, '{"short_hook": "Train together.", "theme_color": "#E8845F"}'::jsonb, 'duo', 2, 'waiting'),
  ('a2222222-0001-4000-8000-000000000003', NULL, 'Morning Crew', 'Wake up at 6AM as a squad.', 21, 'multi_day', 'PUBLIC', 'medium', 'discipline', 'published', false, 0, '{"short_hook": "Squad mornings.", "theme_color": "#F59E0B"}'::jsonb, 'team', 4, 'waiting'),
  ('a2222222-0001-4000-8000-000000000004', NULL, 'Study Group Sprint', '2 hours focused study daily.', 14, 'multi_day', 'PUBLIC', 'medium', 'mind', 'published', false, 0, '{"short_hook": "Learn together.", "theme_color": "#2563EB"}'::jsonb, 'team', 4, 'waiting'),
  ('a2222222-0001-4000-8000-000000000005', NULL, 'Fitness Squad', 'Complete daily workout as a team.', 30, 'multi_day', 'PUBLIC', 'hard', 'fitness', 'published', false, 0, '{"short_hook": "Team training.", "theme_color": "#DC2626"}'::jsonb, 'team', 4, 'waiting'),
  ('a2222222-0001-4000-8000-000000000006', NULL, 'No Junk Food Pact', 'Clean eating with your crew.', 14, 'multi_day', 'PUBLIC', 'medium', 'fitness', 'published', false, 0, '{"short_hook": "Eat clean together.", "theme_color": "#3D7A5A"}'::jsonb, 'team', 4, 'waiting'),
  ('a2222222-0001-4000-8000-000000000007', NULL, 'Prayer Group', 'Pray together daily.', 30, 'multi_day', 'PUBLIC', 'easy', 'faith', 'published', false, 0, '{"short_hook": "Faith together.", "theme_color": "#7C6BC4"}'::jsonb, 'team', 3, 'waiting'),
  ('a2222222-0001-4000-8000-000000000008', NULL, 'Run Club', 'Run at least 1 mile daily as a group.', 21, 'multi_day', 'PUBLIC', 'hard', 'fitness', 'published', false, 0, '{"short_hook": "Miles together.", "theme_color": "#0EA5E9"}'::jsonb, 'team', 4, 'waiting')
ON CONFLICT (id) DO NOTHING;

-- challenge_tasks for 24h challenges
INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config::jsonb
FROM (VALUES
  ('a1111111-0001-4000-8000-000000000001'::uuid, 'Check in morning', 'manual', 0, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000001'::uuid, 'Check in evening', 'manual', 1, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000002'::uuid, 'Set alarm tonight', 'manual', 0, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000002'::uuid, 'Post proof at 5AM', 'photo', 1, '{"required": true, "require_photo_proof": true}'),
  ('a1111111-0001-4000-8000-000000000003'::uuid, 'Log midday progress', 'manual', 0, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000003'::uuid, 'Post final step count', 'manual', 1, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000004'::uuid, 'Morning cold shower proof', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a1111111-0001-4000-8000-000000000004'::uuid, 'Evening cold shower proof', 'photo', 1, '{"required": true, "require_photo_proof": true}'),
  ('a1111111-0001-4000-8000-000000000005'::uuid, 'Midday check-in', 'journal', 0, '{"required": true, "min_words": 20}'),
  ('a1111111-0001-4000-8000-000000000005'::uuid, 'End of day reflection', 'journal', 1, '{"required": true, "min_words": 20}'),
  ('a1111111-0001-4000-8000-000000000006'::uuid, 'Put phone away proof', 'manual', 0, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000006'::uuid, 'Morning reflection', 'journal', 1, '{"required": true, "min_words": 15}'),
  ('a1111111-0001-4000-8000-000000000007'::uuid, 'Write list of 10', 'journal', 0, '{"required": true, "min_words": 20}'),
  ('a1111111-0001-4000-8000-000000000007'::uuid, 'Share one with someone', 'manual', 1, '{"required": true}'),
  ('a1111111-0001-4000-8000-000000000008'::uuid, '1 hour check-in', 'timer', 0, '{"required": true, "duration_minutes": 60}'),
  ('a1111111-0001-4000-8000-000000000008'::uuid, '2 hour completion proof', 'manual', 1, '{"required": true}')
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id AND ct.title = v.title);

-- challenge_tasks for team challenges
INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config::jsonb
FROM (VALUES
  ('a2222222-0001-4000-8000-000000000001'::uuid, 'Morning check-in with partner', 'manual', 0, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000001'::uuid, 'Evening accountability report', 'journal', 1, '{"required": true, "min_words": 15}'),
  ('a2222222-0001-4000-8000-000000000002'::uuid, 'Post gym selfie', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a2222222-0001-4000-8000-000000000002'::uuid, 'Log workout', 'manual', 1, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000003'::uuid, 'Post proof at 6AM', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a2222222-0001-4000-8000-000000000003'::uuid, 'Motivate your team', 'manual', 1, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000004'::uuid, 'Log study session', 'timer', 0, '{"required": true, "duration_minutes": 120}'),
  ('a2222222-0001-4000-8000-000000000004'::uuid, 'Share what you learned', 'journal', 1, '{"required": true, "min_words": 20}'),
  ('a2222222-0001-4000-8000-000000000005'::uuid, 'Post workout proof', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a2222222-0001-4000-8000-000000000005'::uuid, 'Rate your energy', 'manual', 1, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000006'::uuid, 'Post meal photo', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a2222222-0001-4000-8000-000000000006'::uuid, 'Evening clean eating check', 'manual', 1, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000007'::uuid, 'Morning prayer check-in', 'manual', 0, '{"required": true}'),
  ('a2222222-0001-4000-8000-000000000007'::uuid, 'Share reflection', 'journal', 1, '{"required": true, "min_words": 15}'),
  ('a2222222-0001-4000-8000-000000000008'::uuid, 'Post run screenshot or photo', 'photo', 0, '{"required": true, "require_photo_proof": true}'),
  ('a2222222-0001-4000-8000-000000000008'::uuid, 'Log distance', 'manual', 1, '{"required": true}')
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id AND ct.title = v.title);

NOTIFY pgrst, 'reload schema';

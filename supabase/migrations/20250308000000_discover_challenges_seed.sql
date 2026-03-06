-- Seed at least 10 discover/featured challenges for first-time users.
-- Safe to run: uses ON CONFLICT (id) DO NOTHING so re-run won't duplicate.
-- Schema: public.challenges (id, created_at, creator_id, title, description, duration_days, visibility, difficulty, metadata, category, status, is_featured, participants_count)

INSERT INTO public.challenges (
  id,
  creator_id,
  title,
  description,
  duration_days,
  visibility,
  difficulty,
  category,
  status,
  is_featured,
  participants_count,
  metadata
) VALUES
  ('d1000001-4000-4000-8000-000000000001', NULL, '5-Minute Morning Prayer', 'Start each day with 5 minutes of prayer or intention-setting.', 7, 'public', 'easy', 'mind', 'published', true, 1200, '{"short_hook": "Center yourself before the day begins.", "theme_color": "#6B8E7B"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000002', NULL, '7-Day Gratitude Journal', 'Write three things you''re grateful for every day.', 7, 'public', 'easy', 'mind', 'published', true, 890, '{"short_hook": "Gratitude rewires your brain.", "theme_color": "#9B8EC5"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000003', NULL, '10-Minute Daily Focus Block', 'One 10-minute block of deep work or study with no phone.', 14, 'public', 'medium', 'mind', 'published', true, 654, '{"short_hook": "One block. No distractions.", "theme_color": "#3B82F6"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000004', NULL, 'Make Your Bed Every Day', 'Make your bed within 10 minutes of waking for 14 days.', 14, 'public', 'easy', 'discipline', 'published', true, 1100, '{"short_hook": "Win the first win of the day.", "theme_color": "#F59E0B"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000005', NULL, '2-Week Hydration Check', 'Log 8 glasses of water (or your target) every day.', 14, 'public', 'easy', 'fitness', 'published', true, 760, '{"short_hook": "Your body runs on water.", "theme_color": "#0EA5E9"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000006', NULL, '21-Day Reflection Sentence', 'Write one sentence about your day every evening.', 21, 'public', 'easy', 'mind', 'published', true, 540, '{"short_hook": "One sentence. Every day.", "theme_color": "#8B5CF6"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000007', NULL, '7-Day Digital Sunset', 'No screens 60 minutes before bed.', 7, 'public', 'medium', 'mind', 'published', true, 430, '{"short_hook": "Sleep better. Wake sharper.", "theme_color": "#14B8A6"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000008', NULL, '14-Day 2-Minute Breath', 'One 2-minute breathing exercise daily.', 14, 'public', 'easy', 'mind', 'published', true, 920, '{"short_hook": "Calm your nervous system.", "theme_color": "#10B981"}'::jsonb),
  ('d1000001-4000-4000-8000-000000000009', NULL, '30-Day 10K Steps', 'Hit 10,000 steps (or your target) every day.', 30, 'public', 'medium', 'fitness', 'published', true, 680, '{"short_hook": "Move your body. Every day.", "theme_color": "#EF4444"}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000a', NULL, '21-Day Cold Shower', 'End your shower with 30+ seconds of cold water.', 21, 'public', 'hard', 'discipline', 'published', true, 410, '{"short_hook": "Build resilience. One shower at a time.", "theme_color": "#0EA5E9"}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000b', NULL, '14-Day One Compliment', 'Give one genuine compliment to someone (in person or message) each day.', 14, 'public', 'medium', 'mind', 'published', true, 320, '{"short_hook": "Courage and kindness.", "theme_color": "#EC4899"}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000c', NULL, '30-Day Read 20', 'Read for at least 20 minutes every day.', 30, 'public', 'medium', 'mind', 'published', true, 580, '{"short_hook": "A habit that compounds.", "theme_color": "#F59E0B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Tasks for each challenge. Schema: public.challenge_tasks (id, created_at, challenge_id, title, task_type, order_index, config)
-- Only insert if the challenge exists. Omit id and created_at so DB defaults apply.
INSERT INTO public.challenge_tasks (challenge_id, title, task_type, order_index, config)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.config
FROM (VALUES
  ('d1000001-4000-4000-8000-000000000001'::uuid, '5-minute prayer or intention', 'timer', 0, '{"required": true, "duration_minutes": 5}'::jsonb),
  ('d1000001-4000-4000-8000-000000000002'::uuid, 'Gratitude list (3 things)', 'journal', 0, '{"required": true, "min_words": 30}'::jsonb),
  ('d1000001-4000-4000-8000-000000000003'::uuid, '10-min focus block (no phone)', 'timer', 0, '{"required": true, "duration_minutes": 10}'::jsonb),
  ('d1000001-4000-4000-8000-000000000004'::uuid, 'Make your bed', 'manual', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-000000000005'::uuid, 'Log 8 glasses of water', 'manual', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-000000000006'::uuid, 'One-sentence daily reflection', 'journal', 0, '{"required": true, "min_words": 10}'::jsonb),
  ('d1000001-4000-4000-8000-000000000007'::uuid, 'No screens 60 min before bed', 'manual', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-000000000008'::uuid, '2-minute breathing exercise', 'timer', 0, '{"required": true, "duration_minutes": 2}'::jsonb),
  ('d1000001-4000-4000-8000-000000000009'::uuid, '10K steps (or your target)', 'run', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000a'::uuid, '30+ seconds cold at end of shower', 'manual', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000b'::uuid, 'Give one genuine compliment', 'manual', 0, '{"required": true}'::jsonb),
  ('d1000001-4000-4000-8000-00000000000c'::uuid, 'Read 20 minutes', 'timer', 0, '{"required": true, "duration_minutes": 20}'::jsonb)
) AS v(challenge_id, title, task_type, order_index, config)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id);

-- =============================================================================
-- COLUMN MAPPING SUMMARY
-- =============================================================================
-- public.challenges: (see above; unchanged)
--
-- public.challenge_tasks insert structure:
--   challenge_id  -> UUID of the parent challenge
--   title         -> task title
--   task_type     -> was "type": one of timer, journal, manual, run
--   order_index   -> 0 (one task per challenge in this seed)
--   config        -> jsonb with per-task options (see below)
--   id            -> omitted (DB default, e.g. gen_random_uuid())
--   created_at    -> omitted (DB default)
--
-- Old fields mapped into config:
--   required          -> config.required (boolean)
--   duration_minutes  -> config.duration_minutes (number, for timer/run)
--   min_words         -> config.min_words (number, for journal)
--   type              -> task_type (top-level column)
--
-- App code: Backend and frontend currently expect challenge_tasks to have columns
-- like type, required, duration_minutes, min_words. If the live DB uses only
-- task_type + config, the app must read task_type and config (e.g. config->>'required',
-- config->>'duration_minutes', config->>'min_words') or use a DB view that exposes
-- them. Check backend/trpc/routes/challenges.ts, checkins.ts, and frontend task
-- components for compatibility.

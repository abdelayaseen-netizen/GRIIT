-- Run AFTER applying migrations 20250329000000, 20250329000001, 20250329000002 in Supabase SQL Editor.
-- Use these to confirm schema and RLS.

-- 1. Confirm profile columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Confirm user_achievements table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_achievements';

-- 3. Confirm activity_events table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_events';

-- 4. Confirm RLS is on for new tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_achievements', 'activity_events');

-- 1) Profiles: ensure user_id is unique so it can be referenced by stories.
-- 2) Stories: add foreign key to profiles so PostgREST can resolve stories -> profiles (username, avatar_url).
-- 3) Challenges: add is_featured column.
-- Run in Supabase SQL Editor. If profiles.user_id has duplicate values, fix those before running.

-- =============================================
-- 1) Profiles: unique constraint on user_id (required for FK from stories)
-- =============================================
-- Backend expects profiles.user_id (profiles.ts: onConflict('user_id'), stories.ts: profiles (username, avatar_url) join).
-- If profiles.user_id is already the primary key, this index is redundant but harmless (IF NOT EXISTS).
-- If there are duplicate user_id values, fix them before running (e.g. keep one row per user_id).
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles(user_id);

-- =============================================
-- 2) Stories: FK from stories.user_id to profiles(user_id)
-- =============================================
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;

ALTER TABLE stories
  ADD CONSTRAINT stories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- =============================================
-- 3) Challenges: add is_featured column
-- =============================================
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';

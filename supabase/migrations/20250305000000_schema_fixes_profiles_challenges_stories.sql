-- Schema fixes: profiles (user_id, onboarding_completed), challenges (status), active_challenges (created_at), stories + story_views tables.
-- Run this in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- =============================================
-- 1) profiles: missing user_id and onboarding_completed
-- =============================================
-- If your profiles table was created with a different primary key (e.g. id), add user_id as the link to auth.users.
-- If profiles already has user_id as PK, these ADD COLUMN will no-op.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Optional: ensure there is a unique constraint on user_id so upsert onConflict('user_id') works.
-- If user_id is already the primary key, this will fail; run it only if you added user_id as a new column.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key' AND conrelid = 'profiles'::regclass
  ) AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles(user_id) WHERE user_id IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles user_id unique: %', SQLERRM;
END $$;

-- =============================================
-- 2) challenges: missing status column
-- =============================================
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
-- Constrain allowed values (optional; skip if you already have a check)
DO $$
BEGIN
  ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
  ALTER TABLE challenges ADD CONSTRAINT challenges_status_check CHECK (status IN ('published', 'draft'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'challenges status constraint: %', SQLERRM;
END $$;

-- =============================================
-- 3) active_challenges: missing created_at column
-- =============================================
ALTER TABLE active_challenges ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- 4) stories table (create if missing)
-- =============================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- =============================================
-- 5) story_views table (create if missing)
-- =============================================
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);

-- =============================================
-- 6) RLS for stories and story_views (optional but recommended)
-- =============================================
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stories" ON stories;
CREATE POLICY "Users can view stories" ON stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view story_views" ON story_views;
CREATE POLICY "Users can view story_views" ON story_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own story_views" ON story_views;
CREATE POLICY "Users can insert own story_views" ON story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update story_views for upsert" ON story_views;
CREATE POLICY "Users can update story_views for upsert" ON story_views FOR UPDATE USING (auth.uid() = user_id);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

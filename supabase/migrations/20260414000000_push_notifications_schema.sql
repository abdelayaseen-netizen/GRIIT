-- ================================================================
-- 20260414000000_push_notifications_schema.sql
-- Creates push_tokens table + missing notification preference columns.
-- Idempotent: safe to re-run (already applied to prod 2026-04-14).
-- ================================================================

-- 1. Create push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text NOT NULL,
  device_id   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_tokens_user_token_unique UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS push_tokens_user_id_idx ON public.push_tokens (user_id);
CREATE INDEX IF NOT EXISTS push_tokens_token_idx   ON public.push_tokens (token);

-- 2. Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies — users can only see/manage their own tokens
DROP POLICY IF EXISTS "push_tokens_select_own" ON public.push_tokens;
CREATE POLICY "push_tokens_select_own" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_insert_own" ON public.push_tokens;
CREATE POLICY "push_tokens_insert_own" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_update_own" ON public.push_tokens;
CREATE POLICY "push_tokens_update_own" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_delete_own" ON public.push_tokens;
CREATE POLICY "push_tokens_delete_own" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Add the two missing notification preference columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS morning_kickoff_enabled boolean DEFAULT true;
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS weekly_summary_enabled  boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.morning_kickoff_enabled IS 'Morning motivation push toggle';
COMMENT ON COLUMN public.profiles.weekly_summary_enabled  IS 'Weekly progress summary push toggle';

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

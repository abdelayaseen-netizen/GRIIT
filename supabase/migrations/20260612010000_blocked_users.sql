-- Block users (Apple UGC Guideline 1.2).
-- A block hides the blocked user's content from the blocker and vice versa.
-- The SELECT policy allows either party to read the row so server-side queries
-- can filter both directions (I don't see them AND they don't see me).

CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocked_users_pkey PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT blocked_users_no_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users (blocked_id);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own block" ON public.blocked_users;
CREATE POLICY "Users insert own block" ON public.blocked_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users delete own block" ON public.blocked_users;
CREATE POLICY "Users delete own block" ON public.blocked_users
  FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users read blocks in either direction" ON public.blocked_users;
CREATE POLICY "Users read blocks in either direction" ON public.blocked_users
  FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

NOTIFY pgrst, 'reload schema';

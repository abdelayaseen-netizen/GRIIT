-- Teams schema upgrade for Team feature v1.
-- Safe to run on top of legacy `teams.sql`.

-- 1) Ensure teams table exists with required columns/constraints.
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  team_code TEXT NOT NULL UNIQUE,
  max_members INT NOT NULL DEFAULT 5 CHECK (max_members >= 2 AND max_members <= 5),
  goal_mode TEXT NOT NULL DEFAULT 'individual' CHECK (goal_mode IN ('individual', 'shared')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  -- Legacy compatibility: rename invite_code -> team_code if needed.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'invite_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'team_code'
  ) THEN
    ALTER TABLE public.teams RENAME COLUMN invite_code TO team_code;
  END IF;

  -- Legacy compatibility: rename created_by -> creator_id if needed.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'created_by'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE public.teams RENAME COLUMN created_by TO creator_id;
  END IF;

  -- Add required columns if missing.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'challenge_id'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'team_code'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN team_code TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'goal_mode'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN goal_mode TEXT NOT NULL DEFAULT 'individual';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.teams ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Backfill defaults for newly added columns.
UPDATE public.teams
SET
  goal_mode = COALESCE(goal_mode, 'individual'),
  status = COALESCE(status, 'active'),
  max_members = COALESCE(max_members, 5)
WHERE goal_mode IS NULL OR status IS NULL OR max_members IS NULL;

-- Ensure team code is 6 chars (legacy values are truncated and uppercased).
UPDATE public.teams
SET team_code = UPPER(SUBSTRING(COALESCE(team_code, ''), 1, 6))
WHERE team_code IS NOT NULL AND team_code !~ '^[A-Z0-9]{6}$';

-- Required constraints/indexes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_code_format' AND conrelid = 'public.teams'::regclass
  ) THEN
    ALTER TABLE public.teams ADD CONSTRAINT team_code_format CHECK (team_code ~ '^[A-Z0-9]{6}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teams_challenge_id ON public.teams(challenge_id);
CREATE INDEX IF NOT EXISTS idx_teams_creator_id ON public.teams(creator_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_code ON public.teams(team_code);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);

-- 2) Team members table.
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Normalize legacy owner role.
UPDATE public.team_members SET role = 'creator' WHERE role = 'owner';

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- 3) Team invites table.
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  invite_type TEXT NOT NULL CHECK (invite_type IN ('code', 'link', 'in_app')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invited_user_id ON public.team_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON public.team_invites(status);

-- 4) Ensure challenges.challenge_type exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'challenge_type'
  ) THEN
    ALTER TABLE public.challenges
      ADD COLUMN challenge_type TEXT NOT NULL DEFAULT 'solo'
      CHECK (challenge_type IN ('solo', 'team', 'both'));
  END IF;
END $$;

-- 5) RLS + policies.
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teams' AND policyname = 'Anyone can view active teams'
  ) THEN
    CREATE POLICY "Anyone can view active teams" ON public.teams
      FOR SELECT USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teams' AND policyname = 'Authenticated users can create teams'
  ) THEN
    CREATE POLICY "Authenticated users can create teams" ON public.teams
      FOR INSERT WITH CHECK (auth.uid() = creator_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teams' AND policyname = 'Creator can update own team'
  ) THEN
    CREATE POLICY "Creator can update own team" ON public.teams
      FOR UPDATE USING (auth.uid() = creator_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teams' AND policyname = 'Creator can delete own team'
  ) THEN
    CREATE POLICY "Creator can delete own team" ON public.teams
      FOR DELETE USING (auth.uid() = creator_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Team members can view their team'
  ) THEN
    CREATE POLICY "Team members can view their team" ON public.team_members
      FOR SELECT USING (
        team_id IN (SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Authenticated users can join teams'
  ) THEN
    CREATE POLICY "Authenticated users can join teams" ON public.team_members
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Users can leave teams'
  ) THEN
    CREATE POLICY "Users can leave teams" ON public.team_members
      FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_invites' AND policyname = 'Users can view their invites'
  ) THEN
    CREATE POLICY "Users can view their invites" ON public.team_invites
      FOR SELECT USING (
        auth.uid() = invited_by OR auth.uid() = invited_user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_invites' AND policyname = 'Team members can create invites'
  ) THEN
    CREATE POLICY "Team members can create invites" ON public.team_invites
      FOR INSERT WITH CHECK (auth.uid() = invited_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_invites' AND policyname = 'Invitee can update invite status'
  ) THEN
    CREATE POLICY "Invitee can update invite status" ON public.team_invites
      FOR UPDATE USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
  END IF;
END $$;

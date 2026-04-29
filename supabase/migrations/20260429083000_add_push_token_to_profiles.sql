ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token text;

CREATE INDEX IF NOT EXISTS idx_profiles_push_token
  ON public.profiles(push_token)
  WHERE push_token IS NOT NULL;

NOTIFY pgrst, 'reload schema';

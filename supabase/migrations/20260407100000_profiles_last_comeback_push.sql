ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_comeback_push_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';

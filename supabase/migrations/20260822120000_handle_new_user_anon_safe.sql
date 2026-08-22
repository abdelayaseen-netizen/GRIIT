-- Allow anonymous auth.users inserts: handle_new_user must tolerate NULL email
-- and must set profiles.user_id so RLS (auth.uid() = user_id) matches.
-- Live PK is profiles.id; user_id is a separate column (may be NULL on legacy rows).
-- Without this, signInAnonymously returns 500 "Database error creating anonymous user".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  local_part text;
  base_username text;
BEGIN
  local_part := NULLIF(trim(split_part(COALESCE(NEW.email, ''), '@', 1)), '');
  base_username := COALESCE(local_part, 'user');
  -- Prefer email local-part; fall back to 'user'. Always suffix uuid fragment for uniqueness.
  INSERT INTO public.profiles (id, user_id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'))
      || '_' || left(replace(NEW.id::text, '-', ''), 8),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET user_id = COALESCE(public.profiles.user_id, EXCLUDED.user_id)
  WHERE public.profiles.user_id IS NULL;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auth trigger: create profiles row with id=user_id=NEW.id. Safe for anonymous (null email).';

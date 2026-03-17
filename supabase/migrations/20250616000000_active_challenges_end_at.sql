-- Ensure active_challenges has end_at column (fixes PostgREST "Could not find 'end_at' in schema cache").
-- Code and RPCs use start_at + end_at; some DBs may have been created without end_at.
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.active_challenges ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;

-- Backfill from ends_at if that column exists and end_at is null (optional)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'active_challenges' AND column_name = 'ends_at'
  ) THEN
    UPDATE public.active_challenges
    SET end_at = ends_at
    WHERE end_at IS NULL AND ends_at IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'active_challenges end_at backfill: %', SQLERRM;
END $$;

-- Reload PostgREST schema cache so API sees the new column
NOTIFY pgrst, 'reload schema';

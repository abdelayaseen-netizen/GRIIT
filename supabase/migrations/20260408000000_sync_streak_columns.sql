-- Keep current_streak and active_streak_count in sync.
-- Whenever either column is updated, copy the new value to the other.
-- Also sync best_streak ↔ longest_streak_count.

CREATE OR REPLACE FUNCTION public.sync_streak_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.active_streak_count IS DISTINCT FROM OLD.active_streak_count THEN
    NEW.current_streak := NEW.active_streak_count;
  ELSIF NEW.current_streak IS DISTINCT FROM OLD.current_streak THEN
    NEW.active_streak_count := NEW.current_streak;
  END IF;

  IF NEW.longest_streak_count IS DISTINCT FROM OLD.longest_streak_count THEN
    NEW.best_streak := NEW.longest_streak_count;
  ELSIF NEW.best_streak IS DISTINCT FROM OLD.best_streak THEN
    NEW.longest_streak_count := NEW.best_streak;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_streak_columns ON public.streaks;
CREATE TRIGGER trg_sync_streak_columns
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_streak_columns();

CREATE OR REPLACE FUNCTION public.sync_streak_columns_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.active_streak_count IS NOT NULL AND NEW.current_streak IS NULL THEN
    NEW.current_streak := NEW.active_streak_count;
  ELSIF NEW.current_streak IS NOT NULL AND NEW.active_streak_count IS NULL THEN
    NEW.active_streak_count := NEW.current_streak;
  END IF;

  IF NEW.longest_streak_count IS NOT NULL AND NEW.best_streak IS NULL THEN
    NEW.best_streak := NEW.longest_streak_count;
  ELSIF NEW.best_streak IS NOT NULL AND NEW.longest_streak_count IS NULL THEN
    NEW.longest_streak_count := NEW.best_streak;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_streak_columns_insert ON public.streaks;
CREATE TRIGGER trg_sync_streak_columns_insert
  BEFORE INSERT ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_streak_columns_insert();

-- One-shot: align existing rows (same expression for both sides so values cannot diverge)
UPDATE public.streaks
SET
  active_streak_count = COALESCE(active_streak_count, current_streak, 0),
  current_streak = COALESCE(active_streak_count, current_streak, 0),
  longest_streak_count = COALESCE(longest_streak_count, best_streak, 0),
  best_streak = COALESCE(longest_streak_count, best_streak, 0);

NOTIFY pgrst, 'reload schema';

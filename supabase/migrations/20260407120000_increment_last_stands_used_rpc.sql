-- Optional: atomic increment for cron Last Stand consumption (daily-reset.ts).
-- Falls back to select+update if this RPC is missing.

CREATE OR REPLACE FUNCTION public.increment_last_stands_used(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.streaks
  SET last_stands_used_total = COALESCE(last_stands_used_total, 0) + 1
  WHERE user_id = p_user_id;
END;
$$;

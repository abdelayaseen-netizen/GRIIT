import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Placeholder daily batch job for Railway/cron.
 *
 * GRIIT does **not** use `active_challenges.streak`, `secured_today`, or `last_reset_date`
 * (see `backend/seed.sql`). Streaks live in `streaks`, daily completion in `day_secures`,
 * and `current_day` advances in `checkins.secureDay`. A full server-side “day rollover”
 * would need a dedicated design (e.g. evaluate missed days per user TZ). This function
 * exists so `/internal/daily-reset` can be pinged for health/monitoring without writing
 * to non-existent columns.
 */
export async function runDailyReset(_supabase: SupabaseClient): Promise<{
  processed: number;
  streaksReset: number;
  errors: string[];
}> {
  return { processed: 0, streaksReset: 0, errors: [] };
}

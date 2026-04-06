import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Daily batch job: detect users who missed yesterday and reset their streaks.
 * Designed to run once daily at ~00:30 UTC via cron-job.org hitting /internal/daily-reset.
 *
 * Logic:
 * 1. Find all active challenges (status = 'active').
 * 2. For each user with an active challenge, check if they have a day_secure for yesterday.
 * 3. If not, reset their streak in the streaks table.
 */
export async function runDailyReset(supabase: SupabaseClient): Promise<{
  processed: number;
  streaksReset: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let streaksReset = 0;

  try {
    // Yesterday's date key in YYYY-MM-DD format (UTC)
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Get all users with active challenges
    const { data: activeUsers, error: acErr } = await supabase
      .from("active_challenges")
      .select("user_id")
      .eq("status", "active");

    if (acErr) {
      errors.push(`active_challenges query: ${acErr.message}`);
      return { processed, streaksReset, errors };
    }

    const uniqueUserIds = [...new Set((activeUsers ?? []).map((r: { user_id: string }) => r.user_id))];
    if (uniqueUserIds.length === 0) return { processed, streaksReset, errors };

    // Get users who secured yesterday
    const { data: securedRows, error: secErr } = await supabase
      .from("day_secures")
      .select("user_id")
      .eq("date_key", yesterdayKey)
      .in("user_id", uniqueUserIds);

    if (secErr) {
      errors.push(`day_secures query: ${secErr.message}`);
      return { processed, streaksReset, errors };
    }

    const securedUserIds = new Set((securedRows ?? []).map((r: { user_id: string }) => r.user_id));

    // Find users who missed yesterday
    const missedUserIds = uniqueUserIds.filter((uid) => !securedUserIds.has(uid));
    processed = uniqueUserIds.length;

    if (missedUserIds.length === 0) return { processed, streaksReset, errors };

    // Reset streaks for users who missed — batch in chunks of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < missedUserIds.length; i += BATCH_SIZE) {
      const batch = missedUserIds.slice(i, i + BATCH_SIZE);
      const { error: updateErr } = await supabase
        .from("streaks")
        .update({
          active_streak_count: 0,
          last_secured_date: null,
        })
        .in("user_id", batch);

      if (updateErr) {
        errors.push(`streak reset batch ${i}: ${updateErr.message}`);
      } else {
        streaksReset += batch.length;
      }
    }
  } catch (e) {
    errors.push(`unexpected: ${(e as Error).message}`);
  }

  return { processed, streaksReset, errors };
}

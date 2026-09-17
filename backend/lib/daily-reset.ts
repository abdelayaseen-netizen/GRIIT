import type { SupabaseClient } from "@supabase/supabase-js";
import { reconcileMissForUser } from "./miss-reconcile";

/**
 * Daily batch: same miss evaluation as profiles.reconcileStreak
 * (`backend/lib/miss-reconcile.ts`). Never nulls last_completed_date_key.
 *
 * Endpoint: POST /internal/daily-reset (CRON_SECRET). railway.json has no
 * cron. Nothing in this repo schedules the route.
 */
export async function runDailyReset(supabase: SupabaseClient): Promise<{
  processed: number;
  streaksReset: number;
  lastStandsUsed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let streaksReset = 0;
  let lastStandsUsed = 0;

  try {
    const { data: activeUsers, error: acErr } = await supabase
      .from("active_challenges")
      .select("user_id")
      .eq("status", "active");

    if (acErr) {
      errors.push(`active_challenges query: ${acErr.message}`);
      return { processed, streaksReset, lastStandsUsed, errors };
    }

    const uniqueUserIds = [...new Set((activeUsers ?? []).map((r: { user_id: string }) => r.user_id))];
    processed = uniqueUserIds.length;

    for (const uid of uniqueUserIds) {
      try {
        const result = await reconcileMissForUser(supabase, uid);
        if (result.write.kind === "reset") streaksReset += 1;
        if (result.write.kind === "last_stand") lastStandsUsed += 1;
      } catch (e) {
        errors.push(`miss ${uid}: ${(e as Error).message}`);
      }
    }
  } catch (e) {
    errors.push(`unexpected: ${(e as Error).message}`);
  }

  return { processed, streaksReset, lastStandsUsed, errors };
}

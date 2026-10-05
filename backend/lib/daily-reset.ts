import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileTimeZoneForUser } from "./date-utils";
import { leaveHasPassed } from "./leave-effective";
import { SOLO_LEAVE_ACTIVE_STATUS } from "./leave-challenge";
import { reconcileMissForUser } from "./miss-reconcile";

/**
 * Daily batch: same miss evaluation as profiles.reconcileStreak
 * (`backend/lib/miss-reconcile.ts`). Never nulls last_completed_date_key.
 *
 * Endpoint: POST /internal/daily-reset (CRON_SECRET). railway.json has no
 * cron. Nothing in this repo schedules the route.
 */
export async function applyScheduledLeaves(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ applied: number; errors: string[] }> {
  const errors: string[] = [];
  let applied = 0;
  const { data, error } = await supabase
    .from("active_challenges")
    .select("id, user_id, leave_effective_at")
    .eq("status", "active")
    .not("leave_effective_at", "is", null);

  if (error) {
    errors.push(`scheduled leaves: ${error.message}`);
    return { applied, errors };
  }

  const rows = (data ?? []) as { id?: string; user_id?: string; leave_effective_at?: string | null }[];
  const zones = new Map<string, string>();
  for (const row of rows) {
    const id = row.id;
    const userId = row.user_id;
    const at = row.leave_effective_at;
    if (!id || !userId || !at) continue;
    let timeZone = zones.get(userId);
    if (!timeZone) {
      timeZone = await getProfileTimeZoneForUser(supabase, userId);
      zones.set(userId, timeZone);
    }
    if (!leaveHasPassed({ leaveEffectiveAt: at, now, timeZone })) continue;
    const { error: updErr } = await supabase
      .from("active_challenges")
      .update({
        status: SOLO_LEAVE_ACTIVE_STATUS,
        ended_at: at,
        end_seen_at: at,
      })
      .eq("id", id);
    if (updErr) {
      errors.push(`leave ${id}: ${updErr.message}`);
      continue;
    }
    applied += 1;
  }
  return { applied, errors };
}

export async function runDailyReset(supabase: SupabaseClient): Promise<{
  processed: number;
  streaksReset: number;
  lastStandsUsed: number;
  leavesApplied: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let streaksReset = 0;
  let lastStandsUsed = 0;
  let leavesApplied = 0;

  try {
    const scheduled = await applyScheduledLeaves(supabase);
    leavesApplied = scheduled.applied;
    errors.push(...scheduled.errors);
  } catch (e) {
    errors.push(`scheduled leaves: ${(e as Error).message}`);
  }

  try {
    const { data: activeUsers, error: acErr } = await supabase
      .from("active_challenges")
      .select("user_id")
      .eq("status", "active");

    if (acErr) {
      errors.push(`active_challenges query: ${acErr.message}`);
      return { processed, streaksReset, lastStandsUsed, leavesApplied, errors };
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

  return { processed, streaksReset, lastStandsUsed, leavesApplied, errors };
}

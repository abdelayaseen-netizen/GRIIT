import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Daily batch job: detect users who missed yesterday, auto-use Last Stands where available,
 * and reset streaks for users with no protection.
 *
 * Designed to run once daily at ~00:30 UTC via cron hitting /internal/daily-reset.
 *
 * Logic:
 * 1. Find all users with active challenges (status = 'active').
 * 2. Check who secured yesterday via day_secures.
 * 3. For users who missed:
 *    a. If they have last_stands_available > 0 AND are premium/trial → consume one Last Stand, keep streak.
 *    b. Otherwise → reset streak to 0 (when streak > 0).
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
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const { data: activeUsers, error: acErr } = await supabase
      .from("active_challenges")
      .select("user_id")
      .eq("status", "active");

    if (acErr) {
      errors.push(`active_challenges query: ${acErr.message}`);
      return { processed, streaksReset, lastStandsUsed, errors };
    }

    const uniqueUserIds = [...new Set((activeUsers ?? []).map((r: { user_id: string }) => r.user_id))];
    if (uniqueUserIds.length === 0) return { processed, streaksReset, lastStandsUsed, errors };

    const { data: securedRows, error: secErr } = await supabase
      .from("day_secures")
      .select("user_id")
      .eq("date_key", yesterdayKey)
      .in("user_id", uniqueUserIds);

    if (secErr) {
      errors.push(`day_secures query: ${secErr.message}`);
      return { processed, streaksReset, lastStandsUsed, errors };
    }

    const securedUserIds = new Set((securedRows ?? []).map((r: { user_id: string }) => r.user_id));

    const missedUserIds = uniqueUserIds.filter((uid) => !securedUserIds.has(uid));
    processed = uniqueUserIds.length;

    if (missedUserIds.length === 0) return { processed, streaksReset, lastStandsUsed, errors };

    const BATCH_SIZE = 100;
    for (let i = 0; i < missedUserIds.length; i += BATCH_SIZE) {
      const batch = missedUserIds.slice(i, i + BATCH_SIZE);

      const { data: streakRows, error: streakErr } = await supabase
        .from("streaks")
        .select("user_id, active_streak_count, last_stands_available")
        .in("user_id", batch);

      if (streakErr) {
        errors.push(`streaks query batch ${i}: ${streakErr.message}`);
        continue;
      }

      const { data: profileRows, error: profileErr } = await supabase
        .from("profiles")
        .select("user_id, subscription_status")
        .in("user_id", batch);

      if (profileErr) {
        errors.push(`profiles query batch ${i}: ${profileErr.message}`);
      }

      const streakMap = new Map(
        (streakRows ?? []).map((r: { user_id: string; active_streak_count: number | null; last_stands_available: number | null }) => [
          r.user_id,
          { streak: r.active_streak_count ?? 0, lastStands: Math.min(2, Math.max(0, r.last_stands_available ?? 0)) },
        ])
      );

      const profileMap = new Map(
        (profileRows ?? []).map((r: { user_id: string; subscription_status: string | null }) => [
          r.user_id,
          r.subscription_status ?? "free",
        ])
      );

      const usersToReset: string[] = [];
      const usersToProtect: string[] = [];

      for (const uid of batch) {
        const streakInfo = streakMap.get(uid);
        const subStatus = profileMap.get(uid) ?? "free";
        const isPremium = subStatus === "premium" || subStatus === "trial";

        if (streakInfo && streakInfo.lastStands > 0 && isPremium && streakInfo.streak > 0) {
          usersToProtect.push(uid);
        } else if (streakInfo && streakInfo.streak > 0) {
          usersToReset.push(uid);
        }
      }

      if (usersToReset.length > 0) {
        const { error: resetErr } = await supabase
          .from("streaks")
          .update({
            active_streak_count: 0,
            last_secured_date: null,
          })
          .in("user_id", usersToReset);

        if (resetErr) {
          errors.push(`streak reset batch ${i}: ${resetErr.message}`);
        } else {
          streaksReset += usersToReset.length;
        }
      }

      for (const uid of usersToProtect) {
        const streakInfo = streakMap.get(uid);
        if (!streakInfo) continue;

        try {
          const { error: insertErr } = await supabase.from("last_stand_uses").insert({ user_id: uid, date_key: yesterdayKey });

          if (insertErr) {
            errors.push(`last_stand insert ${uid}: ${insertErr.message}`);
            continue;
          }

          const newAvailable = Math.max(0, streakInfo.lastStands - 1);
          const { error: updateErr } = await supabase
            .from("streaks")
            .update({
              last_stands_available: newAvailable,
            })
            .eq("user_id", uid);

          if (updateErr) {
            errors.push(`streak update ${uid}: ${updateErr.message}`);
            continue;
          }

          lastStandsUsed++;

          const { error: rpcErr } = await supabase.rpc("increment_last_stands_used", { p_user_id: uid });
          if (rpcErr) {
            const { data: currentRow } = await supabase.from("streaks").select("last_stands_used_total").eq("user_id", uid).single();
            const currentTotal = (currentRow as { last_stands_used_total?: number } | null)?.last_stands_used_total ?? 0;
            const { error: totalUpdErr } = await supabase
              .from("streaks")
              .update({ last_stands_used_total: currentTotal + 1 })
              .eq("user_id", uid);
            if (totalUpdErr) {
              errors.push(`last_stands_used_total ${uid}: ${totalUpdErr.message}`);
            }
          }

          try {
            const { sendExpoPush } = await import("./push");
            const [pushResult, profileTokenResult] = await Promise.all([
              supabase.from("push_tokens").select("token").eq("user_id", uid),
              supabase.from("profiles").select("expo_push_token").eq("user_id", uid).maybeSingle(),
            ]);
            const tokensFromTable = (pushResult.data ?? []).map((r: { token: string }) => r.token).filter(Boolean);
            const profileToken = (profileTokenResult.data as { expo_push_token?: string | null } | null)?.expo_push_token ?? null;
            const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))].filter((t): t is string => typeof t === "string");
            if (allTokens.length > 0) {
              const title = "Last Stand activated";
              const body = `Your ${streakInfo.streak}-day streak was saved. ${newAvailable} Last Stand${newAvailable === 1 ? "" : "s"} remaining.`;
              await sendExpoPush(allTokens, title, body);
            }
          } catch (pushErr) {
            errors.push(`push ${uid}: ${(pushErr as Error).message}`);
          }
        } catch (e) {
          errors.push(`last_stand ${uid}: ${(e as Error).message}`);
        }
      }
    }
  } catch (e) {
    errors.push(`unexpected: ${(e as Error).message}`);
  }

  return { processed, streaksReset, lastStandsUsed, errors };
}

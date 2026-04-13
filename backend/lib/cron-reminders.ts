/**
 * Cron: find users who should receive morning or streak-at-risk reminders and send them.
 * Run every hour (e.g. via GET /api/cron/send-reminders?secret=CRON_SECRET).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayDateKey } from "./date-utils";
import {
  shouldSendMorningReminder,
  shouldSendStreakAtRiskReminder,
  sendSecureReminder,
  sendComebackPush,
} from "./push-reminder";

interface ProfileRow {
  user_id: string;
  expo_push_token: string | null;
  reminder_enabled: boolean | null;
  reminder_time: string | null;
  reminder_timezone: string | null;
  timezone: string | null;
}

interface StreakRow {
  user_id: string;
  active_streak_count: number | null;
}

export async function runReminderCron(supabase: SupabaseClient): Promise<{
  morning: number;
  streakAtRisk: number;
  comeback: number;
  errors: string[];
}> {
  const now = new Date();
  const errors: string[] = [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, expo_push_token, reminder_enabled, reminder_time, reminder_timezone, timezone")
    .eq("reminder_enabled", true);

  if (profileError) {
    errors.push(`profiles: ${profileError.message}`);
    return { morning: 0, streakAtRisk: 0, comeback: 0, errors };
  }

  const rows = (profiles ?? []) as ProfileRow[];
  const withToken = rows.filter(
    (r) => r.expo_push_token && (r.expo_push_token.startsWith("ExponentPushToken") || r.expo_push_token.startsWith("ExpoPushToken"))
  );

  let morningSent = 0;
  let streakAtRiskSent = 0;

  if (withToken.length > 0) {
    const userIds = withToken.map((r) => r.user_id);
    const userTodayKeys = new Map<string, string>();
    for (const row of withToken) {
      const tz =
        (row as ProfileRow).timezone?.trim() ||
        (row as ProfileRow).reminder_timezone?.trim() ||
        "UTC";
      userTodayKeys.set(row.user_id, getTodayDateKey(tz));
    }
    const uniqueDateKeys = [...new Set(userTodayKeys.values())];
    const [{ data: securedTodayRows }, { data: streakRows }] = await Promise.all([
      supabase.from("day_secures").select("user_id, date_key").in("user_id", userIds).in("date_key", uniqueDateKeys),
      supabase.from("streaks").select("user_id, active_streak_count").in("user_id", userIds),
    ]);

    const securedPairs = new Set(
      (securedTodayRows ?? []).map((r: { user_id: string; date_key: string }) => `${r.user_id}:${r.date_key}`)
    );
    const streakByUser = new Map<string, number>(
      (streakRows ?? []).map((r: StreakRow) => [r.user_id, Math.max(0, r.active_streak_count ?? 0)])
    );

    for (const row of withToken) {
      const userToday = userTodayKeys.get(row.user_id) ?? getTodayDateKey("UTC");
      const hasSecuredToday = securedPairs.has(`${row.user_id}:${userToday}`);
      const timezone =
        (row as ProfileRow).timezone?.trim() || (row as ProfileRow).reminder_timezone?.trim() || "UTC";
      const reminderTime = (row.reminder_time ?? "09:00").trim() || "09:00";
      const ctx = {
        userId: row.user_id,
        reminderTime,
        timezone,
        hasSecuredToday,
        now,
      };

      try {
        if (shouldSendMorningReminder(ctx)) {
          await sendSecureReminder(row.user_id, {
            type: "morning",
            pushToken: row.expo_push_token,
            streak: streakByUser.get(row.user_id) ?? 0,
          });
          morningSent++;
        }
        if (shouldSendStreakAtRiskReminder(ctx)) {
          await sendSecureReminder(row.user_id, {
            type: "streak_at_risk",
            pushToken: row.expo_push_token,
            streak: streakByUser.get(row.user_id) ?? 0,
          });
          streakAtRiskSent++;
        }
      } catch (e) {
        errors.push(`${row.user_id}: ${(e as Error).message}`);
      }
    }
  }

  // --- Comeback pushes for inactive users (3+ days since last secure) ---
  let comebackSent = 0;
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: inactiveUsers, error: inactiveErr } = await supabase
      .from("streaks")
      .select("user_id, last_completed_date_key")
      .not("last_completed_date_key", "is", null)
      .lte("last_completed_date_key", threeDaysAgo);

    if (inactiveErr) {
      errors.push(`comeback streaks query: ${inactiveErr.message}`);
    } else {
      const inactiveUserIds = (inactiveUsers ?? []).map((r: { user_id: string }) => r.user_id);

      if (inactiveUserIds.length > 0) {
        const { data: comebackProfiles, error: cpErr } = await supabase
          .from("profiles")
          .select("user_id, expo_push_token, last_comeback_push_at")
          .in("user_id", inactiveUserIds);

        if (cpErr) {
          errors.push(`comeback profiles query: ${cpErr.message}`);
        } else {
          const eligibleUsers = (comebackProfiles ?? []).filter((p: {
            user_id: string;
            expo_push_token: string | null;
            last_comeback_push_at: string | null;
          }) => {
            const token = p.expo_push_token?.trim() ?? "";
            if (!token || (!token.startsWith("ExponentPushToken") && !token.startsWith("ExpoPushToken"))) {
              return false;
            }
            if (p.last_comeback_push_at) {
              const lastPush = new Date(p.last_comeback_push_at);
              if (lastPush.toISOString() > sevenDaysAgo) {
                return false;
              }
            }
            return true;
          });

          const currentHourUTC = now.getUTCHours();
          const isDaytime = currentHourUTC >= 10 && currentHourUTC <= 20;

          if (isDaytime) {
            for (const user of eligibleUsers) {
              try {
                const typedUser = user as { user_id: string; expo_push_token: string };
                await sendComebackPush(typedUser.expo_push_token);

                await supabase
                  .from("profiles")
                  .update({ last_comeback_push_at: now.toISOString() })
                  .eq("user_id", typedUser.user_id);

                comebackSent++;
              } catch (e) {
                errors.push(`comeback send ${(user as { user_id: string }).user_id}: ${(e as Error).message}`);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    errors.push(`comeback unexpected: ${(e as Error).message}`);
  }

  return { morning: morningSent, streakAtRisk: streakAtRiskSent, comeback: comebackSent, errors };
}

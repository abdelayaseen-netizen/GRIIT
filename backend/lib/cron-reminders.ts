/**
 * Cron: find users who should receive morning or streak-at-risk reminders and send them.
 * Run every hour (e.g. via GET /api/cron/send-reminders?secret=CRON_SECRET).
 */

import { getTodayDateKey } from "./date-utils";
import {
  shouldSendMorningReminder,
  shouldSendStreakAtRiskReminder,
  sendSecureReminder,
} from "./push-reminder";

interface ProfileRow {
  user_id: string;
  expo_push_token: string | null;
  reminder_enabled: boolean | null;
  reminder_time: string | null;
  reminder_timezone: string | null;
}

interface StreakRow {
  user_id: string;
  active_streak_count: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runReminderCron(supabase: any): Promise<{
  morning: number;
  streakAtRisk: number;
  errors: string[];
}> {
  const now = new Date();
  const todayKey = getTodayDateKey();
  const errors: string[] = [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, expo_push_token, reminder_enabled, reminder_time, reminder_timezone")
    .eq("reminder_enabled", true);

  if (profileError) {
    errors.push(`profiles: ${profileError.message}`);
    return { morning: 0, streakAtRisk: 0, errors };
  }

  const rows = (profiles ?? []) as ProfileRow[];
  const withToken = rows.filter(
    (r) => r.expo_push_token && (r.expo_push_token.startsWith("ExponentPushToken") || r.expo_push_token.startsWith("ExpoPushToken"))
  );
  if (withToken.length === 0) return { morning: 0, streakAtRisk: 0, errors };

  const userIds = withToken.map((r) => r.user_id);
  const [{ data: securedTodayRows }, { data: streakRows }] = await Promise.all([
    supabase.from("day_secures").select("user_id").eq("date_key", todayKey),
    supabase.from("streaks").select("user_id, active_streak_count").in("user_id", userIds),
  ]);

  const securedUserIds = new Set((securedTodayRows ?? []).map((r: { user_id: string }) => r.user_id));
  const streakByUser = new Map<string, number>(
    (streakRows ?? []).map((r: StreakRow) => [r.user_id, Math.max(0, r.active_streak_count ?? 0)])
  );

  let morningSent = 0;
  let streakAtRiskSent = 0;

  for (const row of withToken) {
    const hasSecuredToday = securedUserIds.has(row.user_id);
    const timezone = row.reminder_timezone?.trim() || "UTC";
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

  return { morning: morningSent, streakAtRisk: streakAtRiskSent, errors };
}

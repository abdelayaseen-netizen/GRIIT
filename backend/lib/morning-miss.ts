/**
 * Morning-after push. The morning after an uncovered miss, only if the
 * member has ever secured a day. Sent once, inside the 3-a-day cap.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { addCalendarDaysToDateKey, getTodayDateKey } from "./date-utils";
import { shareColumns } from "./activity-share";
import { sendPushToUser } from "./push-reminder-expo";
import { logger } from "./logger";
import { MORNING_MISS } from "../../lib/freeze-earn";
import { effectiveFreezesRemaining } from "../trpc/routes/streaks";

export const MORNING_MISS_EVENT = "morning_miss_push";
export const PUSH_CAP_PER_DAY = 3;

export function medianCheckInMinutes(times: number[]): number {
  const valid = times.filter((n) => Number.isFinite(n) && n >= 0 && n < 24 * 60);
  if (valid.length === 0) return 9 * 60;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
  return sorted[mid]!;
}

export function minutesInTimeZone(iso: string, timeZone: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(d);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return (hour === 24 ? 0 : hour) * 60 + minute;
  } catch {
    return null;
  }
}

export function shouldSendMorningMiss(input: {
  everSecured: boolean;
  yesterdaySecured: boolean;
  yesterdayFrozen: boolean;
  alreadySentForDate: boolean;
  pushesToday: number;
  nowMinutes: number;
  targetMinutes: number;
}): boolean {
  if (!input.everSecured) return false;
  if (input.yesterdaySecured || input.yesterdayFrozen) return false;
  if (input.alreadySentForDate) return false;
  if (input.pushesToday >= PUSH_CAP_PER_DAY) return false;
  return input.nowMinutes >= input.targetMinutes && input.nowMinutes < input.targetMinutes + 60;
}

export function morningMissBody(hasFreeze: boolean): string {
  return hasFreeze ? MORNING_MISS.withFreeze : MORNING_MISS.without;
}

export async function sendDueMorningMisses(
  supabase: SupabaseClient,
  rows: { userId: string; token: string; timezone: string }[],
  now: Date,
): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;
  for (const row of rows) {
    try {
      const tz = row.timezone.trim() || "UTC";
      const today = getTodayDateKey(tz);
      const yesterday = addCalendarDaysToDateKey(today, -1);
      const since = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const dayStart = new Date(`${today}T00:00:00.000Z`);
      const [{ data: ever }, { data: ySecure }, { data: yFreeze }, { data: already }, { count: pushes }, { data: checks }, { data: profile }] =
        await Promise.all([
          supabase.from("day_secures").select("id").eq("user_id", row.userId).limit(1),
          supabase.from("day_secures").select("id").eq("user_id", row.userId).eq("date_key", yesterday).limit(1),
          supabase.from("freeze_uses").select("id").eq("user_id", row.userId).eq("date_key", yesterday).limit(1),
          supabase
            .from("activity_events")
            .select("id")
            .eq("user_id", row.userId)
            .eq("event_type", MORNING_MISS_EVENT)
            .eq("metadata->>date_key", yesterday)
            .limit(1),
          supabase
            .from("activity_events")
            .select("id", { count: "exact", head: true })
            .eq("user_id", row.userId)
            .eq("metadata->>channel", "push")
            .gte("created_at", dayStart.toISOString()),
          supabase
            .from("activity_events")
            .select("created_at")
            .eq("user_id", row.userId)
            .eq("event_type", "task_completed")
            .gte("created_at", since)
            .limit(100),
          supabase
            .from("profiles")
            .select("is_premium, streak_freezes_remaining, last_freeze_used_at")
            .eq("user_id", row.userId)
            .maybeSingle(),
        ]);
      const times = ((checks ?? []) as { created_at?: string }[])
        .map((c) => (c.created_at ? minutesInTimeZone(c.created_at, tz) : null))
        .filter((n): n is number => n != null);
      const target = medianCheckInMinutes(times);
      const nowMinutes = minutesInTimeZone(now.toISOString(), tz) ?? 9 * 60;
      const prof = profile as {
        is_premium?: boolean;
        streak_freezes_remaining?: number | null;
        last_freeze_used_at?: string | null;
      } | null;
      const held = effectiveFreezesRemaining({
        storedRemaining: prof?.streak_freezes_remaining,
        lastFreezeUsedAt: prof?.last_freeze_used_at,
        isPro: !!prof?.is_premium,
        now,
      }).remaining;
      if (
        !shouldSendMorningMiss({
          everSecured: (ever ?? []).length > 0,
          yesterdaySecured: (ySecure ?? []).length > 0,
          yesterdayFrozen: (yFreeze ?? []).length > 0,
          alreadySentForDate: (already ?? []).length > 0,
          pushesToday: pushes ?? 0,
          nowMinutes,
          targetMinutes: target,
        })
      ) {
        continue;
      }
      const body = morningMissBody(held > 0);
      await sendPushToUser(row.token, "GRIIT", body, {
        focus: "freeze",
        reminder_type: "morning_miss",
      });
      const { error } = await supabase.from("activity_events").insert({
        user_id: row.userId,
        event_type: MORNING_MISS_EVENT,
        ...shareColumns("kept"),
        metadata: { date_key: yesterday, channel: "push", has_freeze: held > 0 },
      });
      if (error) {
        errors.push(`morning miss record ${row.userId}: ${error.message}`);
        continue;
      }
      sent += 1;
    } catch (e) {
      errors.push(`morning miss ${row.userId}: ${(e as Error).message}`);
      logger.warn({ err: e, userId: row.userId }, "[morning-miss] skipped");
    }
  }
  return { sent, errors };
}

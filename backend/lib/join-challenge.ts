/**
 * Direct join challenge: insert active_challenges + check_ins + upsert streaks.
 * Replaces the missing join_challenge RPC so join works without deploying the SQL function.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { addCalendarDaysToDateKey, dateKeyInTimeZone, getTodayDateKey, getTomorrowDateKey, getProfileTimeZoneForUser } from "./date-utils";
import { applyEnrollmentWindow } from "./enrollment-window";
import { enrollmentEndAt, localMidnightUtc } from "./enrollment-end-at";
import { currentMinutesInTimeZone } from "./task-time-gate";

export type TaskWindowRow = {
  time_window_end?: string | null;
  schedule_window_end?: string | null;
  gate_time_end?: string | null;
  gate_time_start?: string | null;
  gate_time_mode?: string | null;
  config?: { schedule_window_end?: string | null; time_window_end?: string | null } | null;
};

/** HH:MM end of a task time window, any mode. */
export function taskWindowEndHHMM(task: TaskWindowRow): string | null {
  const mode = task.gate_time_mode?.trim();
  if (mode === "by" && task.gate_time_start) return task.gate_time_start;
  if (mode === "between" && task.gate_time_end) return task.gate_time_end;
  const raw =
    task.time_window_end ??
    task.schedule_window_end ??
    task.gate_time_end ??
    task.config?.schedule_window_end ??
    task.config?.time_window_end ??
    null;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function parseHHMMMinutes(raw: string): number | null {
  const [hStr, mStr] = raw.split(":");
  const h = parseInt(hStr ?? "", 10);
  const m = parseInt(mStr ?? "0", 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/** True when any task with a time window has already closed today in `timeZone`. */
export function anyTimeWindowClosedToday(
  tasks: TaskWindowRow[],
  now: Date,
  timeZone: string,
): boolean {
  const current = currentMinutesInTimeZone(now, timeZone);
  return tasks.some((t) => {
    const end = taskWindowEndHHMM(t);
    if (!end) return false;
    const mins = parseHHMMMinutes(end);
    return mins != null && current >= mins;
  });
}

/** Defer to tomorrow local 00:00; otherwise start now. */
export function enrollmentStartAt(now: Date, timeZone: string, defer: boolean): Date {
  if (!defer) return now;
  const tomorrowKey = addCalendarDaysToDateKey(dateKeyInTimeZone(now, timeZone), 1);
  return localMidnightUtc(tomorrowKey, timeZone);
}

export type JoinChallengeResult = { id: string; user_id: string; challenge_id: string; status: string; start_at: string; end_at: string; current_day?: number; progress_percent?: number; created_at?: string };

/**
 * Join a challenge for the given user: insert active_challenges, seed check_ins for all tasks, upsert streaks.
 * Idempotent: if already joined, throws BAD_REQUEST "You have already joined this challenge."
 */
export async function joinChallengeDirect(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<JoinChallengeResult> {
  const { data: existing } = await applyEnrollmentWindow(
    supabase
      .from("active_challenges")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
  ).maybeSingle();

  if (existing) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
  }

  const { getSupabaseServer } = await import("./supabase-server");
  const reader = getSupabaseServer() ?? supabase;

  const { data: challenge, error: challengeError } = await reader
    .from("challenges")
    .select("id, duration_type, duration_days")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
  }

  const { data: tasksForWindowCheck } = await reader
    .from("challenge_tasks")
    .select("id, time_window_end, schedule_window_end, gate_time_end, gate_time_start, gate_time_mode, config")
    .eq("challenge_id", challengeId);

  const taskWindowList = (tasksForWindowCheck ?? []) as TaskWindowRow[];

  const now = new Date();
  const userTz = await getProfileTimeZoneForUser(supabase, userId);
  const defer = anyTimeWindowClosedToday(taskWindowList, now, userTz);
  const startAt = enrollmentStartAt(now, userTz, defer);
  const durationType = (challenge as { duration_type?: string }).duration_type;
  const durationDays = (challenge as { duration_days?: number }).duration_days ?? 1;
  const endAt = enrollmentEndAt({
    startAt,
    durationDays,
    durationType,
    timeZone: userTz,
  });

  // Insert only columns that exist in all environments (some DBs lack current_day, progress_percent)
  const { data: activeChallenge, error: insertErr } = await supabase
    .from("active_challenges")
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      status: "active",
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      current_day: 1,
      progress_percent: 0,
    })
    .select("id, user_id, challenge_id, status, start_at, end_at, current_day, progress_percent, created_at")
    .single();

  if (insertErr) {
    const { logger } = await import("./logger");
    logger.error({ err: insertErr }, "[JOIN-BACKEND] Insert active_challenges error");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to join challenge.",
    });
  }

  // Best-effort: seed check_ins for each task (don't fail join if table/columns differ)
  try {
    const { data: tasks } = await reader
      .from("challenge_tasks")
      .select("id")
      .eq("challenge_id", challengeId);
    const taskList = (tasks ?? []) as { id: string }[];
    if (taskList.length > 0) {
      const tz = await getProfileTimeZoneForUser(supabase, userId);
      const dateKey = defer ? getTomorrowDateKey(tz) : getTodayDateKey(tz);
      const checkIns = taskList.map((t) => ({
        user_id: userId,
        active_challenge_id: activeChallenge.id,
        task_id: t.id,
        date_key: dateKey,
        status: "pending",
      }));
      const { error: checkInsErr } = await supabase.from("check_ins").insert(checkIns);
      if (checkInsErr) {
        const { logger } = await import("./logger");
        logger.warn({ message: checkInsErr.message }, "[JOIN-BACKEND] Insert check_ins (best-effort) failed");
      }
    }
  } catch (e) {
    const { logger } = await import("./logger");
    logger.warn({ err: e }, "[JOIN-BACKEND] check_ins best-effort failed");
  }

  // Best-effort: ensure streaks row exists (don't fail join if table/columns differ)
  try {
    const { data: existingStreak } = await supabase
      .from("streaks")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!existingStreak) {
      const { error: streakErr } = await supabase.from("streaks").insert({
        user_id: userId,
        active_streak_count: 0,
        longest_streak_count: 0,
      });
      if (streakErr) {
        const { logger } = await import("./logger");
        logger.warn({ message: streakErr.message }, "[JOIN-BACKEND] Insert streaks (best-effort) failed");
      }
    }
  } catch (e) {
    const { logger } = await import("./logger");
    logger.warn({ err: e }, "[JOIN-BACKEND] streaks best-effort failed");
  }

  return activeChallenge as JoinChallengeResult;
}

/**
 * Direct join challenge: insert active_challenges + check_ins + upsert streaks.
 * Replaces the missing join_challenge RPC so join works without deploying the SQL function.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { getTodayDateKey, getTomorrowDateKey } from "./date-utils";

export type JoinChallengeResult = { id: string; user_id: string; challenge_id: string; status: string; start_at: string; end_at: string; current_day?: number; progress_percent?: number; created_at?: string; completed_at?: string | null };

/**
 * Join a challenge for the given user: insert active_challenges, seed check_ins for all tasks, upsert streaks.
 * Idempotent: if already joined, throws BAD_REQUEST "You have already joined this challenge."
 */
export async function joinChallengeDirect(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<JoinChallengeResult> {
  const { data: existing } = await supabase
    .from("active_challenges")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, duration_type, duration_days")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
  }

  // Fetch tasks to check if all time windows have already passed today
  const { data: tasksForWindowCheck } = await supabase
    .from("challenge_tasks")
    .select("id, time_window_end, hard_mode")
    .eq("challenge_id", challengeId);

  const taskWindowList = (tasksForWindowCheck ?? []) as {
    id: string;
    time_window_end?: string | null;
    hard_mode?: boolean;
  }[];

  const now = new Date();
  const timedTasks = taskWindowList.filter(
    (t) => t.hard_mode && t.time_window_end
  );
  const allWindowsExpired =
    timedTasks.length > 0 &&
    timedTasks.every((t) => {
      // time_window_end is "HH:MM" — compare against current UTC time
      const [hStr, mStr] = (t.time_window_end ?? "").split(":");
      const h = parseInt(hStr ?? "0", 10);
      const m = parseInt(mStr ?? "0", 10);
      const windowEnd = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          h,
          m,
          0
        )
      );
      return now >= windowEnd;
    });

  const startAt = allWindowsExpired
    ? new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      )
    : now;
  const endAt = new Date(startAt);
  const durationType = (challenge as { duration_type?: string }).duration_type;
  const durationDays = (challenge as { duration_days?: number }).duration_days ?? 1;
  if (durationType === "24h") {
    endAt.setTime(startAt.getTime() + 24 * 60 * 60 * 1000);
  } else {
    endAt.setDate(endAt.getDate() + durationDays);
  }

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
    const { data: tasks } = await supabase
      .from("challenge_tasks")
      .select("id")
      .eq("challenge_id", challengeId);
    const taskList = (tasks ?? []) as { id: string }[];
    if (taskList.length > 0) {
      const dateKey = allWindowsExpired
        ? getTomorrowDateKey()
        : getTodayDateKey();
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

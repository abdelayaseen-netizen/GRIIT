/**
 * Direct join challenge: insert active_challenges + check_ins + upsert streaks.
 * Replaces the missing join_challenge RPC so join works without deploying the SQL function.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { getTodayDateKey, getTomorrowDateKey, getProfileTimeZoneForUser } from "./date-utils";
import { enrollmentEndAt, enrollmentIsPastEnd } from "./enrollment-end-at";
import {
  ALREADY_IN_CHALLENGE_MESSAGE,
  JOIN_FAILED_FALLBACK,
  joinFailureFromInsert,
} from "./join-errors";
import {
  anyTimeWindowClosedToday,
  enrollmentStartAt,
  type TaskWindowRow,
} from "./late-join-window";

export {
  anyTimeWindowClosedToday,
  enrollmentStartAt,
  firstHHMM,
  parseHHMMMinutes,
  taskWindowEndHHMM,
  windowTaskRequired,
  type TaskWindowRow,
} from "./late-join-window";

export type JoinChallengeResult = { id: string; user_id: string; challenge_id: string; status: string; start_at: string; end_at: string; current_day?: number; progress_percent?: number; created_at?: string };

/**
 * Join a challenge for the given user: insert active_challenges, seed check_ins for all tasks, upsert streaks.
 * Idempotent: if already running, throws BAD_REQUEST "You're already in this challenge."
 * A finished or left row is kept; a new active row is inserted.
 */
export async function joinChallengeDirect(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<JoinChallengeResult> {
  const now = new Date();
  const { data: existingActive } = await supabase
    .from("active_challenges")
    .select("id, end_at, status")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("status", "active")
    .maybeSingle();

  if (existingActive) {
    const endAt = (existingActive as { end_at?: string }).end_at;
    const pastEnd = endAt ? enrollmentIsPastEnd(new Date(endAt), now) : false;
    if (!pastEnd) {
      throw new TRPCError({ code: "BAD_REQUEST", message: ALREADY_IN_CHALLENGE_MESSAGE });
    }
    const { error: closeErr } = await supabase
      .from("active_challenges")
      .update({ status: "completed", ended_at: now.toISOString() })
      .eq("id", (existingActive as { id: string }).id)
      .eq("user_id", userId)
      .eq("status", "active");
    if (closeErr) {
      const { logger } = await import("./logger");
      const fields = joinFailureFromInsert(closeErr);
      logger.error({ err: fields.log, userId, challengeId }, "[JOIN-BACKEND] close past-end enrollment failed");
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JOIN_FAILED_FALLBACK });
    }
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

  const { data: tasksForWindowCheck } = await supabase
    .from("challenge_tasks")
    .select("id, time_window_end, schedule_window_end, gate_time_end, gate_time_start, gate_time_mode, config")
    .eq("challenge_id", challengeId);

  const taskWindowList = (tasksForWindowCheck ?? []) as TaskWindowRow[];

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
    const mapped = joinFailureFromInsert(insertErr);
    logger.error(
      { err: mapped.log, userId, challengeId },
      "[JOIN-BACKEND] Insert active_challenges error",
    );
    try {
      const Sentry = await import("@sentry/node");
      Sentry.captureException(new Error(mapped.log.message ?? JOIN_FAILED_FALLBACK), {
        tags: { path: "joinChallengeDirect.insert", code: mapped.log.code ?? "unknown" },
        extra: { ...mapped.log, userId, challengeId },
      });
    } catch {
      /* Sentry unavailable */
    }
    throw new TRPCError({
      code: mapped.alreadyIn ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
      message: mapped.message,
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

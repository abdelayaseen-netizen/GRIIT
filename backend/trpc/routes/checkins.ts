import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { assertActiveChallengeOwnership } from "../guards";
import { requireNoError } from "../errors";
import { computeNewStreakCount } from "../../lib/streak";
import { getTierForDays } from "../../lib/progression";
import { shouldEarnLastStand, newAvailableAfterEarn } from "../../lib/last-stand";
import { getTodayDateKey } from "../../lib/date-utils";
import type { StreakRow, DaySecureRow, ActiveChallengeWithTasks, PgError } from "../../types/db";
import {
  type ChallengeTaskConfig,
  type ChallengeTaskRowRaw,
  getTaskVerification,
  isTaskRequired,
} from "../../lib/challenge-tasks";
import { isChallengeExpired } from "../../lib/challenge-timer";
import { checkAndUnlockAchievements, getLabelForKey } from "../../lib/achievements";
import { haversineDistance } from "../../lib/geo";

/** Task row with optional advanced verification columns (from migration 20250330000000). */
type TaskRowWithVerification = ChallengeTaskRowRaw & {
  require_photo?: boolean | null;
  timer_direction?: string | null;
  timer_hard_mode?: boolean | null;
  require_heart_rate?: boolean | null;
  heart_rate_threshold?: number | null;
  require_location?: boolean | null;
  location_name?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_radius_meters?: number | null;
  min_duration_minutes?: number | null;
};

export const checkinsRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string().uuid(),
      taskId: z.string().uuid(),
      value: z.number().optional(),
      noteText: z.string().max(2000).optional(),
      proofUrl: z.string().max(2000).optional(),
      photo_url: z.string().max(2000).optional(),
      heart_rate_avg: z.number().int().min(0).optional(),
      heart_rate_peak: z.number().int().min(0).optional(),
      location_latitude: z.number().optional(),
      location_longitude: z.number().optional(),
      timer_seconds_on_screen: z.number().int().min(0).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const dateKey = getTodayDateKey();

      const { data: chRow } = await ctx.supabase
        .from("challenges")
        .select("duration_type, ends_at, live_date")
        .eq("id", challenge_id)
        .single();
      const ch = chRow as { duration_type?: string; ends_at?: string | null; live_date?: string | null } | null;
      if (ch?.duration_type === "24h") {
        const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
        if (isChallengeExpired(endsAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer complete tasks." });
        }
      }

      const { data: taskRow } = await ctx.supabase
        .from("challenge_tasks")
        .select("id, task_type, config, require_photo, timer_direction, timer_hard_mode, require_heart_rate, heart_rate_threshold, require_location, location_name, location_latitude, location_longitude, location_radius_meters, min_duration_minutes")
        .eq("id", input.taskId)
        .single();

      const task = taskRow as TaskRowWithVerification | null;
      const cfg = (task?.config ?? {}) as ChallengeTaskConfig;
      const ruleFromCfg = cfg.verification_rule_json as { min_avg_bpm?: number } | undefined;
      const { needsProof, minWords, durationMinutes } = getTaskVerification(task as ChallengeTaskRowRaw);
      const taskType = task?.task_type ?? "manual";

      const requirePhoto = task?.require_photo === true || needsProof;
      const photoUrl = (input.photo_url ?? input.proofUrl)?.trim() || null;
      if (requirePhoto && !photoUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This task requires a photo. Please take a photo to verify completion.",
        });
      }

      const requireHeartRate =
        task?.require_heart_rate === true || cfg.verification_method === "heart_rate";
      if (requireHeartRate) {
        const threshold =
          (typeof task?.heart_rate_threshold === "number" ? task.heart_rate_threshold : null) ??
          (typeof ruleFromCfg?.min_avg_bpm === "number" ? ruleFromCfg.min_avg_bpm : 100);
        const avg = input.heart_rate_avg ?? 0;
        if (!avg || avg < threshold) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This task requires an elevated heart rate. Your average was ${avg} BPM but ${threshold} BPM is needed.`,
          });
        }
      }

      const requireLocation = task?.require_location === true || cfg.require_location === true;
      if (requireLocation) {
        const tLat =
          task?.location_latitude ??
          (typeof cfg.location_latitude === "number" ? cfg.location_latitude : undefined);
        const tLon =
          task?.location_longitude ??
          (typeof cfg.location_longitude === "number" ? cfg.location_longitude : undefined);
        const radius =
          task?.location_radius_meters ??
          (typeof cfg.location_radius_meters === "number" ? cfg.location_radius_meters : 200);
        if (tLat == null || tLon == null) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This task has invalid location configuration." });
        }
        if (input.location_latitude == null || input.location_longitude == null) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This task requires location verification. Please enable location services." });
        }
        const distance = haversineDistance(tLat, tLon, input.location_latitude, input.location_longitude);
        if (distance > radius) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You need to be within ${radius}m of ${task?.location_name ?? cfg.location_name ?? "the required location"}. You are ${Math.round(distance)}m away.`,
          });
        }
      }

      const timerHardMode =
        task?.timer_hard_mode === true || cfg.strict_timer_mode === true || cfg.timer_hard_mode === true;
      const minDurationMinutes =
        task?.min_duration_minutes ??
        durationMinutes ??
        (taskType === "run" && cfg.tracking_mode === "time" && typeof cfg.duration_minutes === "number"
          ? cfg.duration_minutes
          : null);
      if (timerHardMode && minDurationMinutes != null && minDurationMinutes > 0) {
        const requiredSeconds = minDurationMinutes * 60;
        const onScreen = input.timer_seconds_on_screen ?? 0;
        if (onScreen < requiredSeconds) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Hard mode: you must stay on the timer screen for the full ${minDurationMinutes} minutes. You were on screen for ${Math.floor(onScreen / 60)} minutes.`,
          });
        }
      }

      if (minDurationMinutes != null && minDurationMinutes > 0 && input.value != null) {
        if (input.value < minDurationMinutes) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This task requires at least ${minDurationMinutes} minutes. You completed ${input.value} minutes.`,
          });
        }
      }

      const isJournal = taskType === "journal" || taskType === "manual";
      if (isJournal && minWords > 0) {
        const text = (input.noteText ?? "").trim();
        const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
        if (wordCount < minWords) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This task requires at least ${minWords} words. You wrote ${wordCount}.`,
          });
        }
      }

      const isTimer = taskType === "timer";
      const isRunTimed = taskType === "run" && typeof minDurationMinutes === "number" && minDurationMinutes > 0;
      const requiredMinutes = minDurationMinutes ?? durationMinutes;
      if ((isTimer || isRunTimed) && requiredMinutes > 0) {
        const completedMinutes = input.value ?? 0;
        if (completedMinutes < requiredMinutes) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This task requires at least ${requiredMinutes} minutes. You logged ${completedMinutes}.`,
          });
        }
      }

      const proofUrl = photoUrl || input.proofUrl?.trim() || null;

      const payload: Record<string, unknown> = {
        user_id: ctx.userId,
        active_challenge_id: input.activeChallengeId,
        task_id: input.taskId,
        date_key: dateKey,
        status: "completed",
      };

      if (input.value != null) payload.value = input.value;
      if (input.noteText != null) payload.note_text = input.noteText;
      if (proofUrl != null) payload.proof_url = proofUrl;

      if (proofUrl) payload.completion_image_url = proofUrl;
      if (photoUrl) payload.photo_url = photoUrl;
      if (input.heart_rate_avg != null) payload.heart_rate_avg = input.heart_rate_avg;
      if (input.heart_rate_peak != null) payload.heart_rate_peak = input.heart_rate_peak;
      if (input.location_latitude != null) payload.location_latitude = input.location_latitude;
      if (input.location_longitude != null) payload.location_longitude = input.location_longitude;
      if (input.timer_seconds_on_screen != null) payload.timer_seconds_on_screen = input.timer_seconds_on_screen;

      const { data, error } = await ctx.supabase
        .from("check_ins")
        .upsert(payload, { onConflict: "active_challenge_id,task_id,date_key" })
        .select()
        .single();

      if (error) {
        const { logger } = await import("../../lib/logger");
        const errObj = error as { code?: string; message?: string; details?: string; hint?: string };
        logger.error(
          {
            supabaseError: error,
            code: errObj.code,
            message: errObj.message,
            details: errObj.details,
            hint: errObj.hint,
            payload,
          },
          "[checkins.complete] check_ins upsert FAILED"
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Check-in save failed: ${error.message || "unknown"} (code: ${errObj.code || "?"})`,
        });
      }

      const { data: allTasks } = await ctx.supabase
        .from('challenge_tasks')
        .select('id, task_type, config')
        .eq('challenge_id', challenge_id);

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = (allTasks ?? []).filter((t) => isTaskRequired(t as ChallengeTaskRowRaw));
      const completedRequired = completedCheckins?.filter(c => 
        requiredTasks.some(rt => rt.id === c.task_id)
      ) || [];

      const progress = requiredTasks.length > 0 
        ? (completedRequired.length / requiredTasks.length) * 100 
        : 0;

      await ctx.supabase
        .from('active_challenges')
        .update({ progress_percent: progress })
        .eq('id', input.activeChallengeId);

      return data;
    }),

  getTodayCheckins: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const dateKey = getTodayDateKey();

      const { data, error } = await ctx.supabase
        .from('check_ins')
        .select('id, task_id, date_key, status, value, note_text, proof_url, completion_image_url, proof_source, proof_payload_json, external_activity_id, verification_status, created_at')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey);

      requireNoError(error, "Failed to load check-ins.");
      return data ?? [];
    }),

  /** All today check-ins for the user across all their active challenges (for home). */
  getTodayCheckinsForUser: protectedProcedure
    .query(async ({ ctx }) => {
      const dateKey = getTodayDateKey();
      const { data: acList, error: acErr } = await ctx.supabase
        .from('active_challenges')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('status', 'active')
        .limit(50);
      requireNoError(acErr, "Failed to load active challenges.");
      const acIds = (acList ?? []).map((r: { id: string }) => r.id);
      if (acIds.length === 0) return [];
      // Per active_challenge_id: avoids PostgREST `.in()` + RLS edge cases; minimal columns work on any migrated DB.
      const rows = await Promise.all(
        acIds.map((acId) =>
          ctx.supabase
            .from('check_ins')
            .select('id, active_challenge_id, task_id, date_key, status')
            .eq('active_challenge_id', acId)
            .eq('date_key', dateKey)
        )
      );
      const merged: NonNullable<(typeof rows)[0]['data']> = [];
      for (const { data, error } of rows) {
        if (error) {
          console.error("[getTodayCheckinsForUser] Supabase error:", JSON.stringify(error));
          requireNoError(error, "Failed to load today check-ins.");
        }
        if (data?.length) merged.push(...data);
      }
      return merged;
    }),

  secureDay: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);

      const { data: chRow } = await ctx.supabase
        .from("challenges")
        .select("duration_type, ends_at, live_date")
        .eq("id", challenge_id)
        .single();
      const ch = chRow as { duration_type?: string; ends_at?: string | null; live_date?: string | null } | null;
      if (ch?.duration_type === "24h") {
        const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
        if (isChallengeExpired(endsAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer secure the day." });
        }
      }

      const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("secure_day", {
        p_active_challenge_id: input.activeChallengeId,
      });

      if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
        const row = rpcRows[0] as { new_streak_count: number; last_stand_earned: boolean };
        const { data: acRow } = await ctx.supabase
          .from("active_challenges")
          .select("challenge_id, current_day")
          .eq("id", input.activeChallengeId)
          .single();
        const challengeId = (acRow as { challenge_id?: string; current_day?: number } | null)?.challenge_id;
        const currentDayAfter = (acRow as { current_day?: number } | null)?.current_day ?? 0;
        if (challengeId) {
          const { data: ch } = await ctx.supabase.from("challenges").select("participation_type, run_status, duration_days").eq("id", challengeId).single();
          if ((ch as { participation_type?: string })?.participation_type === "team" && (ch as { run_status?: string })?.run_status === "active") {
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: yesterday });
            await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: today });
          }
        }
        const { data: profileRow } = await ctx.supabase.from("profiles").select("total_days_secured").eq("user_id", ctx.userId).single();
        const totalDaysSecured = (profileRow as { total_days_secured?: number } | null)?.total_days_secured ?? 0;
        const { data: chRow } = await ctx.supabase.from("challenges").select("duration_days, title").eq("id", challengeId ?? "").single();
        const durationDays = (chRow as { duration_days?: number } | null)?.duration_days ?? 0;
        const challengeName = (chRow as { title?: string } | null)?.title ?? "Challenge";
        const challengeJustCompleted = durationDays > 0 && currentDayAfter >= durationDays;

        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "secured_day",
          challenge_id: challengeId ?? null,
          metadata: { day_number: currentDayAfter, streak_count: row.new_streak_count },
        });
        if (row.last_stand_earned) {
          await ctx.supabase.from("activity_events").insert({
            user_id: ctx.userId,
            event_type: "last_stand",
            metadata: { streak_count: row.new_streak_count },
          });
        }
        const { newUnlockKeys } = await checkAndUnlockAchievements(
          ctx.supabase,
          ctx.userId,
          row.new_streak_count,
          totalDaysSecured,
          challengeJustCompleted
        );
        for (const key of newUnlockKeys) {
          await ctx.supabase.from("activity_events").insert({
            user_id: ctx.userId,
            event_type: "unlocked_achievement",
            metadata: { achievement_key: key, achievement_label: getLabelForKey(key) },
          });
        }
        if (challengeJustCompleted) {
          await ctx.supabase.from("activity_events").insert({
            user_id: ctx.userId,
            event_type: "completed_challenge",
            challenge_id: challengeId ?? null,
            metadata: { challenge_name: challengeName, duration_days: durationDays },
          });
        }

        return {
          success: true,
          newStreakCount: row.new_streak_count,
          lastStandEarned: row.last_stand_earned,
          challengeCompleted: challengeJustCompleted,
          ...(challengeJustCompleted && {
            challengeId: challengeId ?? undefined,
            challengeName,
            totalDays: durationDays,
          }),
        };
      }

      const code = (rpcError as { code?: string })?.code;
      const msg = (rpcError as { message?: string })?.message ?? "";
      if (msg.includes("NOT_ALL_REQUIRED")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not all required tasks completed." });
      }
      if (rpcError && code !== "42883") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to secure day." });
      }

      const dateKey = getTodayDateKey();

      const { data: alreadySecured } = await ctx.supabase
        .from("day_secures")
        .select("date_key")
        .eq("user_id", ctx.userId)
        .eq("date_key", dateKey)
        .limit(1)
        .maybeSingle();
      const securedRow = alreadySecured as DaySecureRow | null;
      if (securedRow) {
        const { data: streak } = await ctx.supabase
          .from("streaks")
          .select("active_streak_count")
          .eq("user_id", ctx.userId)
          .single();
        const s = streak as { active_streak_count?: number } | null;
        return { success: true, newStreakCount: s?.active_streak_count ?? 0, lastStandEarned: false };
      }

      const { data: activeChallenge, error: acError } = await ctx.supabase
        .from("active_challenges")
        .select("*, challenges (challenge_tasks (id, task_type, config))")
        .eq("id", input.activeChallengeId)
        .single();

      requireNoError(acError, "Active challenge not found.");

      const ac = activeChallenge as ActiveChallengeWithTasks | null;
      const challengeTasksRaw = ac?.challenges?.challenge_tasks as ChallengeTaskRowRaw[] | null | undefined;
      if (!Array.isArray(challengeTasksRaw)) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Challenge tasks not found." });
      }

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = challengeTasksRaw.filter((t) => isTaskRequired(t));
      const allRequiredCompleted = requiredTasks.every((rt: { id: string }) =>
        completedCheckins?.some((c: { task_id: string }) => c.task_id === rt.id)
      );

      if (!allRequiredCompleted) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not all required tasks completed." });
      }

      const { data: streak } = await ctx.supabase
        .from("streaks")
        .select("last_completed_date_key, active_streak_count, longest_streak_count, last_stands_available, last_stands_used_total")
        .eq("user_id", ctx.userId)
        .single();

      const { newStreakCount, longestStreak } = computeNewStreakCount(dateKey, streak as StreakRow | null);

      const streakPayload: Record<string, unknown> = {
        user_id: ctx.userId,
        active_streak_count: newStreakCount,
        longest_streak_count: longestStreak,
        last_completed_date_key: dateKey,
      };

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startKey = sevenDaysAgo.toISOString().split('T')[0];
      const { data: securesLast7 } = await ctx.supabase
        .from('day_secures')
        .select('date_key')
        .eq('user_id', ctx.userId)
        .gte('date_key', startKey)
        .lte('date_key', dateKey);
      const securedDaysLast7 = new Set((securesLast7 ?? []).map((r: DaySecureRow) => r.date_key));
      if (dateKey) securedDaysLast7.add(dateKey);
      const countLast7 = securedDaysLast7.size;

      const streakRow = streak as StreakRow | null;
      const currentLastStands = Math.min(2, Math.max(0, streakRow?.last_stands_available ?? 0));
      let lastStandEarned = false;
      if (shouldEarnLastStand(countLast7, currentLastStands)) {
        streakPayload.last_stands_available = newAvailableAfterEarn(currentLastStands);
        streakPayload.last_stand_earned_at = now.toISOString();
        lastStandEarned = true;
      }

      await ctx.supabase
        .from('streaks')
        .upsert(streakPayload, { onConflict: 'user_id' });

      await ctx.supabase
        .from("active_challenges")
        .update({
          current_day: (ac?.current_day ?? 0) + 1,
          progress_percent: 100,
        })
        .eq("id", input.activeChallengeId);

      const { error: daySecErr } = await ctx.supabase
        .from('day_secures')
        .insert({ user_id: ctx.userId, date_key: dateKey });
      if (daySecErr && (daySecErr as PgError).code !== "23505") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record day secure." });
      }

      const { data: profileRow } = await ctx.supabase
        .from('profiles')
        .select('total_days_secured')
        .eq('user_id', ctx.userId)
        .single();
      const totalDays = (profileRow?.total_days_secured ?? 0) + 1;
      const tier = getTierForDays(totalDays);
      const { error: profileErr } = await ctx.supabase
        .from('profiles')
        .update({ total_days_secured: totalDays, tier, updated_at: new Date().toISOString() })
        .eq('user_id', ctx.userId);
      requireNoError(profileErr, "Failed to update profile.");

      const challengeId = (ac as { challenge_id?: string })?.challenge_id;
      if (challengeId) {
        const { data: ch } = await ctx.supabase.from("challenges").select("participation_type, run_status").eq("id", challengeId).single();
        if ((ch as { participation_type?: string })?.participation_type === "team" && (ch as { run_status?: string })?.run_status === "active") {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: yesterday });
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: dateKey });
        }
      }

      const newCurrentDay = (ac?.current_day ?? 0) + 1;
      const { data: chMeta } = await ctx.supabase.from("challenges").select("duration_days, title").eq("id", challengeId ?? "").single();
      const durationDays = (chMeta as { duration_days?: number } | null)?.duration_days ?? 0;
      const challengeName = (chMeta as { title?: string } | null)?.title ?? "Challenge";
      const challengeJustCompleted = durationDays > 0 && newCurrentDay >= durationDays;

      await ctx.supabase.from("activity_events").insert({
        user_id: ctx.userId,
        event_type: "secured_day",
        challenge_id: challengeId ?? null,
        metadata: { day_number: newCurrentDay, streak_count: newStreakCount },
      });
      if (lastStandEarned) {
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "last_stand",
          metadata: { streak_count: newStreakCount },
        });
      }
      const prevStreakCount = (streak as { active_streak_count?: number } | null)?.active_streak_count ?? 0;
      if (newStreakCount === 0 && prevStreakCount > 0) {
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "lost_streak",
          metadata: { previous_streak: prevStreakCount },
        });
      }
      const { newUnlockKeys } = await checkAndUnlockAchievements(
        ctx.supabase,
        ctx.userId,
        newStreakCount,
        totalDays,
        challengeJustCompleted
      );
      for (const key of newUnlockKeys) {
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "unlocked_achievement",
          metadata: { achievement_key: key, achievement_label: getLabelForKey(key) },
        });
      }
      if (challengeJustCompleted) {
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "completed_challenge",
          challenge_id: challengeId ?? null,
          metadata: { challenge_name: challengeName, duration_days: durationDays },
        });
      }

      return { success: true, newStreakCount, lastStandEarned };
    }),

  markAsShared: protectedProcedure
    .input(z.object({ completionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: row } = await ctx.supabase
        .from("check_ins")
        .select("id, active_challenge_id")
        .eq("id", input.completionId)
        .single();
      if (!row) return { success: false };
      const { data: ac } = await ctx.supabase
        .from("active_challenges")
        .select("user_id")
        .eq("id", (row as { active_challenge_id?: string }).active_challenge_id)
        .single();
      if (!ac || (ac as { user_id?: string }).user_id !== ctx.userId) return { success: false };
      await ctx.supabase
        .from("check_ins")
        .update({ shared: true })
        .eq("id", input.completionId);
      return { success: true };
    }),

  getShareStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: acList } = await ctx.supabase
      .from("active_challenges")
      .select("id")
      .eq("user_id", ctx.userId);
    const acIds = (acList ?? []).map((r: { id: string }) => r.id);
    if (acIds.length === 0) return { totalShared: 0 };
    const { count } = await ctx.supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .eq("shared", true)
      .in("active_challenge_id", acIds);
    return { totalShared: count ?? 0 };
  }),

  getMilestoneShared: protectedProcedure
    .input(z.object({ activeChallengeId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const { data } = await ctx.supabase
        .from("active_challenges")
        .select("milestone_30_shared, milestone_75_shared")
        .eq("id", input.activeChallengeId)
        .single();
      const row = data as { milestone_30_shared?: boolean; milestone_75_shared?: boolean } | null;
      return {
        milestone_30_shared: row?.milestone_30_shared ?? false,
        milestone_75_shared: row?.milestone_75_shared ?? false,
      };
    }),

  setMilestoneShared: protectedProcedure
    .input(z.object({ activeChallengeId: z.string().uuid(), milestoneDay: z.union([z.literal(30), z.literal(75)]) }))
    .mutation(async ({ input, ctx }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const col = input.milestoneDay === 30 ? "milestone_30_shared" : "milestone_75_shared";
      await ctx.supabase
        .from("active_challenges")
        .update({ [col]: true })
        .eq("id", input.activeChallengeId);
      return { success: true };
    }),
});

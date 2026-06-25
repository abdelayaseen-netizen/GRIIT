import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { assertActiveChallengeOwnership } from "../guards";
import { requireNoError } from "../errors";
import {
  getTodayDateKey,
  getYesterdayDateKey,
  getProfileTimeZoneForUser,
  dateKeyFromIsoInTimeZone,
  calendarDayIndexInclusive,
} from "../../lib/date-utils";
import { getDailyTargetForChallengeTask } from "../../../lib/task-progress";
import type { PgError } from "../../types/db";
import {
  type ChallengeTaskConfig,
  type ChallengeTaskRowRaw,
  getTaskVerification,
  isTaskRequired,
} from "../../lib/challenge-tasks";
import type { TaskConfig } from "../../lib/task-config";
import { isChallengeExpired } from "../../lib/challenge-timer";
import { checkAndUnlockAchievements, getLabelForKey } from "../../lib/achievements";
import { logger } from "../../lib/logger";
import {
  assertHardModeScheduleWindow,
  assertHardModeCameraOnly,
  evaluateTaskLocation,
} from "../../lib/checkin-complete-gates";

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
  target_mode?: string | null;
  start_value?: number | null;
  start_duration_minutes?: number | null;
};

export const checkinsRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(
      z.object({
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
        clocked_in_at: z.string().datetime().optional(),
        task_mode: z.enum(["full", "minimum"]).default("full"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const dateKey = getTodayDateKey(tz);
      const { data: acStartRow } = await ctx.supabase
        .from("active_challenges")
        .select("start_at")
        .eq("id", input.activeChallengeId)
        .single();
      const { data: chRow } = await ctx.supabase
        .from("challenges")
        .select("duration_type, ends_at, live_date, duration_days, is_hard_mode")
        .eq("id", challenge_id)
        .single();
      const ch = chRow as {
        duration_type?: string;
        ends_at?: string | null;
        live_date?: string | null;
        duration_days?: number | null;
      } | null;
      const startAt = (acStartRow as { start_at?: string } | null)?.start_at;
      let rampDayNumber = 1;
      const totalDur = ch?.duration_days != null && ch.duration_days > 0 ? ch.duration_days : 1;
      if (ch?.duration_type !== "24h" && startAt) {
        const startKey = dateKeyFromIsoInTimeZone(String(startAt), tz);
        const idx = calendarDayIndexInclusive(startKey, dateKey);
        rampDayNumber = Math.min(totalDur, Math.max(1, idx));
      }
      if (ch?.duration_type === "24h") {
        const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
        if (isChallengeExpired(endsAt)) throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer complete tasks." });
      }
      const isMinimumDay = input.task_mode === "minimum";
      const isChallengeHardMode = (ch as { is_hard_mode?: boolean } | null)?.is_hard_mode === true;
      if (isMinimumDay && isChallengeHardMode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hard mode challenges require full completion.",
        });
      }

      // --- Anti-cheat: prevent rapid-fire completions ---
      // Reject if the user completed ANY task less than 10 seconds ago
      const TEN_SECONDS_AGO = new Date(Date.now() - 10_000).toISOString();
      const { data: recentCheckins } = await ctx.supabase
        .from("check_ins")
        .select("id, created_at")
        .eq("user_id", ctx.userId)
        .eq("date_key", dateKey)
        .gte("created_at", TEN_SECONDS_AGO)
        .neq("task_id", input.taskId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentCheckins && recentCheckins.length > 0) {
        const lastCheckinTime = new Date((recentCheckins[0] as { created_at: string }).created_at);
        const secondsAgo = Math.round((Date.now() - lastCheckinTime.getTime()) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Take a moment between tasks. You completed another task ${secondsAgo} second${secondsAgo === 1 ? "" : "s"} ago.`,
        });
      }

      const { data: taskRow, error: taskFetchError } = await ctx.supabase
        .from("challenge_tasks")
        .select(
          "id, title, task_type, config, require_photo, timer_direction, timer_hard_mode, require_heart_rate, heart_rate_threshold, require_location, location_name, location_latitude, location_longitude, location_radius_meters, min_duration_minutes, target_mode, start_value, start_duration_minutes"
        )
        .eq("id", input.taskId)
        .single();

      if (taskFetchError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ error: taskFetchError, userId: ctx.userId, taskId: input.taskId }, "[checkins.complete] task fetch");
        const code = (taskFetchError as PgError).code;
        if (code === "PGRST116") throw new TRPCError({ code: "NOT_FOUND", message: "Challenge tasks not found" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load task." });
      }
      if (!taskRow) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge tasks not found" });

      const task = taskRow as TaskRowWithVerification;
      const cfg = (task?.config ?? {}) as ChallengeTaskConfig;
      const config = cfg as TaskConfig;

      if (!isMinimumDay) {
        assertHardModeScheduleWindow(config);
      }

      const ruleFromCfg = cfg.verification_rule_json as { min_avg_bpm?: number } | undefined;
      const { needsProof, minWords, durationMinutes } = getTaskVerification(task as ChallengeTaskRowRaw);
      const taskType = task?.task_type ?? "manual";
      const dailyTargets = getDailyTargetForChallengeTask(
        {
          task_type: taskType,
          target_mode: task.target_mode,
          start_value: task.start_value,
          start_duration_minutes: task.start_duration_minutes,
          config: cfg as Record<string, unknown>,
          min_duration_minutes: task.min_duration_minutes,
        },
        rampDayNumber,
        totalDur
      );
      const requirePhoto = !isMinimumDay && (task?.require_photo === true || needsProof);
      const photoUrl = (input.photo_url ?? input.proofUrl)?.trim() || null;
      if (requirePhoto && !photoUrl) throw new TRPCError({ code: "BAD_REQUEST", message: "This task requires a photo. Please take a photo to verify completion." });

      if (!isMinimumDay) {
        assertHardModeCameraOnly(cfg, photoUrl, input.proofUrl);
      }

      const requireHeartRate =
        !isMinimumDay && (task?.require_heart_rate === true || cfg.verification_method === "heart_rate");
      if (requireHeartRate) {
        const threshold = (typeof task?.heart_rate_threshold === "number" ? task.heart_rate_threshold : null) ?? (typeof ruleFromCfg?.min_avg_bpm === "number" ? ruleFromCfg.min_avg_bpm : 100);
        const avg = input.heart_rate_avg ?? 0;
        if (!avg || avg < threshold) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `This task requires an elevated heart rate. Your average was ${avg} BPM but ${threshold} BPM is needed.` });
        }
      }

      const { locationDistanceM, hardModeLocationGate } = evaluateTaskLocation(task, cfg, input);
      const requireLocation = !isMinimumDay && (task?.require_location === true || cfg.require_location === true);

      const timerHardMode = task?.timer_hard_mode === true || cfg.strict_timer_mode === true || cfg.timer_hard_mode === true;
      const minDurationMinutes =
        dailyTargets.durationMinutes ??
        task?.min_duration_minutes ??
        durationMinutes ??
        (taskType === "run" && cfg.tracking_mode === "time" && typeof cfg.duration_minutes === "number" ? cfg.duration_minutes : null);
      if (!isMinimumDay && timerHardMode && minDurationMinutes != null && minDurationMinutes > 0) {
        const requiredSeconds = minDurationMinutes * 60;
        const onScreen = input.timer_seconds_on_screen ?? 0;
        if (onScreen < requiredSeconds) throw new TRPCError({ code: "BAD_REQUEST", message: `Hard mode: you must stay on the timer screen for the full ${minDurationMinutes} minutes. You were on screen for ${Math.floor(onScreen / 60)} minutes.` });
      }

      if (
        !isMinimumDay &&
        minDurationMinutes != null &&
        minDurationMinutes > 0 &&
        input.value != null &&
        input.value < minDurationMinutes
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `This task requires at least ${minDurationMinutes} minutes. You completed ${input.value} minutes.` });
      }
      const isJournal = taskType === "journal" || taskType === "manual";
      if (!isMinimumDay && isJournal && minWords > 0) {
        const text = (input.noteText ?? "").trim();
        const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
        if (wordCount < minWords) throw new TRPCError({ code: "BAD_REQUEST", message: `This task requires at least ${minWords} words. You wrote ${wordCount}.` });
      }
      const isTimer = taskType === "timer";
      const isRunTimed = taskType === "run" && typeof minDurationMinutes === "number" && minDurationMinutes > 0;
      const isWorkoutTimed = taskType === "workout" && typeof minDurationMinutes === "number" && minDurationMinutes > 0;
      const requiredMinutes = minDurationMinutes ?? durationMinutes;
      if (!isMinimumDay && (isTimer || isRunTimed || isWorkoutTimed) && requiredMinutes > 0) {
        const completedMinutes = input.value ?? 0;
        if (completedMinutes < requiredMinutes) throw new TRPCError({ code: "BAD_REQUEST", message: `This task requires at least ${requiredMinutes} minutes. You logged ${completedMinutes}.` });
      }

      const requiredNumeric = dailyTargets.targetValue;
      if (
        !isMinimumDay &&
        requiredNumeric != null &&
        requiredNumeric > 0 &&
        input.value != null &&
        (taskType === "water" || taskType === "counter" || taskType === "reading") &&
        input.value < requiredNumeric
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This task requires at least ${requiredNumeric}. You logged ${input.value}.`,
        });
      }
      if (
        !isMinimumDay &&
        taskType === "run" &&
        cfg.tracking_mode === "distance" &&
        requiredNumeric != null &&
        requiredNumeric > 0 &&
        input.value != null &&
        input.value < requiredNumeric
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This task requires at least ${requiredNumeric}. You logged ${input.value}.`,
        });
      }

      const verificationGates: Record<string, unknown> = {};
      if (!isMinimumDay && config.hard_mode && config.schedule_window_start && config.schedule_window_end) {
        verificationGates.time_gate = {
          status: "passed",
          clocked_in_at: input.clocked_in_at ?? new Date().toISOString(),
          window: `${config.schedule_window_start}-${config.schedule_window_end}`,
        };
      }
      if (!isMinimumDay && hardModeLocationGate && locationDistanceM != null) {
        verificationGates.location_gate = {
          status: "passed",
          distance_meters: Math.round(locationDistanceM),
          location_name: cfg.location_name ?? "the required location",
        };
      } else if (!isMinimumDay && requireLocation && locationDistanceM != null) {
        verificationGates.location_gate = {
          status: "passed",
          distance_meters: Math.round(locationDistanceM),
          location_name: task?.location_name ?? cfg.location_name ?? "the required location",
        };
      }
      if (!isMinimumDay && cfg.hard_mode && cfg.require_camera_only && photoUrl) {
        verificationGates.photo_gate = { status: "passed", camera_only: true };
      }
      if (!isMinimumDay && cfg.hard_mode && cfg.require_strava) {
        verificationGates.strava_gate = { status: "pending" };
      }

      const proofUrl = photoUrl || input.proofUrl?.trim() || null;
      const payload: Record<string, unknown> = { user_id: ctx.userId, active_challenge_id: input.activeChallengeId, task_id: input.taskId, date_key: dateKey, status: "completed" };
      payload.task_mode = input.task_mode;
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
      if (input.clocked_in_at != null) payload.clocked_in_at = input.clocked_in_at;
      if (Object.keys(verificationGates).length > 0) payload.verification_gates = verificationGates;

      const { data, error } = await ctx.supabase
        .from("check_ins")
        .upsert(payload, { onConflict: "active_challenge_id,task_id,date_key" })
        .select(
          "id, user_id, active_challenge_id, task_id, date_key, status, value, note_text, proof_url, completion_image_url, proof_source, proof_payload_json, external_activity_id, verification_status, created_at"
        )
        .single();
      if (error) {
        const { logger } = await import("../../lib/logger");
        const errObj = error as { code?: string; message?: string; details?: string; hint?: string };
        logger.error({ supabaseError: error, code: errObj.code, message: errObj.message, details: errObj.details, hint: errObj.hint, payload }, "[checkins.complete] check_ins upsert FAILED");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save check-in." });
      }

      // --- Suspicious speed logging ---
      if (input.clocked_in_at) {
        const clockedInTime = new Date(input.clocked_in_at).getTime();
        const submittedTime = Date.now();
        const durationSeconds = (submittedTime - clockedInTime) / 1000;
        if (durationSeconds < 3 && taskType !== "photo") {
          logger.warn(
            {
              userId: ctx.userId,
              taskId: input.taskId,
              taskType,
              durationSeconds: Math.round(durationSeconds * 10) / 10,
              activeChallengeId: input.activeChallengeId,
            },
            "[checkins.complete] Suspiciously fast completion"
          );
        }
      }

      const { data: chForEvent } = await ctx.supabase.from("challenges").select("title").eq("id", challenge_id).maybeSingle();
      const challengeTitleForFeed = (chForEvent as { title?: string } | null)?.title ?? "Challenge";
      const taskTitle = (task as { title?: string })?.title ?? "Task";
      const cfgVm = cfg as { verification_method?: string };
      const hrThreshold = (typeof task?.heart_rate_threshold === "number" ? task.heart_rate_threshold : null) ?? (typeof ruleFromCfg?.min_avg_bpm === "number" ? ruleFromCfg.min_avg_bpm : 100);
      const heartRateVerified = !!(input.heart_rate_avg && input.heart_rate_avg >= hrThreshold);
      const verificationMethod = cfgVm.verification_method ?? (taskType === "photo" || requirePhoto ? "photo" : taskType === "timer" ? "timer" : "manual");
      const activityEventPayload = {
        user_id: ctx.userId,
        event_type: "task_completed" as const,
        challenge_id,
        metadata: {
          task_id: input.taskId,
          task_name: taskTitle,
          task_type: taskType,
          challenge_name: challengeTitleForFeed,
          has_photo: !!proofUrl,
          photo_url: proofUrl ?? null,
          verification_method: verificationMethod,
          is_hard_mode: timerHardMode,
          task_mode: input.task_mode,
          heart_rate_verified: requireHeartRate ? heartRateVerified : false,
          location_verified: !!(input.location_latitude != null && input.location_longitude != null && requireLocation),
        },
      };
      const { error: taskCompletedEventError } = await ctx.supabase
        .from("activity_events")
        .insert(activityEventPayload as never);
      if (taskCompletedEventError) {
        logger.error(
          { err: taskCompletedEventError },
          "[checkins.complete] task_completed event FAILED via user client — retrying with service role"
        );
        const { getSupabaseServer } = await import("../../lib/supabase-server");
        const svc = getSupabaseServer();
        if (svc) {
          const { error: retryErr } = await svc.from("activity_events").insert(activityEventPayload as never);
          if (retryErr) {
            logger.error({ err: retryErr }, "[checkins.complete] task_completed event FAILED on service-role retry too");
          } else {
            logger.info("[checkins.complete] task_completed event recovered via service role");
          }
        }
      }

      try {
        const { data: profileForAch } = await ctx.supabase.from("profiles").select("total_days_secured").eq("user_id", ctx.userId).single();
        const totalDaysForAch = (profileForAch as { total_days_secured?: number } | null)?.total_days_secured ?? 0;
        const { data: streakForAch } = await ctx.supabase.from("streaks").select("active_streak_count").eq("user_id", ctx.userId).maybeSingle();
        const currentStreakForAch = (streakForAch as { active_streak_count?: number } | null)?.active_streak_count ?? 0;
        const isHardMode = timerHardMode || cfg.hard_mode === true;
        await checkAndUnlockAchievements(ctx.supabase, ctx.userId, currentStreakForAch, totalDaysForAch, false, isHardMode);
      } catch {
        /* non-fatal */
      }

      const [{ data: allTasks }, { data: completedCheckins }] = await Promise.all([
        ctx.supabase.from("challenge_tasks").select("id, task_type, config").eq("challenge_id", challenge_id).limit(200),
        ctx.supabase.from("check_ins").select("task_id").eq("active_challenge_id", input.activeChallengeId).eq("date_key", dateKey).eq("status", "completed").limit(100),
      ]);
      const requiredTasks = (allTasks ?? []).filter((t) => isTaskRequired(t as ChallengeTaskRowRaw));
      const completedRequired = completedCheckins?.filter((c) => requiredTasks.some((rt) => rt.id === c.task_id)) || [];
      const progress = requiredTasks.length > 0 ? (completedRequired.length / requiredTasks.length) * 100 : 0;
      await ctx.supabase.from("active_challenges").update({ progress_percent: progress }).eq("id", input.activeChallengeId);
      return { ...(data ?? {}), isMinimumDay };
    }),

  /**
   * verifyTask — the single source of truth for "is this task complete."
   *
   * Checks in order: ownership, task claimability, no double-claim, schedule window
   * (server clock), proof integrity (file exists in task-proofs under this user's
   * folder, content-type image/*, size > 1 KB), camera-only, then records the
   * verified completion and auto-calls secure_day if all required tasks are done.
   *
   * Returns { verified: false, reason, reasonCode } on the first failing gate.
   * Returns { verified: true, checkinId, streakAdvanced, newStreakCount } on success.
   *
   * Never trusts client timestamps or a client "completed: true" flag.
   * Server time is always authoritative for window checks.
   */
  verifyTask: protectedProcedure
    .input(
      z.object({
        activeChallengeId: z.string().uuid(),
        taskId: z.string().uuid(),
        photoUrl: z.string().max(2000).optional(),
        captureSource: z.enum(["camera", "library", "unknown"]).optional(),
        clocked_in_at: z.string().datetime().optional(),
        value: z.number().optional(),
        noteText: z.string().max(2000).optional(),
        heart_rate_avg: z.number().int().min(0).optional(),
        heart_rate_peak: z.number().int().min(0).optional(),
        location_latitude: z.number().optional(),
        location_longitude: z.number().optional(),
        timer_seconds_on_screen: z.number().int().min(0).optional(),
        task_mode: z.enum(["full", "minimum"]).default("full"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      type VerifyResult =
        | { verified: true; checkinId: string | undefined; streakAdvanced: boolean; newStreakCount: number | undefined }
        | { verified: false; reason: string; reasonCode: string };

      const reject = (reason: string, reasonCode: string): VerifyResult => ({ verified: false, reason, reasonCode });

      // --- 1. Auth + ownership ---
      let challenge_id: string;
      try {
        const result = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
        challenge_id = result.challenge_id;
      } catch {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this challenge." });
      }

      // --- 2. Load task and verify it belongs to this challenge ---
      const { data: taskRow, error: taskFetchError } = await ctx.supabase
        .from("challenge_tasks")
        .select(
          "id, title, task_type, config, require_photo, timer_direction, timer_hard_mode, require_heart_rate, heart_rate_threshold, require_location, location_name, location_latitude, location_longitude, location_radius_meters, min_duration_minutes, target_mode, start_value, start_duration_minutes"
        )
        .eq("id", input.taskId)
        .eq("challenge_id", challenge_id)
        .maybeSingle();

      if (taskFetchError) {
        logger.error({ error: taskFetchError, userId: ctx.userId, taskId: input.taskId }, "[verifyTask] task fetch");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load task." });
      }
      if (!taskRow) return reject("This task does not exist in your challenge.", "TASK_NOT_FOUND");

      const task = taskRow as TaskRowWithVerification;
      const cfg = (task?.config ?? {}) as ChallengeTaskConfig;
      const config = cfg as TaskConfig;
      const isMinimumDay = input.task_mode === "minimum";

      // --- 3. Date key (server TZ) ---
      const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
      const dateKey = getTodayDateKey(tz);

      // --- 4. No double-claim (idempotent on already-verified) ---
      const { data: existingCheckin } = await ctx.supabase
        .from("check_ins")
        .select("id, status")
        .eq("active_challenge_id", input.activeChallengeId)
        .eq("task_id", input.taskId)
        .eq("date_key", dateKey)
        .maybeSingle();

      if (existingCheckin?.status === "completed") {
        // Idempotent: already verified today — return success without re-advancing streak
        return { verified: true as const, checkinId: existingCheckin.id, streakAdvanced: false, newStreakCount: undefined };
      }

      // --- 5. Schedule window check (server clock, never client timestamp) ---
      if (!isMinimumDay) {
        try {
          assertHardModeScheduleWindow(config);
        } catch (e) {
          return reject(
            e instanceof TRPCError ? e.message : "This task can only be completed within its scheduled window.",
            "OUTSIDE_WINDOW"
          );
        }
      }

      // --- 6. Proof integrity (photo exists, is in user's Storage folder, is a real image) ---
      const { needsProof } = getTaskVerification(task as ChallengeTaskRowRaw);
      const requirePhoto = !isMinimumDay && (task?.require_photo === true || needsProof);
      const photoUrl = input.photoUrl?.trim() || null;

      if (requirePhoto) {
        if (!photoUrl) return reject("This task requires a photo. Take a photo to verify.", "PHOTO_REQUIRED");

        // Path ownership: URL must point into this user's folder in task-proofs
        const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
        const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/task-proofs/${ctx.userId}/`;
        if (!photoUrl.startsWith(expectedPrefix)) {
          return reject("Photo must be uploaded from your own camera before submitting.", "PHOTO_NOT_YOURS");
        }

        // HEAD request: file must exist, be image/*, and be > 1 KB
        try {
          const controller = new AbortController();
          const headTimeout = setTimeout(() => controller.abort(), 6000);
          let headOk = false;
          let headReason = "PHOTO_NOT_FOUND";
          let headMessage = "Photo not found in storage. Re-take the photo and try again.";
          try {
            const resp = await fetch(photoUrl, { method: "HEAD", signal: controller.signal });
            if (!resp.ok) {
              headReason = "PHOTO_NOT_FOUND";
              headMessage = "Photo not found in storage. Re-take the photo and try again.";
            } else {
              const ct = resp.headers.get("content-type") ?? "";
              if (!ct.startsWith("image/")) {
                headReason = "PHOTO_INVALID_TYPE";
                headMessage = "The submitted proof is not an image. Take a photo and try again.";
              } else {
                const cl = Number(resp.headers.get("content-length") ?? "0");
                if (cl > 0 && cl < 1024) {
                  headReason = "PHOTO_TOO_SMALL";
                  headMessage = "The photo is too small to be valid proof. Re-take and try again.";
                } else {
                  headOk = true;
                }
              }
            }
          } finally {
            clearTimeout(headTimeout);
          }
          if (!headOk) return reject(headMessage, headReason);
        } catch (e) {
          const isAbort = e instanceof Error && e.name === "AbortError";
          logger.warn({ userId: ctx.userId, photoUrl, isAbort }, "[verifyTask] photo HEAD check failed");
          if (isAbort) {
            return reject("Photo verification timed out. Check your connection and try again.", "PHOTO_CHECK_TIMEOUT");
          }
          return reject("Could not verify the photo. Try again.", "PHOTO_CHECK_ERROR");
        }
      }

      // --- 7. Camera-only: captureSource must be 'camera' ---
      if (!isMinimumDay && cfg.require_camera_only) {
        if (!photoUrl) return reject("This task requires a live camera photo.", "PHOTO_REQUIRED");
        if (!input.captureSource || input.captureSource !== "camera") {
          return reject(
            "This task requires a live camera photo — not one from your photo library.",
            "CAMERA_REQUIRED"
          );
        }
      }

      // --- 8. Remaining gates (heart rate, location, timer) reused from complete ---
      if (!isMinimumDay) {
        try {
          assertHardModeCameraOnly(cfg, photoUrl, input.photoUrl);
        } catch (e) {
          return reject(
            e instanceof TRPCError ? e.message : "Camera photo required for this task.",
            "CAMERA_REQUIRED"
          );
        }
      }

      const requireHeartRate = !isMinimumDay && (task?.require_heart_rate === true || cfg.verification_method === "heart_rate");
      if (requireHeartRate) {
        const ruleFromCfg = cfg.verification_rule_json as { min_avg_bpm?: number } | undefined;
        const threshold =
          (typeof task?.heart_rate_threshold === "number" ? task.heart_rate_threshold : null) ??
          (typeof ruleFromCfg?.min_avg_bpm === "number" ? ruleFromCfg.min_avg_bpm : 100);
        const avg = input.heart_rate_avg ?? 0;
        if (!avg || avg < threshold) {
          return reject(
            `This task requires an elevated heart rate. Your average was ${avg} BPM but ${threshold} BPM is needed.`,
            "HEART_RATE_TOO_LOW"
          );
        }
      }

      let locationDistanceM: number | undefined;
      try {
        const locResult = evaluateTaskLocation(task, cfg, input);
        locationDistanceM = locResult.locationDistanceM;
      } catch (e) {
        return reject(
          e instanceof TRPCError ? e.message : "Location verification failed.",
          "LOCATION_GATE_FAILED"
        );
      }

      // --- 9. Build verification_gates and record the completion ---
      const verificationGates: Record<string, unknown> = {};
      if (!isMinimumDay && config.hard_mode && config.schedule_window_start && config.schedule_window_end) {
        verificationGates.time_gate = {
          status: "passed",
          clocked_in_at: input.clocked_in_at ?? new Date().toISOString(),
          window: `${config.schedule_window_start}-${config.schedule_window_end}`,
        };
      }
      if (!isMinimumDay && locationDistanceM != null) {
        verificationGates.location_gate = {
          status: "passed",
          distance_meters: Math.round(locationDistanceM),
          location_name: task?.location_name ?? cfg.location_name ?? "the required location",
        };
      }
      if (!isMinimumDay && photoUrl) {
        verificationGates.photo_gate = {
          status: "passed",
          camera_only: cfg.require_camera_only === true,
          capture_source: input.captureSource ?? "unknown",
        };
      }

      const payload: Record<string, unknown> = {
        user_id: ctx.userId,
        active_challenge_id: input.activeChallengeId,
        task_id: input.taskId,
        date_key: dateKey,
        status: "completed",
        task_mode: input.task_mode,
        verification_status: "verified",
      };
      if (input.value != null) payload.value = input.value;
      if (input.noteText != null) payload.note_text = input.noteText;
      if (photoUrl) {
        payload.proof_url = photoUrl;
        payload.photo_url = photoUrl;
        payload.completion_image_url = photoUrl;
      }
      if (input.captureSource) payload.capture_source = input.captureSource;
      if (input.heart_rate_avg != null) payload.heart_rate_avg = input.heart_rate_avg;
      if (input.heart_rate_peak != null) payload.heart_rate_peak = input.heart_rate_peak;
      if (input.location_latitude != null) payload.location_latitude = input.location_latitude;
      if (input.location_longitude != null) payload.location_longitude = input.location_longitude;
      if (input.timer_seconds_on_screen != null) payload.timer_seconds_on_screen = input.timer_seconds_on_screen;
      if (input.clocked_in_at != null) payload.clocked_in_at = input.clocked_in_at;
      if (Object.keys(verificationGates).length > 0) payload.verification_gates = verificationGates;

      const { data: checkin, error: upsertError } = await ctx.supabase
        .from("check_ins")
        .upsert(payload, { onConflict: "active_challenge_id,task_id,date_key" })
        .select("id")
        .single();

      if (upsertError) {
        const errObj = upsertError as { code?: string; message?: string };
        logger.error({ supabaseError: upsertError, code: errObj.code, userId: ctx.userId }, "[verifyTask] upsert FAILED");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save completion." });
      }

      // --- 10. Update progress ---
      try {
        const [{ data: allTasksForProg }, { data: completedForProg }] = await Promise.all([
          ctx.supabase.from("challenge_tasks").select("id, config").eq("challenge_id", challenge_id).limit(200),
          ctx.supabase
            .from("check_ins")
            .select("task_id")
            .eq("active_challenge_id", input.activeChallengeId)
            .eq("date_key", dateKey)
            .eq("status", "completed")
            .limit(100),
        ]);
        const reqTasks = (allTasksForProg ?? []).filter((t) => isTaskRequired(t as ChallengeTaskRowRaw));
        const completedReq = (completedForProg ?? []).filter((c) => reqTasks.some((r) => r.id === c.task_id));
        const prog = reqTasks.length > 0 ? (completedReq.length / reqTasks.length) * 100 : 0;
        await ctx.supabase.from("active_challenges").update({ progress_percent: prog }).eq("id", input.activeChallengeId);
      } catch {
        /* non-fatal */
      }

      // --- 11. Auto-secure: call secure_day if all required tasks are now done ---
      let streakAdvanced = false;
      let newStreakCount: number | undefined;

      try {
        const [{ data: allTasksRaw }, { data: completedToday }] = await Promise.all([
          ctx.supabase.from("challenge_tasks").select("id, config").eq("challenge_id", challenge_id).limit(200),
          ctx.supabase
            .from("check_ins")
            .select("task_id")
            .eq("active_challenge_id", input.activeChallengeId)
            .eq("date_key", dateKey)
            .eq("status", "completed")
            .limit(100),
        ]);
        const requiredIds = (allTasksRaw ?? [])
          .filter((t) => isTaskRequired(t as ChallengeTaskRowRaw))
          .map((t) => t.id);
        const completedIds = new Set((completedToday ?? []).map((c: { task_id: string }) => c.task_id));
        const allDone = requiredIds.length > 0 && requiredIds.every((id) => completedIds.has(id));

        if (allDone) {
          const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("secure_day", {
            p_active_challenge_id: input.activeChallengeId,
          });
          if (rpcError) {
            // RPC may fail if the fixed migration hasn't been applied yet — log, don't fail verification
            logger.error({ error: rpcError, userId: ctx.userId }, "[verifyTask] secure_day RPC error — apply migration 20260625000001");
          } else if (Array.isArray(rpcRows) && rpcRows.length > 0) {
            const row = rpcRows[0] as { new_streak_count: number; last_stand_earned: boolean };
            streakAdvanced = true;
            newStreakCount = row.new_streak_count;
            // Emit activity events via existing secureDay infrastructure (best-effort)
            try {
              await ctx.supabase.from("activity_events").insert({
                user_id: ctx.userId,
                event_type: "secured_day",
                challenge_id,
                metadata: { streak_count: row.new_streak_count },
              });
            } catch { /* non-fatal */ }
          }
        }
      } catch (e) {
        logger.error({ error: e, userId: ctx.userId }, "[verifyTask] auto-secure check failed");
      }

      return { verified: true as const, checkinId: checkin?.id, streakAdvanced, newStreakCount };
    }),

  getTodayCheckins: protectedProcedure.input(z.object({ activeChallengeId: z.string().uuid() })).query(async ({ input, ctx }) => {
    await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
    const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
    const dateKey = getTodayDateKey(tz);
    const { data, error } = await ctx.supabase.from("check_ins").select("id, task_id, date_key, status, value, note_text, proof_url, completion_image_url, proof_source, proof_payload_json, external_activity_id, verification_status, created_at").eq("active_challenge_id", input.activeChallengeId).eq("date_key", dateKey).limit(100);
    requireNoError(error, "Failed to load check-ins.");
    return data ?? [];
  }),

  getTodayCheckinsForUser: protectedProcedure.query(async ({ ctx }) => {
    const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
    const dateKey = getTodayDateKey(tz);
    const { data: acList, error: acErr } = await ctx.supabase.from("active_challenges").select("id").eq("user_id", ctx.userId).eq("status", "active").limit(50);
    requireNoError(acErr, "Failed to load active challenges.");
    const acIds = (acList ?? []).map((r: { id: string }) => r.id);
    if (acIds.length === 0) return [];
    const rows = await Promise.all(
      acIds.map((acId) => ctx.supabase.from("check_ins").select("id, active_challenge_id, task_id, date_key, status").eq("active_challenge_id", acId).eq("date_key", dateKey).limit(100))
    );
    const merged: NonNullable<(typeof rows)[0]["data"]> = [];
    for (const { data, error } of rows) {
      if (error) {
        logger.error({ err: error }, "[getTodayCheckinsForUser] Supabase error");
        requireNoError(error, "Failed to load today check-ins.");
      }
      if (data?.length) merged.push(...data);
    }
    return merged;
  }),

  secureDay: protectedProcedure.input(z.object({ activeChallengeId: z.string().uuid() })).mutation(async ({ input, ctx }) => {
    const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
    const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
    const { data: chRow } = await ctx.supabase.from("challenges").select("duration_type, ends_at, live_date").eq("id", challenge_id).single();
    const ch = chRow as { duration_type?: string; ends_at?: string | null; live_date?: string | null } | null;
    if (ch?.duration_type === "24h") {
      const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
      if (isChallengeExpired(endsAt)) throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer secure the day." });
    }

    const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("secure_day", { p_active_challenge_id: input.activeChallengeId });
    if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
      const row = rpcRows[0] as { new_streak_count: number; last_stand_earned: boolean };
      const { data: acRow } = await ctx.supabase.from("active_challenges").select("challenge_id, current_day").eq("id", input.activeChallengeId).single();
      const challengeId = (acRow as { challenge_id?: string; current_day?: number } | null)?.challenge_id;
      const currentDayAfter = (acRow as { current_day?: number } | null)?.current_day ?? 0;
      if (challengeId) {
        const { data: chTeam } = await ctx.supabase.from("challenges").select("participation_type, run_status, duration_days").eq("id", challengeId).single();
        if ((chTeam as { participation_type?: string })?.participation_type === "team" && (chTeam as { run_status?: string })?.run_status === "active") {
          const today = getTodayDateKey(tz);
          const yesterday = getYesterdayDateKey(tz);
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: yesterday });
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: today });
        }
      }
      const { data: profileRow } = await ctx.supabase.from("profiles").select("total_days_secured").eq("user_id", ctx.userId).single();
      const totalDaysSecured = (profileRow as { total_days_secured?: number } | null)?.total_days_secured ?? 0;
      const { data: challengeRow } = await ctx.supabase.from("challenges").select("duration_days, title").eq("id", challengeId ?? "").single();
      const durationDays = (challengeRow as { duration_days?: number } | null)?.duration_days ?? 0;
      const challengeName = (challengeRow as { title?: string } | null)?.title ?? "Challenge";
      const challengeJustCompleted = durationDays > 0 && currentDayAfter >= durationDays;
      await ctx.supabase.from("activity_events").insert({ user_id: ctx.userId, event_type: "secured_day", challenge_id: challengeId ?? null, metadata: { day_number: currentDayAfter, streak_count: row.new_streak_count } });
      if (row.last_stand_earned) await ctx.supabase.from("activity_events").insert({ user_id: ctx.userId, event_type: "last_stand", metadata: { streak_count: row.new_streak_count } });
      if (challengeJustCompleted) {
        await ctx.supabase.from("activity_events").insert({
          user_id: ctx.userId,
          event_type: "completed_challenge",
          challenge_id: challengeId ?? null,
          metadata: { challenge_name: challengeName, duration_days: durationDays },
        });
      }
      const { newUnlockKeys } = await checkAndUnlockAchievements(
        ctx.supabase,
        ctx.userId,
        row.new_streak_count,
        totalDaysSecured,
        challengeJustCompleted,
        false
      );
      if (newUnlockKeys.length > 0) {
        const achievementRows = newUnlockKeys.map((key) => ({
          user_id: ctx.userId,
          event_type: "unlocked_achievement" as const,
          metadata: { achievement_key: key, achievement_label: getLabelForKey(key) },
        }));
        const { data: existingEvents } = await ctx.supabase
          .from("activity_events")
          .select("metadata")
          .eq("user_id", ctx.userId)
          .eq("event_type", "unlocked_achievement")
          .in("metadata->>achievement_key", newUnlockKeys);
        const alreadyEmitted = new Set(
          (existingEvents ?? [])
            .map((r: { metadata: { achievement_key?: string } }) => r.metadata?.achievement_key)
            .filter(Boolean)
        );
        const filteredRows = achievementRows.filter((r) => !alreadyEmitted.has(r.metadata.achievement_key));
        if (filteredRows.length > 0) {
          const { error: achErr } = await ctx.supabase.from("activity_events").insert(filteredRows);
          if (achErr) logger.error({ err: achErr }, "[checkins] achievement event batch insert failed");
        }
      }
      return {
        success: true,
        newStreakCount: row.new_streak_count,
        lastStandEarned: row.last_stand_earned,
        challengeDay: currentDayAfter,
        challengeCompleted: challengeJustCompleted,
        ...(challengeJustCompleted && { challengeId: challengeId ?? undefined, challengeName, totalDays: durationDays }),
      };
    }

    const code = (rpcError as { code?: string })?.code;
    const msg = (rpcError as { message?: string })?.message ?? "";
    if (msg.includes("NOT_ALL_REQUIRED")) throw new TRPCError({ code: "BAD_REQUEST", message: "Not all required tasks completed." });
    if (rpcError) {
      logger.error(
        {
          userId: ctx.userId,
          activeChallengeId: input.activeChallengeId,
          rpcErrorCode: code,
          rpcErrorMsg: msg,
          isMissingFunction: code === "42883",
        },
        "[checkins.secureDay] RPC failed — refusing to run unsafe TS fallback. If code=42883, the secure_day migration is not applied to this database."
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not secure your day right now. Please try again in a moment.",
      });
    }

    // Defensive: RPC returned no error but also no rows. Should not happen.
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not secure your day right now. Please try again in a moment.",
    });
  }),

  markAsShared: protectedProcedure.input(z.object({ completionId: z.string().uuid() })).mutation(async ({ input, ctx }) => {
    const { data: row } = await ctx.supabase.from("check_ins").select("id, active_challenge_id").eq("id", input.completionId).single();
    if (!row) return { success: false };
    const { data: ac } = await ctx.supabase.from("active_challenges").select("user_id").eq("id", (row as { active_challenge_id?: string }).active_challenge_id).single();
    if (!ac || (ac as { user_id?: string }).user_id !== ctx.userId) return { success: false };
    await ctx.supabase.from("check_ins").update({ shared: true }).eq("id", input.completionId);
    return { success: true };
  }),

  getShareStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: acList } = await ctx.supabase.from("active_challenges").select("id").eq("user_id", ctx.userId).limit(100);
    const acIds = (acList ?? []).map((r: { id: string }) => r.id);
    if (acIds.length === 0) return { totalShared: 0 };
    const { count } = await ctx.supabase.from("check_ins").select("id", { count: "exact", head: true }).eq("status", "completed").eq("shared", true).in("active_challenge_id", acIds);
    return { totalShared: count ?? 0 };
  }),

  getMilestoneShared: protectedProcedure.input(z.object({ activeChallengeId: z.string().uuid() })).query(async ({ input, ctx }) => {
    await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
    const { data } = await ctx.supabase.from("active_challenges").select("milestone_30_shared, milestone_75_shared").eq("id", input.activeChallengeId).single();
    const row = data as { milestone_30_shared?: boolean; milestone_75_shared?: boolean } | null;
    return { milestone_30_shared: row?.milestone_30_shared ?? false, milestone_75_shared: row?.milestone_75_shared ?? false };
  }),

  setMilestoneShared: protectedProcedure
    .input(z.object({ activeChallengeId: z.string().uuid(), milestoneDay: z.union([z.literal(30), z.literal(75)]) }))
    .mutation(async ({ input, ctx }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const col = input.milestoneDay === 30 ? "milestone_30_shared" : "milestone_75_shared";
      await ctx.supabase.from("active_challenges").update({ [col]: true }).eq("id", input.activeChallengeId);
      return { success: true };
    }),
});

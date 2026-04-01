import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import {
  type ChallengeTaskRowRaw,
  mapTaskRowsToApi,
  buildTaskInsertPayload,
} from "../../lib/challenge-tasks";
import { joinChallengeDirect } from "../../lib/join-challenge";
import { logger } from "../../lib/logger";

/** Auto-join creator after insert; non-fatal on failure. Inserts joined_challenge activity when join succeeds. */
async function autoJoinCreatorAfterCreate(
  supabase: Parameters<typeof joinChallengeDirect>[0],
  userId: string,
  challengeId: string,
  challengeName: string,
  warnMessage: string
): Promise<Awaited<ReturnType<typeof joinChallengeDirect>> | null> {
  let activeChallenge: Awaited<ReturnType<typeof joinChallengeDirect>> | null = null;
  try {
    activeChallenge = await joinChallengeDirect(supabase, userId, challengeId);
  } catch (joinErr: unknown) {
    const { logger } = await import("../../lib/logger");
    logger.warn({ err: joinErr, challengeId }, warnMessage);
  }
  if (activeChallenge) {
    await supabase
      .from("activity_events")
      .insert({
        user_id: userId,
        event_type: "joined_challenge",
        challenge_id: challengeId,
        metadata: { challenge_name: challengeName },
      })
      .then(({ error: evtErr }) => {
        if (evtErr) logger.error({ err: evtErr }, "[challenges.create] joined_challenge event insert failed");
      });
  }
  return activeChallenge;
}

export const challengesCreateProcedures = {
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required").max(200, "Title too long"),
      description: z.string().max(5000).optional().default(""),
      type: z.enum(['standard', 'one_day']),
      durationDays: z.number().min(1, "Duration must be at least 1 day"),
      visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional().default('FRIENDS'),
      categories: z.array(z.string().max(50)).max(10).optional(),
      liveDate: z.string().max(64).optional(),
      replayPolicy: z.enum(['live_only', 'allow_replay']).optional(),
      requireSameRules: z.boolean().optional(),
      showReplayLabel: z.boolean().optional(),
      participationType: z.enum(['solo', 'duo', 'team', 'shared_goal']).optional().default('solo'),
      teamSize: z.number().min(1).max(10).optional().default(1),
      difficulty: z.enum(['standard', 'hard']).optional().default('standard'),
      status: z.enum(['published', 'draft']).optional().default('published'),
      sharedGoalTarget: z.number().positive().optional(),
      sharedGoalUnit: z.string().max(50).optional(),
      deadlineType: z.enum(['none', 'soft', 'hard']).optional(),
      deadlineDate: z.string().max(64).optional(),
      tasks: z.array(z.object({
        title: z.string().min(1, "Task title is required").max(300),
        type: z.string().max(50),
        required: z.boolean(),
        minWords: z.number().optional(),
        targetValue: z.number().optional(),
        unit: z.string().max(50).optional(),
        trackingMode: z.string().max(50).optional(),
        photoRequired: z.boolean().optional(),
        locationName: z.string().max(200).optional(),
        radiusMeters: z.number().optional(),
        durationMinutes: z.number().optional(),
        mustCompleteInSession: z.boolean().optional(),
        strictTimerMode: z.boolean().optional(),
        requirePhotoProof: z.boolean().optional(),
        locations: z.array(z.any()).max(20).optional(),
        startTime: z.string().max(16).optional(),
        startWindowMinutes: z.number().optional(),
        minSessionMinutes: z.number().optional(),
        journalType: z.array(z.string().max(50)).max(10).optional(),
        journalPrompt: z.string().max(1000).optional(),
        allowFreeWrite: z.boolean().optional(),
        captureMood: z.boolean().optional(),
        captureEnergy: z.boolean().optional(),
        captureBodyState: z.boolean().optional(),
        wordLimitEnabled: z.boolean().optional(),
        wordLimitMode: z.enum(["PRESET", "CUSTOM"]).optional(),
        wordLimitWords: z.number().min(20).max(1000).nullable().optional(),
        timeEnforcementEnabled: z.boolean().optional(),
        scheduleType: z.enum(["NONE", "DAILY", "CUSTOM_DATES"]).optional(),
        anchorTimeLocal: z.string().max(16).nullable().optional(),
        taskDurationMinutes: z.number().nullable().optional(),
        windowStartOffsetMin: z.number().nullable().optional(),
        windowEndOffsetMin: z.number().nullable().optional(),
        hardWindowEnabled: z.boolean().optional(),
        hardWindowStartOffsetMin: z.number().nullable().optional(),
        hardWindowEndOffsetMin: z.number().nullable().optional(),
        timezoneMode: z.enum(["USER_LOCAL", "CHALLENGE_TIMEZONE"]).optional(),
        challengeTimezone: z.string().max(64).nullable().optional(),
        verificationMethod: z.string().max(50).optional(),
        verificationRuleJson: z.record(z.string(), z.unknown()).nullable().optional(),
      })).min(0).max(50),
    }).superRefine((data, ctx) => {
      if (data.participationType !== "shared_goal" && data.tasks.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one task is required for non–shared-goal challenges." });
      }
    }))
    .mutation(async ({ input, ctx }) => {
      const isSharedGoal = input.participationType === "shared_goal";
      if (!isSharedGoal && input.tasks.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one task is required" });
      }

      const { data: existingProfile, error: profileLookupError } = await ctx.supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (profileLookupError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ err: profileLookupError, userId: ctx.userId }, "[challenges.create] Profile lookup failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: profileLookupError.message || "Could not verify your profile.",
        });
      }
      if (!existingProfile) {
        const username = `user_${ctx.userId.slice(0, 8)}`;
        const { error: profileUpsertError } = await ctx.supabase.from("profiles").upsert(
          {
            user_id: ctx.userId,
            username,
            display_name: "User",
            onboarding_completed: false,
          },
          { onConflict: "user_id" }
        );
        if (profileUpsertError) {
          const { logger } = await import("../../lib/logger");
          logger.error({ err: profileUpsertError, userId: ctx.userId }, "[challenges.create] Profile create failed");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: profileUpsertError.message || "Could not create your profile. Try again.",
          });
        }
      }

      for (let i = 0; i < input.tasks.length; i++) {
        const task = input.tasks[i];
        if (!task) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Task ${i + 1}: missing` });
        }
        if (!task.title.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Task ${i + 1}: Title is required` });
        }

        switch (task.type) {
          case 'journal':
            if (task.minWords != null && task.minWords <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Minimum words must be positive` });
            }
            break;
          case 'timer':
            if (!task.durationMinutes || task.durationMinutes <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Duration is required` });
            }
            break;
          case 'run':
            if (task.trackingMode === 'distance') {
              if (!task.targetValue || task.targetValue <= 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Distance is required` });
              }
            } else if (task.trackingMode === 'time') {
              if (!task.targetValue || task.targetValue <= 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Time duration is required` });
              }
            }
            break;
          case 'checkin':
            if (!task.locationName || !task.locationName.trim()) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Location name is required` });
            }
            if (!task.radiusMeters || task.radiusMeters <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Radius is required` });
            }
            break;
          case 'water':
            if (!task.targetValue || task.targetValue <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Target is required` });
            }
            break;
          case 'reading':
            if (!task.targetValue || task.targetValue <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Target pages is required` });
            }
            break;
          case 'counter':
            if (!task.targetValue || task.targetValue <= 0) {
              throw new TRPCError({ code: "BAD_REQUEST", message: `Task "${task.title}": Target count is required` });
            }
            break;
        }
      }

      const isTeamOrShared =
        input.participationType === "team" ||
        input.participationType === "shared_goal" ||
        input.participationType === "duo";
      const runStatus = isTeamOrShared ? "waiting" : null;
      const isOneDay = input.type === "one_day";
      const challengeStatus = input.status ?? "published";
      const insertPayload: Record<string, unknown> = {
        creator_id: ctx.userId,
        title: input.title,
        description: input.description,
        duration_type: isOneDay ? "24h" : "multi_day",
        duration_days: input.durationDays,
        category: input.categories?.[0] || "other",
        difficulty: input.difficulty === "hard" ? "hard" : "medium",
        status: challengeStatus,
        live_date: input.liveDate || null,
        replay_policy: input.replayPolicy || "allow_replay",
        require_same_rules: input.requireSameRules ?? true,
        show_replay_label: input.showReplayLabel ?? true,
        visibility: (input.visibility || "FRIENDS").toUpperCase(),
        participation_type: input.participationType ?? "solo",
        team_size: input.teamSize ?? 1,
        run_status: runStatus,
      };
      if (isOneDay) {
        const start = input.liveDate ? new Date(input.liveDate) : new Date();
        if (Number.isNaN(start.getTime())) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid live date for 24-hour challenge." });
        }
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        insertPayload.starts_at = start.toISOString();
        insertPayload.ends_at = end.toISOString();
      }
      if (input.participationType === "shared_goal") {
        if (input.sharedGoalTarget != null) insertPayload.shared_goal_target = input.sharedGoalTarget;
        if (input.sharedGoalUnit != null) insertPayload.shared_goal_unit = input.sharedGoalUnit;
        if (input.deadlineType != null && input.deadlineType !== "none") insertPayload.deadline_type = input.deadlineType;
        if (input.deadlineDate != null) insertPayload.deadline_date = input.deadlineDate;
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .insert(insertPayload)
        .select()
        .single();

      if (challengeError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ err: challengeError, payload: insertPayload }, "[challenges.create] Insert challenges failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: challengeError.message || challengeError.code || "Failed to create challenge.",
        });
      }

      await ctx.supabase.from("activity_events").insert({
        user_id: ctx.userId,
        event_type: "challenge_created",
        challenge_id: challenge.id,
        metadata: { title: (challenge as { title?: string }).title ?? input.title },
      });

      if (isTeamOrShared) {
        const { error: memberError } = await ctx.supabase.from("challenge_members").insert({
          challenge_id: challenge.id,
          user_id: ctx.userId,
          role: "creator",
          status: "active",
        });
        if (memberError) {
          const { logger } = await import("../../lib/logger");
          logger.error({ err: memberError, challengeId: challenge.id }, "[challenges.create] Insert challenge_members failed");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: memberError.message || memberError.code || "Failed to create challenge.",
          });
        }
      }

      if (input.tasks.length === 0) {
        const activeChallengeNoTasks =
          challengeStatus === "published"
            ? await autoJoinCreatorAfterCreate(
                ctx.supabase,
                ctx.userId,
                challenge.id,
                input.title,
                "[challenges.create] Auto-join (no tasks) failed — non-fatal"
              )
            : null;
        return { ...challenge, tasks: [], activeChallenge: activeChallengeNoTasks };
      }

      const forcePhotoProof = input.difficulty === "hard";
      const tasksToInsert = input.tasks.map((task, i) =>
        buildTaskInsertPayload(
          {
            title: task.title,
            type: task.type as string,
            required: task.required,
            minWords: task.minWords,
            targetValue: task.targetValue,
            unit: task.unit,
            trackingMode: task.trackingMode,
            durationMinutes: task.durationMinutes,
            mustCompleteInSession: task.mustCompleteInSession,
            photoRequired: forcePhotoProof ? true : task.photoRequired,
            requirePhotoProof: forcePhotoProof ? true : (task.requirePhotoProof ?? false),
            strictTimerMode: task.strictTimerMode,
            locationName: task.locationName,
            radiusMeters: task.radiusMeters,
            journalType: task.journalType,
            journalPrompt: task.journalPrompt,
            allowFreeWrite: task.allowFreeWrite,
            captureMood: task.captureMood,
            verificationMethod: task.verificationMethod,
            verificationRuleJson: task.verificationRuleJson ?? undefined,
          },
          challenge.id,
          i
        )
      );

      const { data: tasksRaw, error: tasksError } = await ctx.supabase
        .from("challenge_tasks")
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        const { logger } = await import("../../lib/logger");
        logger.error({ err: tasksError, challengeId: challenge.id }, "[challenges.create] Insert challenge_tasks failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: tasksError.message || tasksError.code || "Failed to create tasks.",
        });
      }

      let activeChallenge: Awaited<ReturnType<typeof joinChallengeDirect>> | null = null;
      if (challengeStatus === "published") {
        activeChallenge = await autoJoinCreatorAfterCreate(
          ctx.supabase,
          ctx.userId,
          challenge.id,
          input.title,
          "[challenges.create] Auto-join failed — non-fatal"
        );
      }

      return {
        ...challenge,
        tasks: mapTaskRowsToApi((tasksRaw ?? []) as ChallengeTaskRowRaw[]),
        activeChallenge,
      };
    }),
};

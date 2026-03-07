import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { requireNoError } from "../errors";
import type { ChallengeWithTasksRow } from "../../types/db";
import {
  type ChallengeTaskRowRaw,
  mapTaskRowsToApi,
  buildTaskInsertPayload,
} from "../../lib/challenge-tasks";

const isProd = process.env.NODE_ENV === "production";
function logCreateChallenge(msg: string, data?: Record<string, unknown>) {
  if (!isProd) {
    console.log("[challenges.create]", msg, data ?? "");
  }
}

/** Map UI task type to DB enum (e.g. "simple" -> "manual", "photo" -> "manual" for backward compat). Exported for tests. */
export function dbTaskType(type: string): string {
  return type === "simple" || type === "photo" ? "manual" : type;
}

/** Default min_words for journal tasks when not provided. Exported for tests. */
export function journalMinWords(minWords: number | undefined | null): number {
  return minWords ?? 20;
}

/** Task input shape used when building insert row. Exported for tests. */
export type CreateTaskInput = {
  type: string;
  strictTimerMode?: boolean;
  requirePhotoProof?: boolean;
  photoRequired?: boolean;
};

/** Compute strict_timer_mode and require_photo_proof for DB insert. Exported for tests. */
export function taskStrictAndPhoto(task: CreateTaskInput): { strict_timer_mode: boolean; require_photo_proof: boolean } {
  return {
    strict_timer_mode: task.type === "timer" ? (task.strictTimerMode ?? false) : false,
    require_photo_proof: task.type === "photo" ? true : (task.requirePhotoProof ?? false),
  };
}

export const challengesRouter = createTRPCRouter({
  /** List public challenges with pagination. Backward compatible: no cursor => first page. */
  list: publicProcedure
    .input(z.object({
      search: z.string().max(100).optional(),
      category: z.string().max(50).optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const offset = input.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

      let query = ctx.supabase
        .from("challenges")
        .select("*, challenge_tasks (*)", { count: "exact" })
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const search = input.search?.trim();
      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error, count } = await query;
      requireNoError(error, "Failed to load challenges.");
      const items = (data ?? []).map((challenge: ChallengeWithTasksRow) => ({
        ...challenge,
        tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
      }));
      const nextOffset = safeOffset + items.length;
      const hasMore = count != null && nextOffset < count;
      const withCursor = { items, nextCursor: hasMore ? String(nextOffset) : undefined };
      const noPagination = input.cursor == null && input.limit == null;
      return noPagination ? items : withCursor;
    }),

  /** Featured challenges for Discover tab with pagination. Backward compatible. */
  getFeatured: publicProcedure
    .input(z.object({
      search: z.string().max(100).optional(),
      category: z.string().max(50).optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

      let query = ctx.supabase
        .from("challenges")
        .select("*, challenge_tasks (*)", { count: "exact" })
        .eq("visibility", "public")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("participants_count", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const search = input?.search?.trim();
      if (search) query = query.ilike("title", `%${search}%`);
      if (input?.category && input.category !== "all") query = query.eq("category", input.category);

      const { data, error, count } = await query;
      requireNoError(error, "Failed to load featured challenges.");
      const items = (data ?? []).map((challenge: ChallengeWithTasksRow) => ({
        ...challenge,
        tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
      }));
      const nextOffset = safeOffset + items.length;
      const hasMore = count != null && nextOffset < count;
      const withCursor = { items, nextCursor: hasMore ? String(nextOffset) : undefined };
      const noPagination = input?.cursor == null && input?.limit == null;
      return noPagination ? items : withCursor;
    }),

  /** Curated list of starter-pack challenges (e.g. onboarding). Stable order. Requires challenges seeded with source_starter_id. */
  getStarterPack: publicProcedure
    .query(async ({ ctx }) => {
      const ORDER: string[] = [
        'onboard-water',
        'onboard-steps',
        'onboard-read',
        'onboard-journal',
        'onboard-breath',
        'onboard-bed',
      ];
      const { data: rows, error } = await ctx.supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          duration_days,
          difficulty,
          category,
          visibility,
          status,
          source_starter_id,
          challenge_tasks (id, title, task_type, order_index, config)
        `)
        .not('source_starter_id', 'is', null)
        .eq('visibility', 'public')
        .eq('status', 'published');

      requireNoError(error, "Failed to load starter pack.");
      const list = (rows ?? []).map((c: { challenge_tasks?: ChallengeTaskRowRaw[] } & Record<string, unknown>) => ({
        ...c,
        tasks: mapTaskRowsToApi(c.challenge_tasks ?? []),
      }));
      list.sort((a: any, b: any) => {
        const ai = ORDER.indexOf(a.source_starter_id);
        const bi = ORDER.indexOf(b.source_starter_id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      return list.slice(0, 10);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('challenges')
        .select(`
          *,
          challenge_tasks (*)
        `)
        .eq('id', input.id)
        .single();

      if (error) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });

      return {
        ...data,
        tasks: mapTaskRowsToApi((data.challenge_tasks ?? []) as ChallengeTaskRowRaw[]),
      };
    }),

  join: protectedProcedure
    .input(z.object({
      challengeId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: existing } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already joined this challenge.",
        });
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("*, challenge_tasks (*)")
        .eq("id", input.challengeId)
        .single();

      if (challengeError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      }

      const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("join_challenge", {
        p_challenge_id: input.challengeId,
      });

      if (!rpcError) {
        const activeChallenge = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
        if (activeChallenge) return activeChallenge;
      }

      const code = (rpcError as any)?.code;
      const msg = (rpcError as any)?.message ?? "";
      if (msg.includes("ALREADY_JOINED")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
      }
      if (msg.includes("NOT_FOUND")) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      }
      if (code === "42883") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Join is not available. Deploy migration 20250306000000_join_challenge_rpc.sql.",
        });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join challenge." });
    }),

  getActive: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('active_challenges')
        .select(`
          *,
          challenges (
            *,
            challenge_tasks (*)
          )
        `)
        .eq('user_id', ctx.userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load active challenge." });
      }
      if (data?.challenges?.challenge_tasks) {
        const d = data as { challenges: { challenge_tasks: ChallengeTaskRowRaw[] } };
        d.challenges.challenge_tasks = mapTaskRowsToApi(d.challenges.challenge_tasks) as unknown as ChallengeTaskRowRaw[];
      }
      return data;
    }),

  /** All active challenges for the current user (for home Daily Status + Active Challenges). */
  listMyActive: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('active_challenges')
        .select(`
          *,
          challenges (
            *,
            challenge_tasks (*)
          )
        `)
        .eq('user_id', ctx.userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load active challenges." });
      }
      const list = (data ?? []) as { challenges?: { challenge_tasks?: ChallengeTaskRowRaw[] } }[];
      for (const row of list) {
        if (row.challenges?.challenge_tasks) {
          (row.challenges as { challenge_tasks: ChallengeTaskRowRaw[] }).challenge_tasks = mapTaskRowsToApi(
            row.challenges.challenge_tasks
          ) as unknown as ChallengeTaskRowRaw[];
        }
      }
      return list;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional().default(""),
      type: z.enum(['standard', 'one_day']),
      durationDays: z.number().min(1, "Duration must be at least 1 day"),
      visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional().default('FRIENDS'),
      categories: z.array(z.string()).optional(),
      liveDate: z.string().optional(),
      replayPolicy: z.enum(['live_only', 'allow_replay']).optional(),
      requireSameRules: z.boolean().optional(),
      showReplayLabel: z.boolean().optional(),
      tasks: z.array(z.object({
        title: z.string().min(1, "Task title is required"),
        type: z.string(),
        required: z.boolean(),
        minWords: z.number().optional(),
        targetValue: z.number().optional(),
        unit: z.string().optional(),
        trackingMode: z.string().optional(),
        photoRequired: z.boolean().optional(),
        locationName: z.string().optional(),
        radiusMeters: z.number().optional(),
        durationMinutes: z.number().optional(),
        mustCompleteInSession: z.boolean().optional(),
        strictTimerMode: z.boolean().optional(),
        requirePhotoProof: z.boolean().optional(),
        locations: z.array(z.any()).optional(),
        startTime: z.string().optional(),
        startWindowMinutes: z.number().optional(),
        minSessionMinutes: z.number().optional(),
        journalType: z.array(z.string()).optional(),
        journalPrompt: z.string().optional(),
        allowFreeWrite: z.boolean().optional(),
        captureMood: z.boolean().optional(),
        captureEnergy: z.boolean().optional(),
        captureBodyState: z.boolean().optional(),
        wordLimitEnabled: z.boolean().optional(),
        wordLimitMode: z.enum(["PRESET", "CUSTOM"]).optional(),
        wordLimitWords: z.number().min(20).max(1000).nullable().optional(),
        timeEnforcementEnabled: z.boolean().optional(),
        scheduleType: z.enum(["NONE", "DAILY", "CUSTOM_DATES"]).optional(),
        anchorTimeLocal: z.string().nullable().optional(),
        taskDurationMinutes: z.number().nullable().optional(),
        windowStartOffsetMin: z.number().nullable().optional(),
        windowEndOffsetMin: z.number().nullable().optional(),
        hardWindowEnabled: z.boolean().optional(),
        hardWindowStartOffsetMin: z.number().nullable().optional(),
        hardWindowEndOffsetMin: z.number().nullable().optional(),
        timezoneMode: z.enum(["USER_LOCAL", "CHALLENGE_TIMEZONE"]).optional(),
        challengeTimezone: z.string().nullable().optional(),
        verificationMethod: z.string().optional(),
        verificationRuleJson: z.record(z.unknown()).nullable().optional(),
      })).min(1, "At least one task is required"),
    }))
    .mutation(async ({ input, ctx }) => {
      logCreateChallenge("start", { userId: ctx.userId, title: input.title?.slice(0, 50), taskCount: input.tasks.length });

      if (input.tasks.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one task is required" });
      }

      for (let i = 0; i < input.tasks.length; i++) {
        const task = input.tasks[i];
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
        }
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from('challenges')
        .insert({
          creator_id: ctx.userId,
          title: input.title,
          description: input.description,
          duration_type: input.type === 'one_day' ? '24h' : 'multi_day',
          duration_days: input.durationDays,
          category: input.categories?.[0] || 'other',
          difficulty: 'medium',
          status: 'published',
          live_date: input.liveDate || null,
          replay_policy: input.replayPolicy || 'allow_replay',
          require_same_rules: input.requireSameRules ?? true,
          show_replay_label: input.showReplayLabel ?? true,
          visibility: (input.visibility || 'FRIENDS').toLowerCase(),
        })
        .select()
        .single();

      if (challengeError) {
        logCreateChallenge("challenge insert failed", { code: challengeError.code });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create challenge.",
        });
      }

      const tasksToInsert = input.tasks.map((task, i) =>
        buildTaskInsertPayload(
          {
            title: task.title,
            type: task.type as string,
            required: task.required,
            minWords: task.minWords,
            durationMinutes: task.durationMinutes,
            photoRequired: task.photoRequired,
            requirePhotoProof: task.requirePhotoProof,
            strictTimerMode: task.strictTimerMode,
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
        logCreateChallenge("tasks insert failed", { code: tasksError.code });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tasks.",
        });
      }

      logCreateChallenge("success", { challengeId: challenge.id, title: challenge.title });
      return {
        ...challenge,
        tasks: mapTaskRowsToApi((tasksRaw ?? []) as ChallengeTaskRowRaw[]),
      };
    }),
});

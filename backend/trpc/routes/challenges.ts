import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { requireNoError } from "../errors";
import type { ChallengeWithTasksRow } from "../../types/db";
import {
  type ChallengeTaskRowRaw,
  type ChallengeTaskApiShape,
  mapTaskRowsToApi,
  buildTaskInsertPayload,
  isTaskRequired,
} from "../../lib/challenge-tasks";
import { getSupabaseServer } from "../../lib/supabase-server";

/** Ensure 24h challenges have ends_at for frontend countdown (derive from live_date if missing). */
function with24hEndsAt<T extends { duration_type?: string; ends_at?: string | null; live_date?: string | null }>(row: T): T {
  if (row.duration_type !== "24h") return row;
  if (row.ends_at) return row;
  if (!row.live_date) return row;
  const start = new Date(row.live_date).getTime();
  if (Number.isNaN(start)) return row;
  return { ...row, ends_at: new Date(start + 24 * 60 * 60 * 1000).toISOString() };
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
        .eq("visibility", "PUBLIC")
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
        .eq("visibility", "PUBLIC")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const search = input?.search?.trim();
      if (search) query = query.ilike("title", `%${search}%`);
      if (input?.category && input.category !== "all") query = query.eq("category", input.category);

      const { data, error, count } = await query;
      requireNoError(error, "Failed to load featured challenges.");
      const items = (data ?? []).map((challenge: ChallengeWithTasksRow) => {
        const normalized = with24hEndsAt(challenge as { duration_type?: string; ends_at?: string | null; live_date?: string | null } & ChallengeWithTasksRow);
        return {
          ...normalized,
          tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
        };
      });
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
          category,
          visibility,
          status,
          source_starter_id,
          challenge_tasks (id, title, task_type, order_index, config)
        `)
        .not('source_starter_id', 'is', null)
        .eq('visibility', 'PUBLIC')
        .eq('status', 'published');

      requireNoError(error, "Failed to load starter pack.");
      const list = (rows ?? []).map((c: { challenge_tasks?: ChallengeTaskRowRaw[] } & Record<string, unknown>) => ({
        ...c,
        tasks: mapTaskRowsToApi(c.challenge_tasks ?? []),
      }));
      type StarterListEntry = { source_starter_id?: string; tasks: ChallengeTaskApiShape[]; challenge_tasks?: ChallengeTaskRowRaw[] };
      list.sort((a: StarterListEntry, b: StarterListEntry) => {
        const ai = ORDER.indexOf(a.source_starter_id ?? "");
        const bi = ORDER.indexOf(b.source_starter_id ?? "");
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
        .from("challenges")
        .select("*, challenge_tasks (*)")
        .eq("id", input.id)
        .single();

      if (error) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });

      const participationType = (data as { participation_type?: string }).participation_type;
      const runStatus = (data as { run_status?: string }).run_status;
      const isTeam = participationType === "team" || participationType === "shared_goal";

      if (isTeam && runStatus === "active" && participationType === "team") {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: input.id, p_date_key: yesterday });
        await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: input.id, p_date_key: today });
      }

      type TeamMemberOut = {
        id: string;
        user_id: string;
        role: string;
        status: string;
        joined_at: string;
        profiles?: { user_id?: string; username?: string | null; display_name?: string | null; avatar_url?: string | null };
        secured_today?: boolean | null;
        tasks_completed?: number;
        tasks_total?: number;
      };
      let teamMembers: TeamMemberOut[] = [];
      let sharedGoalTotal: number | null = null;

      if (isTeam) {
        const { data: members } = await ctx.supabase
          .from("challenge_members")
          .select("id, user_id, role, status, joined_at")
          .eq("challenge_id", input.id)
          .order("joined_at", { ascending: true });
        const memberRows = (members ?? []) as { id: string; user_id: string; role: string; status: string; joined_at: string }[];
        const taskRows = (data.challenge_tasks ?? []) as ChallengeTaskRowRaw[];
        const requiredTaskIds = new Set(taskRows.filter((t) => isTaskRequired(t)).map((t) => t.id));
        const tasksTotal = requiredTaskIds.size;
        const today = new Date().toISOString().split("T")[0];
        let statusByUserId: Map<string, { tasks_completed: number; secured_today: boolean }> = new Map();

        if (participationType === "team" && memberRows.length > 0 && tasksTotal > 0) {
          const server = getSupabaseServer();
          if (server) {
            const userIds = memberRows.map((m) => m.user_id);
            const { data: acRows } = await server
              .from("active_challenges")
              .select("id, user_id")
              .eq("challenge_id", input.id)
              .in("user_id", userIds);
            const acList = (acRows ?? []) as { id: string; user_id: string }[];
            const userToAcId = new Map(acList.map((a) => [a.user_id, a.id]));
            const acIds = acList.map((a) => a.id);
            if (acIds.length > 0) {
              const { data: checkinRows } = await server
                .from("check_ins")
                .select("active_challenge_id, task_id")
                .in("active_challenge_id", acIds)
                .eq("date_key", today)
                .eq("status", "completed");
              const rows = (checkinRows ?? []) as { active_challenge_id: string; task_id: string }[];
              const completedByAcId = new Map<string, Set<string>>();
              for (const r of rows) {
                if (!requiredTaskIds.has(r.task_id)) continue;
                if (!completedByAcId.has(r.active_challenge_id)) completedByAcId.set(r.active_challenge_id, new Set());
                completedByAcId.get(r.active_challenge_id)!.add(r.task_id);
              }
              for (const m of memberRows) {
                const acId = userToAcId.get(m.user_id);
                const completedSet = acId ? completedByAcId.get(acId) : undefined;
                const tasksCompleted = completedSet?.size ?? 0;
                statusByUserId.set(m.user_id, {
                  tasks_completed: tasksCompleted,
                  secured_today: tasksCompleted === tasksTotal,
                });
              }
            }
          }
        }

        if (memberRows.length > 0) {
          const { data: profiles } = await ctx.supabase
            .from("profiles")
            .select("user_id, username, display_name, avatar_url")
            .in("user_id", memberRows.map((m) => m.user_id));
          const profileMap = new Map((profiles ?? []).map((p: { user_id: string; username?: string | null; display_name?: string | null; avatar_url?: string | null }) => [p.user_id, p]));
          teamMembers = memberRows.map((m) => {
            const base: TeamMemberOut = {
              ...m,
              profiles: profileMap.get(m.user_id) ?? undefined,
            };
            if (participationType === "team") {
              const status = statusByUserId.get(m.user_id);
              base.tasks_total = tasksTotal;
              base.tasks_completed = status?.tasks_completed ?? 0;
              base.secured_today = status?.secured_today ?? false;
            } else {
              base.secured_today = null;
              base.tasks_completed = 0;
              base.tasks_total = 0;
            }
            return base;
          });
        } else {
          teamMembers = memberRows.map((m) => ({
            ...m,
            ...(participationType === "shared_goal" ? { secured_today: null, tasks_completed: 0, tasks_total: 0 } : {}),
          })) as TeamMemberOut[];
        }
      }

      if (participationType === "shared_goal") {
        const { data: sumRow } = await ctx.supabase
          .from("shared_goal_logs")
          .select("amount")
          .eq("challenge_id", input.id);
        const rows = (sumRow ?? []) as { amount: number }[];
        sharedGoalTotal = rows.reduce((acc, r) => acc + Number(r.amount), 0);
      }

      const normalized = with24hEndsAt(data as { duration_type?: string; ends_at?: string | null; live_date?: string | null } & typeof data);
      return {
        ...normalized,
        tasks: mapTaskRowsToApi((data.challenge_tasks ?? []) as ChallengeTaskRowRaw[]),
        ...(isTeam ? { teamMembers } : {}),
        ...(participationType === "shared_goal" ? { sharedGoalTotal } : {}),
      };
    }),

  // Premium status read from profiles table (validated server-side only). When enforcing join limits, read subscription_status from DB.
  join: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: existingActive } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (existingActive) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
      }

      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("id")
        .eq("id", input.challengeId)
        .single();

      if (challengeError || !challenge) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
      }

      const participationType = "solo" as "solo" | "team" | "shared_goal";
      const teamSize = 1;
      const isTeamWaiting = false;

      if (isTeamWaiting) {
        const { data: existingMember } = await ctx.supabase
          .from("challenge_members")
          .select("id")
          .eq("challenge_id", input.challengeId)
          .eq("user_id", ctx.userId)
          .maybeSingle();

        if (existingMember) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
        }

        const { error: insertErr } = await ctx.supabase.from("challenge_members").insert({
          challenge_id: input.challengeId,
          user_id: ctx.userId,
          role: "member",
          status: "active",
        });

        if (insertErr) {
          if ((insertErr as { code?: string }).code === "23505") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "You have already joined this challenge." });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join challenge." });
        }

        const { count: memberCount } = await ctx.supabase
          .from("challenge_members")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", input.challengeId);

        if ((memberCount ?? 0) >= teamSize) {
          await ctx.supabase.rpc("start_team_challenge", {
            p_challenge_id: input.challengeId,
          });
          if (participationType === "team") {
            const { data: myActive } = await ctx.supabase
              .from("active_challenges")
              .select("*")
              .eq("user_id", ctx.userId)
              .eq("challenge_id", input.challengeId)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (myActive) return myActive;
          }
          return { joined: true, runStatus: "active" as const };
        }

        return { joined: true, runStatus: "waiting" as const };
      }

      const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("join_challenge", {
        p_challenge_id: input.challengeId,
      });

      if (!rpcError) {
        const activeChallenge = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
        if (activeChallenge) {
          const { data: ch } = await ctx.supabase.from("challenges").select("name").eq("id", input.challengeId).single();
          await ctx.supabase.from("activity_events").insert({
            user_id: ctx.userId,
            event_type: "joined_challenge",
            challenge_id: input.challengeId,
            metadata: { challenge_name: (ch as { name?: string })?.name ?? "Challenge" },
          });
          return activeChallenge;
        }
      }

      const code = (rpcError as { code?: string })?.code;
      const msg = (rpcError as { message?: string })?.message ?? "";
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

  /** Leave a challenge: remove active_challenge (and cascade check_ins) or remove from challenge_members if team waiting. */
  leave: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: ac } = await ctx.supabase
        .from("active_challenges")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .maybeSingle();

      if (ac) {
        const { error: delErr } = await ctx.supabase
          .from("active_challenges")
          .delete()
          .eq("id", ac.id);
        if (delErr) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to leave challenge." });
        }
        return { left: true };
      }

      const { error: memberErr } = await ctx.supabase
        .from("challenge_members")
        .delete()
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId);
      if (memberErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to leave challenge." });
      }
      return { left: true };
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

  startTeamChallenge: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.rpc("start_team_challenge", {
        p_challenge_id: input.challengeId,
      });
      if (error) {
        const msg = (error as { message?: string }).message ?? "";
        if (msg.includes("NOT_FOUND")) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
        if (msg.includes("NOT_TEAM_CHALLENGE")) throw new TRPCError({ code: "BAD_REQUEST", message: "Not a team or shared-goal challenge." });
        if (msg.includes("RUN_NOT_WAITING")) throw new TRPCError({ code: "BAD_REQUEST", message: "Run is not waiting to start." });
        if (msg.includes("ONLY_CREATOR_OR_FULL")) throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator can start before the team is full." });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to start challenge." });
      }
      return { started: true };
    }),

  getTeamMembers: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: member } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this challenge." });
      }
      const { data: members } = await ctx.supabase
        .from("challenge_members")
        .select("id, user_id, role, status, joined_at")
        .eq("challenge_id", input.challengeId)
        .order("joined_at", { ascending: true });
      const rows = (members ?? []) as { id: string; user_id: string; role: string; status: string; joined_at: string }[];
      if (rows.length === 0) return [];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", rows.map((r) => r.user_id));
      const profileMap = new Map(
        (profiles ?? []).map((p: { user_id: string; username?: string | null; display_name?: string | null; avatar_url?: string | null }) => [p.user_id, p])
      );
      return rows.map((m) => ({ ...m, profile: profileMap.get(m.user_id) ?? null }));
    }),

  // Premium status read from profiles table (validated server-side only). When enforcing create limits, read subscription_status from DB.
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
      participationType: z.enum(['solo', 'duo', 'team', 'shared_goal']).optional().default('solo'),
      teamSize: z.number().min(1).max(10).optional().default(1),
      sharedGoalTarget: z.number().positive().optional(),
      sharedGoalUnit: z.string().max(50).optional(),
      deadlineType: z.enum(['none', 'soft', 'hard']).optional(),
      deadlineDate: z.string().optional(),
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
      })).min(0),
    }).refine((data) => data.participationType === "shared_goal" || data.tasks.length >= 1, { message: "At least one task is required for non–shared-goal challenges." }))
    .mutation(async ({ input, ctx }) => {
      const isSharedGoal = input.participationType === "shared_goal";
      if (!isSharedGoal && input.tasks.length === 0) {
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

      const isTeamOrShared = input.participationType === "team" || input.participationType === "shared_goal";
      const runStatus = isTeamOrShared ? "waiting" : null;
      const isOneDay = input.type === "one_day";
      const insertPayload: Record<string, unknown> = {
        creator_id: ctx.userId,
        title: input.title,
        description: input.description,
        duration_type: isOneDay ? "24h" : "multi_day",
        duration_days: input.durationDays,
        category: input.categories?.[0] || "other",
        difficulty: "medium",
        status: "published",
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create challenge.",
        });
      }

      if (isTeamOrShared) {
        const { error: memberError } = await ctx.supabase.from("challenge_members").insert({
          challenge_id: challenge.id,
          user_id: ctx.userId,
          role: "creator",
          status: "active",
        });
        if (memberError) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create challenge." });
        }
      }

      if (input.tasks.length === 0) {
        return { ...challenge, tasks: [] };
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tasks.",
        });
      }

      return {
        ...challenge,
        tasks: mapTaskRowsToApi((tasksRaw ?? []) as ChallengeTaskRowRaw[]),
      };
    }),
});

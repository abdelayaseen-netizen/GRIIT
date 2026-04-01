// TODO: Split into sub-routers — see docs/ARCHITECTURE.md
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import { requireNoError } from "../errors";
import type { ChallengeWithTasksRow } from "../../types/db";
import {
  type ChallengeTaskRowRaw,
  mapTaskRowsToApi,
  isTaskRequired,
} from "../../lib/challenge-tasks";
import { getSupabaseServer } from "../../lib/supabase-server";
import { challengesDiscoverProcedures } from "./challenges-discover";
import { challengesJoinProcedures } from "./challenges-join";
import { challengesCreateProcedures } from "./challenges-create";
import { logger } from "../../lib/logger";
import { escapeLikeWildcards } from "../../lib/sanitize-search";

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

/** Keep 24h challenge response shape consistent for challenge detail endpoints. */
function with24hEndsAt<T extends { duration_type?: string; ends_at?: string | null; live_date?: string | null }>(row: T): T {
  if (row.duration_type !== "24h") return row;
  if (row.ends_at) return row;
  if (!row.live_date) return row;
  const start = new Date(row.live_date).getTime();
  if (Number.isNaN(start)) return row;
  return { ...row, ends_at: new Date(start + 24 * 60 * 60 * 1000).toISOString() };
}

export const challengesRouter = createTRPCRouter({
  ...challengesDiscoverProcedures,
  ...challengesJoinProcedures,
  ...challengesCreateProcedures,
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
        .select(
          "id, title, description, metadata, duration_days, difficulty, category, status, visibility, is_featured, participants_count, created_at, creator_id, source_starter_id, duration_type, ends_at, live_date, participation_type, team_size, challenge_tasks (id, title, task_type, order_index, config)",
          { count: "exact" }
        )
        .eq("visibility", "PUBLIC")
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const search = input.search?.trim();
      if (search) {
        const safeSearch = escapeLikeWildcards(search);
        if (safeSearch) query = query.ilike("title", `%${safeSearch}%`);
      }

      const { data, error, count } = await query;
      requireNoError(error, "Failed to load challenges.");
      const items = (data ?? []).map((challenge: ChallengeWithTasksRow) => {
        const meta = (challenge as { metadata?: Record<string, unknown> }).metadata;
        const short_hook = typeof meta?.short_hook === "string" ? meta.short_hook : null;
        return {
          ...challenge,
          short_hook,
          tasks: mapTaskRowsToApi((challenge.challenge_tasks ?? []) as unknown as ChallengeTaskRowRaw[]),
        };
      });
      const nextOffset = safeOffset + items.length;
      const hasMore = count != null && nextOffset < count;
      const withCursor = { items, nextCursor: hasMore ? String(nextOffset) : undefined };
      const noPagination = input.cursor == null && input.limit == null;
      return noPagination ? items : withCursor;
    }),

  /** Featured challenges for Discover tab with pagination. Backward compatible. Shows PUBLIC or current user's own challenges. */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const { data, error } = await server
        .from("challenges")
        .select(
          "id, title, description, metadata, duration_days, difficulty, category, status, visibility, is_featured, participants_count, created_at, creator_id, source_starter_id, duration_type, ends_at, live_date, participation_type, team_size, shared_goal_target, shared_goal_unit, deadline_type, deadline_date, started_at, run_status, challenge_tasks (id, title, task_type, order_index, config)"
        )
        .eq("id", input.id)
        .single();

      if (error) {
        const pgCode = (error as { code?: string }).code;
        if (pgCode === "PGRST116") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
        }
        logger.error({ err: error, challengeId: input.id }, "[challenges.getById] query failed");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to load challenge." });
      }

      const participationType = (data as { participation_type?: string }).participation_type;
      const runStatus = (data as { run_status?: string }).run_status;
      const isTeam = participationType === "team" || participationType === "shared_goal";

      if (isTeam && runStatus === "active" && participationType === "team") {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
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
        const today = new Date().toISOString().slice(0, 10);
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
                // guaranteed non-null: just set in previous line
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
      const meta = (data as { metadata?: Record<string, unknown> }).metadata;
      const short_hook = typeof meta?.short_hook === "string" ? meta.short_hook : null;
      return {
        ...normalized,
        short_hook,
        tasks: mapTaskRowsToApi((data.challenge_tasks ?? []) as ChallengeTaskRowRaw[]),
        ...(isTeam ? { teamMembers } : {}),
        ...(participationType === "shared_goal" ? { sharedGoalTotal } : {}),
      };
    }),

  // Premium status read from profiles table (validated server-side only). When enforcing join limits, read subscription_status from DB.
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
      try {
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
          logger.error({ err: error }, "[listMyActive] Supabase error");
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
      } catch (err) {
        logger.error({ err }, "[listMyActive] caught");
        throw err;
      }
    }),

  /** Another user's active challenges (privacy: public profile or accepted follow). */
  getPublicChallenges: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      let canSee = input.userId === ctx.userId;
      if (!canSee) {
        const { data: pr } = await server
          .from("profiles")
          .select("profile_visibility")
          .eq("user_id", input.userId)
          .maybeSingle();
        const vis = String((pr as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
        if (vis === "public") {
          canSee = true;
        } else {
          const { data: fol } = await ctx.supabase
            .from("user_follows")
            .select("status")
            .eq("follower_id", ctx.userId)
            .eq("following_id", input.userId)
            .maybeSingle();
          canSee = Boolean(fol && String((fol as { status?: string }).status ?? "").toLowerCase() === "accepted");
        }
      }
      if (!canSee) return [];
      const { data, error } = await server
        .from("active_challenges")
        .select(
          `
          id,
          challenge_id,
          current_day,
          progress_percent,
          challenges (
            id,
            title,
            duration_days
          )
        `
        )
        .eq("user_id", input.userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data ?? [];
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
});

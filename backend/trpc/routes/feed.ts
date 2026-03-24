import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { getVisibleUserIds } from "../../lib/get-visible-user-ids";

export const feedRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const visibleUserIds = await getVisibleUserIds(ctx.supabase, ctx.userId);

      let query = ctx.supabase
        .from("activity_events")
        .select("id, user_id, event_type, challenge_id, metadata, created_at")
        .in("user_id", visibleUserIds)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      const { data: events, error } = await query;
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const items = events ?? [];
      const userIds = [...new Set(items.map((e: { user_id: string }) => e.user_id))];
      let profileMap = new Map<string, { display_name?: string | null; username?: string | null; avatar_url?: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await ctx.supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url")
          .in("user_id", userIds);
        profileMap = new Map(
          (profiles ?? []).map((p: { user_id: string; display_name?: string | null; username?: string | null; avatar_url?: string | null }) => [
            p.user_id,
            { display_name: p.display_name, username: p.username, avatar_url: p.avatar_url },
          ])
        );
      }

      const withProfiles = items.map((e: { id: string; user_id: string; event_type: string; challenge_id?: string | null; metadata?: Record<string, unknown>; created_at: string }) => {
        const profile = profileMap.get(e.user_id);
        return {
          id: e.id,
          user_id: e.user_id,
          event_type: e.event_type,
          challenge_id: e.challenge_id ?? null,
          metadata: e.metadata ?? {},
          created_at: e.created_at,
          display_name: profile?.display_name ?? profile?.username ?? "Someone",
          username: profile?.username ?? "?",
          avatar_url: profile?.avatar_url ?? null,
        };
      });
      const eventIds = items.map((e) => e.id);
      const reactionStats = new Map<string, { count: number; reactedByMe: boolean }>();
      if (eventIds.length > 0) {
        const { data: reactions } = await ctx.supabase
          .from("feed_reactions")
          .select("event_id, user_id")
          .in("event_id", eventIds);
        for (const row of (reactions ?? []) as { event_id: string; user_id: string }[]) {
          const prev = reactionStats.get(row.event_id) ?? { count: 0, reactedByMe: false };
          reactionStats.set(row.event_id, {
            count: prev.count + 1,
            reactedByMe: prev.reactedByMe || row.user_id === ctx.userId,
          });
        }
      }
      const withReactions = withProfiles.map((item) => {
        const stat = reactionStats.get(item.id);
        return {
          ...item,
          reaction_count: stat?.count ?? 0,
          reacted_by_me: stat?.reactedByMe ?? false,
        };
      });

      const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
      return {
        items: withReactions,
        nextCursor: items.length === input.limit && lastItem ? lastItem.created_at : null,
      };
    }),
  listMine: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("activity_events")
        .select("id, event_type, challenge_id, metadata, created_at")
        .eq("user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      const { data: events, error } = await query;
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const items = (events ?? []) as {
        id: string;
        event_type: string;
        challenge_id: string | null;
        metadata?: Record<string, unknown>;
        created_at: string;
      }[];
      const challengeIds = [...new Set(items.map((e) => e.challenge_id).filter((id): id is string => !!id))];
      let challengeMap = new Map<string, { title: string; category: string | null }>();
      if (challengeIds.length > 0) {
        const { data: challenges } = await ctx.supabase
          .from("challenges")
          .select("id, title, category")
          .in("id", challengeIds);
        challengeMap = new Map(
          (challenges ?? []).map((c: { id: string; title?: string | null; category?: string | null }) => [
            c.id,
            { title: c.title ?? "Challenge", category: c.category ?? null },
          ])
        );
      }

      const out = items.map((event) => {
        const metadata = event.metadata ?? {};
        const challenge = event.challenge_id ? challengeMap.get(event.challenge_id) : undefined;
        const streakCount = Number((metadata as Record<string, unknown>).streak_count ?? 0);
        const isMilestone = event.event_type === "streak_milestone";
        const fallbackTask =
          event.event_type === "completed_task"
            ? "Task completed"
            : event.event_type === "challenge_joined"
              ? "Challenge joined"
              : "Activity";
        return {
          id: event.id,
          type: isMilestone ? "milestone" : "activity",
          eventType: event.event_type,
          challengeId: event.challenge_id ?? null,
          taskName: String((metadata as Record<string, unknown>).task_name ?? fallbackTask),
          challengeTitle: challenge?.title ?? String((metadata as Record<string, unknown>).challenge_name ?? "Challenge"),
          challengeCategory: challenge?.category ?? String((metadata as Record<string, unknown>).challenge_category ?? "discipline"),
          completedAt: event.created_at,
          hasProof: Boolean((metadata as Record<string, unknown>).has_photo) || Boolean((metadata as Record<string, unknown>).photo_url),
          proofUrl: ((metadata as Record<string, unknown>).photo_url as string | undefined) ?? undefined,
          milestoneTitle: isMilestone ? `${Math.max(0, streakCount)}-day streak!` : null,
          milestoneSubtitle: isMilestone ? "You've been consistent. Keep it up." : null,
        };
      });

      const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
      return {
        items: out,
        nextCursor: items.length === input.limit && lastItem ? lastItem.created_at : null,
      };
    }),
  getMySummary: protectedProcedure.query(async ({ ctx }) => {
    const [completedTasksResult, streakResult, activeChallengesResult] = await Promise.all([
      ctx.supabase
        .from("activity_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("event_type", "completed_task"),
      ctx.supabase
        .from("streaks")
        .select("active_streak_count")
        .eq("user_id", ctx.userId)
        .maybeSingle(),
      ctx.supabase
        .from("active_challenges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId)
        .eq("status", "active"),
    ]);

    return {
      totalTasksCompleted: completedTasksResult.count ?? 0,
      currentStreak: (streakResult.data as { active_streak_count?: number } | null)?.active_streak_count ?? 0,
      activeChallenges: activeChallengesResult.count ?? 0,
    };
  }),

  react: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: existing } = await ctx.supabase
        .from("feed_reactions")
        .select("id")
        .eq("event_id", input.eventId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      let reacted = false;
      if (existing?.id) {
        const { error } = await ctx.supabase
          .from("feed_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to remove reaction." });
      } else {
        const { error } = await ctx.supabase
          .from("feed_reactions")
          .insert({
            user_id: ctx.userId,
            event_id: input.eventId,
            reaction: "fire",
          });
        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to react." });
        reacted = true;
      }
      const { count } = await ctx.supabase
        .from("feed_reactions")
        .select("id", { count: "exact", head: true })
        .eq("event_id", input.eventId);
      return { success: true as const, reacted, reactionCount: count ?? 0 };
    }),

  comment: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        text: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase.from("feed_comments").insert({
        user_id: ctx.userId,
        event_id: input.eventId,
        text: input.text.trim(),
      });
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message || "Failed to comment." });
      }
      return { success: true as const };
    }),
});

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

      return {
        items: withProfiles,
        nextCursor: items.length === input.limit && items.length > 0 ? items[items.length - 1].created_at : null,
      };
    }),
});

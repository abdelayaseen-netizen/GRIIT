import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import type { PgError, ProfileRow, RespectRow } from "../../types/db";

const RESPECTS_PAGE_MAX = 50;

export const respectsRouter = createTRPCRouter({
  give: protectedProcedure
    .input(z.object({ recipientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.recipientId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot give respect to yourself." });
      }
      const { error } = await ctx.supabase.from("respects").insert({
        actor_id: ctx.userId,
        recipient_id: input.recipientId,
      });
      if (error) {
        if ((error as PgError).code === "23505") {
          return { success: true };
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to give respect." });
      }
      return { success: true };
    }),

  getForUser: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(RESPECTS_PAGE_MAX).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? RESPECTS_PAGE_MAX;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

      const { data: rows } = await ctx.supabase
        .from("respects")
        .select("id, actor_id, created_at")
        .eq("recipient_id", ctx.userId)
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const list = (rows ?? []) as RespectRow[];
      const count = list.length;
      const recent = list.slice(0, 10).map((r) => ({ id: r.id, actorId: r.actor_id, at: r.created_at }));
      const actorIds = [...new Set(list.map((r) => r.actor_id))];
      const { data: profiles } = await ctx.supabase.from("profiles").select("user_id, username, display_name").in("user_id", actorIds);
      const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.user_id, p]));
      const recentWithNames = recent.map((r) => ({
        ...r,
        actorUsername: profileMap.get(r.actorId)?.username ?? "?",
        actorDisplayName: profileMap.get(r.actorId)?.display_name ?? profileMap.get(r.actorId)?.username ?? "?",
      }));
      const noPagination = input?.cursor == null && input?.limit == null;
      const base = { count, recent: recentWithNames };
      if (noPagination) return base;
      const hasMore = count === limit;
      return { ...base, nextCursor: hasMore ? String(safeOffset + limit) : undefined };
    }),

  getCountForUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { count, error } = await ctx.supabase
        .from("respects")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", input.userId);
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load respect count." });
      return { count: count ?? 0 };
    }),
});

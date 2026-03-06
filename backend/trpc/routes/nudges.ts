import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { sendExpoPush } from "../../lib/push";
import type { NudgeRow, ProfileRow, ProfileWithExpoRow, PushTokenRow } from "../../types/db";

export const NUDGE_MESSAGES = [
  "You showed up today. That's discipline.",
  "Don't break the chain.",
  "Small wins stack.",
] as const;

export function pickRandomMessage(): string {
  return NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
}

export const nudgesRouter = createTRPCRouter({
  send: protectedProcedure
    .input(z.object({ toUserId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.toUserId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot nudge yourself.",
        });
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recent } = await ctx.supabase
        .from("nudges")
        .select("id")
        .eq("from_user_id", ctx.userId)
        .eq("to_user_id", input.toUserId)
        .gte("created_at", twentyFourHoursAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You already nudged them today.",
        });
      }

      const message = pickRandomMessage();
      const { data: row, error } = await ctx.supabase
        .from("nudges")
        .insert({
          from_user_id: ctx.userId,
          to_user_id: input.toUserId,
          message,
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send nudge." });

      const [{ data: senderProfile }, pushResult, { data: recipientProfile }] = await Promise.all([
        ctx.supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase.from("push_tokens").select("token").eq("user_id", input.toUserId),
        ctx.supabase
          .from("profiles")
          .select("expo_push_token")
          .eq("user_id", input.toUserId)
          .single(),
      ]);
      const sender = senderProfile as ProfileRow | null;
      const senderName = sender?.display_name ?? sender?.username ?? "Someone";
      const pushBody = `${senderName} nudged you: ${message}`;
      const tokensFromTable = pushResult.error ? [] : (pushResult.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
      const profileToken = (recipientProfile as ProfileWithExpoRow | null)?.expo_push_token ?? null;
      const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))];
      await sendExpoPush(allTokens, "Nudge", pushBody);

      return { success: true, nudgeId: row.id, message };
    }),

  getForUser: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;

      const { data: rows } = await ctx.supabase
        .from("nudges")
        .select("id, from_user_id, to_user_id, message, created_at")
        .eq("to_user_id", ctx.userId)
        .order("created_at", { ascending: false })
        .range(safeOffset, safeOffset + limit - 1);

      const list = (rows ?? []) as NudgeRow[];
      if (!list.length) {
        const noPagination = input?.cursor == null && input?.limit == null;
        return noPagination ? { items: [] } : { items: [], nextCursor: undefined };
      }

      const fromIds = [...new Set(list.map((r) => r.from_user_id))];
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", fromIds);
      const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.user_id, p]));

      const items = list.map((r) => {
        const sender = profileMap.get(r.from_user_id);
        const senderDisplayName = sender?.display_name ?? sender?.username ?? "Someone";
        return {
          id: r.id,
          type: "nudge" as const,
          fromUserId: r.from_user_id,
          fromDisplayName: senderDisplayName,
          toUserId: r.to_user_id,
          message: r.message,
          createdAt: r.created_at,
        };
      });

      const noPagination = input?.cursor == null && input?.limit == null;
      const hasMore = items.length === limit;
      const nextCursor = hasMore ? String(safeOffset + limit) : undefined;
      return noPagination ? { items } : { items, nextCursor };
    }),
});

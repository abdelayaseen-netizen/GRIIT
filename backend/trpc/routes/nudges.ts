import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { sendExpoPush } from "../../lib/push";

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

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

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
      const senderName =
        (senderProfile as any)?.display_name || (senderProfile as any)?.username || "Someone";
      const pushBody = `${senderName} nudged you: ${message}`;
      const tokensFromTable = pushResult.error ? [] : (pushResult.data ?? []).map((r: any) => r.token).filter(Boolean);
      const profileToken = (recipientProfile as any)?.expo_push_token;
      const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))];
      await sendExpoPush(allTokens, "Nudge", pushBody);

      return { success: true, nudgeId: row.id, message };
    }),

  getForUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: rows } = await ctx.supabase
      .from("nudges")
      .select("id, from_user_id, to_user_id, message, created_at")
      .eq("to_user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rows?.length) return { items: [] };

    const fromIds = [...new Set((rows as any[]).map((r) => r.from_user_id))];
    const { data: profiles } = await ctx.supabase
      .from("profiles")
      .select("user_id, username, display_name")
      .in("user_id", fromIds);
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

    const items = (rows as any[]).map((r) => {
      const sender = profileMap.get(r.from_user_id);
      const senderDisplayName =
        sender?.display_name || sender?.username || "Someone";
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

    return { items };
  }),
});

import * as z from "zod";
import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { sendExpoPush } from "../../lib/push";
import type { PgError, ProfileRow, ProfileWithExpoRow, PushTokenRow } from "../../types/db";

const MAX_ACCEPTED_PARTNERS = 3;
const INVITES_PER_DAY_LIMIT = 10;

async function getAcceptedCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from("accountability_pairs")
    .select("id")
    .or(`and(user_id.eq.${userId},status.eq.accepted),and(partner_id.eq.${userId},status.eq.accepted)`);
  return data?.length ?? 0;
}

async function getInvitesSentToday(supabase: SupabaseClient, userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("accountability_pairs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gte("created_at", startOfDay.toISOString());
  return data?.length ?? 0;
}

export const accountabilityRouter = createTRPCRouter({
  invite: protectedProcedure
    .input(z.object({ partnerId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.partnerId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot add yourself as a partner.",
        });
      }

      const acceptedCount = await getAcceptedCount(ctx.supabase, ctx.userId);
      if (acceptedCount >= MAX_ACCEPTED_PARTNERS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You can have at most ${MAX_ACCEPTED_PARTNERS} accountability partners.`,
        });
      }

      const invitesToday = await getInvitesSentToday(ctx.supabase, ctx.userId);
      if (invitesToday >= INVITES_PER_DAY_LIMIT) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You've sent too many invites today. Try again tomorrow.",
        });
      }

      const { data: existing } = await ctx.supabase
        .from("accountability_pairs")
        .select("id, status")
        .or(
          `and(user_id.eq.${ctx.userId},partner_id.eq.${input.partnerId}),and(user_id.eq.${input.partnerId},partner_id.eq.${ctx.userId})`
        )
        .limit(1)
        .maybeSingle();

      if (existing) {
        if (existing.status === "accepted") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You are already accountability partners.",
          });
        }
        if (existing.status === "pending") {
          const { data: row } = await ctx.supabase
            .from("accountability_pairs")
            .select("user_id")
            .eq("id", existing.id)
            .single();
          if (row?.user_id === ctx.userId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invite already sent.",
            });
          }
        }
      }

      const { data: partnerProfile } = await ctx.supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", input.partnerId)
        .single();

      if (!partnerProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const { data: row, error } = await ctx.supabase
        .from("accountability_pairs")
        .upsert(
          {
            user_id: ctx.userId,
            partner_id: input.partnerId,
            status: "pending",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,partner_id" }
        )
        .select()
        .single();

      if (error) {
        if ((error as PgError).code === "23505") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invite already sent or relationship exists.",
          });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send invite." });
      }

      const [{ data: inviterProfile }, pushTokensRes, profileTokenRes] = await Promise.all([
        ctx.supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", ctx.userId)
          .single(),
        ctx.supabase.from("push_tokens").select("token").eq("user_id", input.partnerId),
        ctx.supabase
          .from("profiles")
          .select("expo_push_token")
          .eq("user_id", input.partnerId)
          .single(),
      ]);
      const inviter = inviterProfile as ProfileRow | null;
      const inviterName = inviter?.display_name ?? inviter?.username ?? "Someone";
      const tokensFromTable = pushTokensRes.error ? [] : (pushTokensRes.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
      const profileToken = (profileTokenRes.data as ProfileWithExpoRow | null)?.expo_push_token ?? null;
      const allTokens = [...new Set([...tokensFromTable, profileToken].filter(Boolean))];
      await sendExpoPush(
        allTokens,
        "Accountability partner",
        `${inviterName} wants to be your accountability partner`
      );

      return { success: true, inviteId: row.id, status: "pending" as const };
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const { data: rows, error } = await ctx.supabase
      .from("accountability_pairs")
      .select("id, user_id, partner_id, status, created_at")
      .or(`user_id.eq.${ctx.userId},partner_id.eq.${ctx.userId}`)
      .order("created_at", { ascending: false });

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load partnerships." });

    const accepted: { id: string; partner_id: string; partner_username: string; partner_display_name: string }[] = [];
    const incomingPending: { id: string; user_id: string; username: string; display_name: string }[] = [];
    const outgoingPending: { id: string; partner_id: string; username: string; display_name: string }[] = [];

    const otherIds = new Set<string>();
    for (const r of rows ?? []) {
      const otherId = r.user_id === ctx.userId ? r.partner_id : r.user_id;
      otherIds.add(otherId);
    }

    if (otherIds.size > 0) {
      const { data: profiles } = await ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", [...otherIds]);

      const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.user_id, p]));

      for (const r of rows ?? []) {
        const otherId = r.user_id === ctx.userId ? r.partner_id : r.user_id;
        const p = profileMap.get(otherId) ?? { username: "", display_name: "" };
        const username = p.username ?? "";
        const display_name = p.display_name ?? p.username ?? "";

        if (r.status === "accepted") {
          accepted.push({
            id: r.id,
            partner_id: otherId,
            partner_username: username,
            partner_display_name: display_name,
          });
        } else if (r.status === "pending") {
          if (r.partner_id === ctx.userId) {
            incomingPending.push({
              id: r.id,
              user_id: r.user_id,
              username,
              display_name,
            });
          } else {
            outgoingPending.push({
              id: r.id,
              partner_id: otherId,
              username,
              display_name,
            });
          }
        }
      }
    }

    return { accepted, incomingPending, outgoingPending };
  }),

  respond: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid(), action: z.enum(["accept", "decline"]) }))
    .mutation(async ({ input, ctx }) => {
      const { data: row, error: fetchError } = await ctx.supabase
        .from("accountability_pairs")
        .select("id, user_id, partner_id, status")
        .eq("id", input.inviteId)
        .single();

      if (fetchError || !row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      }
      if (row.partner_id !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the recipient can accept or decline.",
        });
      }
      if (row.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has already been responded to.",
        });
      }

      if (input.action === "accept") {
        const acceptedCount = await getAcceptedCount(ctx.supabase, ctx.userId);
        if (acceptedCount >= MAX_ACCEPTED_PARTNERS) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You can have at most ${MAX_ACCEPTED_PARTNERS} accountability partners.`,
          });
        }

        const { error: updateError } = await ctx.supabase
          .from("accountability_pairs")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", input.inviteId);

        if (updateError) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to accept invite." });
        }

        const [{ data: accepterProfile }, pushRes, profileTokenRes] = await Promise.all([
          ctx.supabase
            .from("profiles")
            .select("display_name, username")
            .eq("user_id", ctx.userId)
            .single(),
          ctx.supabase.from("push_tokens").select("token").eq("user_id", row.user_id),
          ctx.supabase
            .from("profiles")
            .select("expo_push_token")
            .eq("user_id", row.user_id)
            .single(),
        ]);
        const accepter = accepterProfile as ProfileRow | null;
        const accepterName = accepter?.display_name ?? accepter?.username ?? "Someone";
        const tokens = pushRes.error ? [] : (pushRes.data ?? []).map((r: PushTokenRow) => r.token).filter(Boolean);
        const pt = (profileTokenRes.data as ProfileWithExpoRow | null)?.expo_push_token ?? null;
        const allT = [...new Set([...tokens, pt].filter(Boolean))];
        await sendExpoPush(
          allT,
          "Accountability partner",
          `${accepterName} accepted your accountability partner request`
        );

        return { success: true, status: "accepted" as const };
      }

      const { error: declineError } = await ctx.supabase
        .from("accountability_pairs")
        .update({ status: "declined", updated_at: new Date().toISOString() })
        .eq("id", input.inviteId);

      if (declineError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to decline invite." });
      }
      return { success: true, status: "declined" as const };
    }),

  remove: protectedProcedure
    .input(z.object({ partnerId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: rows, error } = await ctx.supabase
        .from("accountability_pairs")
        .select("id")
        .or(
          `and(user_id.eq.${ctx.userId},partner_id.eq.${input.partnerId}),and(user_id.eq.${input.partnerId},partner_id.eq.${ctx.userId})`
        );

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove partnership." });
      if (!rows?.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partnership not found." });
      }

      for (const r of rows) {
        await ctx.supabase.from("accountability_pairs").delete().eq("id", r.id);
      }
      return { success: true };
    }),
});

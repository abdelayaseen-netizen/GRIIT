import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import type { PgError, ProfileRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";
import { sendPushToProfile } from "../../lib/sendPush";
import { logger } from "../../lib/logger";

export const profilesSocialProcedures = {
  followUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself." });
      }
      const { data: target, error: tErr } = await ctx.supabase
        .from("profiles")
        .select("profile_visibility")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (tErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tErr.message });
      }
      const vis = String((target as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
      if (vis === "private" || vis === "friends") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This profile requires a follow request.",
        });
      }
      const { error } = await ctx.supabase.from("user_follows").insert({
        follower_id: ctx.userId,
        following_id: input.userId,
        status: "accepted",
      });
      if (error && (error as PgError).code !== "23505") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string; display_name?: string } | null)?.username ?? "Someone";
      const dname = (me as { username?: string; display_name?: string } | null)?.display_name ?? uname;
      const { error: nErr } = await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.userId,
        type: "follow",
        title: "New follower",
        body: `${dname} started following you`,
        read: false,
        data: {
          requesterId: ctx.userId,
          requesterUsername: uname,
          requesterDisplayName: dname,
        },
      });
      if (nErr && process.env.NODE_ENV !== "test") {
        logger.error({ err: nErr }, "[profiles.followUser] notification insert");
      }

      try {
        const srv = getSupabaseServer() ?? ctx.supabase;
        await sendPushToProfile(srv, input.userId, {
          title: "GRIIT",
          body: `${uname} started following you`,
          data: { type: "follow", actorId: ctx.userId },
        });
      } catch (pushErr) {
        logger.error({ err: pushErr }, "[profiles.followUser] push send error");
      }

      return { success: true as const };
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { success: true as const };
    }),

  sendFollowRequest: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid target." });
      }
      const { data: target, error: tErr } = await ctx.supabase
        .from("profiles")
        .select("profile_visibility, username")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (tErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tErr.message });
      }
      const vis = String((target as { profile_visibility?: string } | null)?.profile_visibility ?? "public").toLowerCase();
      if (vis !== "private" && vis !== "friends") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Use follow for public profiles." });
      }
      const { data: existing } = await ctx.supabase
        .from("user_follows")
        .select("status")
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId)
        .maybeSingle();
      const exSt = String((existing as { status?: string } | null)?.status ?? "").toLowerCase();
      if (existing && exSt === "accepted") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already following." });
      }
      if (existing && exSt === "pending") {
        return { success: true as const };
      }
      const { error } = await ctx.supabase.from("user_follows").insert({
        follower_id: ctx.userId,
        following_id: input.userId,
        status: "pending",
      });
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string } | null)?.username ?? "Someone";
      const dname = (me as { display_name?: string } | null)?.display_name ?? uname;
      const { error: nErr } = await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.userId,
        type: "follow_request",
        title: "New follow request",
        body: `${uname} wants to follow you`,
        read: false,
        data: {
          requesterId: ctx.userId,
          requesterUsername: uname,
          requesterDisplayName: dname,
        },
      });
      if (nErr && process.env.NODE_ENV !== "test") {
        logger.error({ err: nErr }, "[profiles.sendFollowRequest] notification insert");
      }

      try {
        const srv = getSupabaseServer() ?? ctx.supabase;
        await sendPushToProfile(srv, input.userId, {
          title: "GRIIT",
          body: `${uname} wants to follow you`,
          data: { type: "follow_request", actorId: ctx.userId },
        });
      } catch (pushErr) {
        logger.error({ err: pushErr }, "[profiles.sendFollowRequest] push send error");
      }

      return { success: true as const };
    }),

  acceptFollowRequest: protectedProcedure
    .input(z.object({ requesterId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: row, error: uErr } = await ctx.supabase
        .from("user_follows")
        .update({ status: "accepted" })
        .eq("follower_id", input.requesterId)
        .eq("following_id", ctx.userId)
        .eq("status", "pending")
        .select("follower_id")
        .maybeSingle();
      if (uErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: uErr.message });
      }
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No pending request." });
      }
      const { data: me } = await ctx.supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const uname = (me as { username?: string } | null)?.username ?? "Someone";
      await ctx.supabase.from("in_app_notifications").insert({
        user_id: input.requesterId,
        type: "general",
        title: "Request accepted",
        body: `${uname} accepted your follow request`,
        read: false,
        data: { accepterId: ctx.userId, accepterUsername: uname },
      });

      try {
        const srv = getSupabaseServer() ?? ctx.supabase;
        await sendPushToProfile(srv, input.requesterId, {
          title: "GRIIT",
          body: `${uname} accepted your follow request`,
          data: { type: "general", actorId: ctx.userId },
        });
      } catch (pushErr) {
        logger.error({ err: pushErr }, "[profiles.acceptFollowRequest] push send error");
      }

      return { success: true as const };
    }),

  declineFollowRequest: protectedProcedure
    .input(z.object({ requesterId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", input.requesterId)
        .eq("following_id", ctx.userId)
        .eq("status", "pending");
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { success: true as const };
    }),

  getFollowStatus: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        return { status: "none" as const };
      }
      const { data, error } = await ctx.supabase
        .from("user_follows")
        .select("status")
        .eq("follower_id", ctx.userId)
        .eq("following_id", input.userId)
        .maybeSingle();
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      const st = String((data as { status?: string } | null)?.status ?? "").toLowerCase();
      if (!data) return { status: "none" as const };
      if (st === "pending") return { status: "pending" as const };
      return { status: "following" as const };
    }),

  getFollowCounts: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { getSupabaseServer } = await import("../../lib/supabase-server");
      const server = getSupabaseServer() ?? ctx.supabase;
      const { count: followers, error: fErr } = await server
        .from("user_follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", input.userId)
        .eq("status", "accepted");
      if (fErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: fErr.message });
      }
      const { count: following, error: gErr } = await server
        .from("user_follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", input.userId)
        .eq("status", "accepted");
      if (gErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: gErr.message });
      }
      return { followers: followers ?? 0, following: following ?? 0 };
    }),

  getPendingFollowRequests: protectedProcedure.query(async ({ ctx }) => {
    const { data: rows, error } = await ctx.supabase
      .from("user_follows")
      .select("follower_id, created_at")
      .eq("following_id", ctx.userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    const ids = [...new Set((rows ?? []).map((r: { follower_id: string }) => r.follower_id))];
    if (ids.length === 0) return [];
    const server = getSupabaseServer() ?? ctx.supabase;
    const { data: profs } = await server.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", ids).limit(50);
    const pmap = new Map((profs ?? []).map((p: ProfileRow) => [p.user_id, p]));
    return (rows ?? []).map((r: { follower_id: string; created_at: string }) => {
      const p = pmap.get(r.follower_id);
      return {
        id: `${r.follower_id}:${r.created_at}`,
        requesterId: r.follower_id,
        requesterUsername: p?.username ?? "?",
        requesterAvatarUrl: p?.avatar_url ?? null,
        createdAt: r.created_at,
      };
    });
  }),

};

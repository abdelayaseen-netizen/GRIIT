import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import type { PgError, ProfileRow } from "../../types/db";
import { getSupabaseServer } from "../../lib/supabase-server";
import { sendPushToProfile } from "../../lib/sendPush";
import { logger } from "../../lib/logger";
import { followRowAccepted } from "../../lib/feed-activity-hydrate";

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

  /**
   * Discover — Suggested people to follow.
   *
   * Returns up to `limit` (default 10) profiles the viewer is NOT already
   * following (or pending) and is not the viewer themselves. Excludes private
   * profiles. Ranked by `streaks.active_streak_count` desc, then by
   * `total_days_secured` desc as a tiebreaker, then most-recently created.
   */
  suggested: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const server = getSupabaseServer() ?? ctx.supabase;
      const viewerId = ctx.userId;

      const { data: existing } = await ctx.supabase
        .from("user_follows")
        .select("following_id, status")
        .eq("follower_id", viewerId)
        .limit(500);
      const exclude = new Set<string>([viewerId]);
      for (const r of (existing ?? []) as { following_id: string; status?: string | null }[]) {
        const s = String(r.status ?? "").toLowerCase();
        if (s === "accepted" || s === "pending") exclude.add(r.following_id);
      }

      const { data: rows, error } = await server
        .from("profiles")
        .select(
          "user_id, username, display_name, avatar_url, total_days_secured, profile_visibility, created_at"
        )
        .in("profile_visibility", ["public", "friends"])
        .order("total_days_secured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      type SuggestedRow = ProfileRow & {
        profile_visibility?: string | null;
        created_at?: string | null;
      };
      const candidates = ((rows ?? []) as SuggestedRow[]).filter((p) => !exclude.has(p.user_id));
      if (candidates.length === 0) return [];

      const ids = candidates.map((p) => p.user_id);
      const { data: streakRows } = await server
        .from("streaks")
        .select("user_id, active_streak_count")
        .in("user_id", ids)
        .limit(200);
      const streakMap = new Map<string, number>();
      for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number | null }[]) {
        streakMap.set(s.user_id, Math.max(0, Number(s.active_streak_count ?? 0)));
      }

      const ranked = [...candidates].sort((a, b) => {
        const sa = streakMap.get(a.user_id) ?? 0;
        const sb = streakMap.get(b.user_id) ?? 0;
        if (sb !== sa) return sb - sa;
        const da = Number(a.total_days_secured ?? 0);
        const db = Number(b.total_days_secured ?? 0);
        if (db !== da) return db - da;
        const ta = new Date(String(a.created_at ?? 0)).getTime();
        const tb = new Date(String(b.created_at ?? 0)).getTime();
        return tb - ta;
      });

      return ranked.slice(0, limit).map((r) => ({
        user_id: r.user_id,
        username: r.username ?? "",
        display_name: r.display_name ?? r.username ?? "",
        avatar_url: r.avatar_url ?? null,
        current_streak: streakMap.get(r.user_id) ?? 0,
        is_private: String(r.profile_visibility ?? "public").toLowerCase() !== "public",
      }));
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

  /**
   * Mutual followers — accounts the viewer follows that also follow `targetUserId`.
   * Used by `MutualFollowersRow` on the public profile screen as social proof.
   * Returns up to `limit` display names plus the total mutual count. Self-views
   * return an empty result so the row never renders for one's own profile.
   */
  getMutualFollowers: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string().uuid(),
        limit: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ input, ctx }) => {
      const viewerId = ctx.userId;
      if (viewerId === input.targetUserId) {
        return { topNames: [], totalCount: 0 };
      }

      // Step 1: who does the viewer follow (accepted only)?
      const { data: viewerFollowing, error: vErr } = await ctx.supabase
        .from("user_follows")
        .select("following_id, status")
        .eq("follower_id", viewerId)
        .limit(500);
      if (vErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: vErr.message });
      }

      const viewerFollowingIds = ((viewerFollowing ?? []) as {
        following_id: string;
        status?: string | null;
      }[])
        .filter(followRowAccepted)
        .map((r) => r.following_id);

      if (viewerFollowingIds.length === 0) {
        return { topNames: [], totalCount: 0 };
      }

      // Step 2: of those, which ones follow the target (accepted only)?
      const { data: mutuals, error: mErr } = await ctx.supabase
        .from("user_follows")
        .select("follower_id, status")
        .eq("following_id", input.targetUserId)
        .in("follower_id", viewerFollowingIds)
        .limit(500);
      if (mErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: mErr.message });
      }

      const mutualIds = ((mutuals ?? []) as {
        follower_id: string;
        status?: string | null;
      }[])
        .filter(followRowAccepted)
        .map((r) => r.follower_id);

      if (mutualIds.length === 0) {
        return { topNames: [], totalCount: 0 };
      }

      // Step 3: hydrate display names for the top N mutuals.
      const server = getSupabaseServer() ?? ctx.supabase;
      const { data: profiles, error: pErr } = await server
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", mutualIds.slice(0, input.limit))
        .limit(input.limit);
      if (pErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: pErr.message });
      }

      const topNames = ((profiles ?? []) as {
        display_name?: string | null;
        username?: string | null;
      }[])
        .map((p) => (p.display_name ?? "").trim() || (p.username ?? "").trim() || "Someone")
        .filter((n) => n.length > 0);

      return {
        topNames,
        totalCount: mutualIds.length,
      };
    }),

};

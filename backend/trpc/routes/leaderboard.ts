import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure, type Context } from "../create-context";
import type { LeaderboardProfileRow, LeaderboardStreakRow } from "../../types/db";
import { getTodayDateKey, getRollingWeekStartDateKey } from "../../lib/date-utils";
import { getCached, setCached } from "../../lib/cache";
import { getSupabaseServer } from "../../lib/supabase-server";
import { consistencyScore } from "../../lib/scoring";

const LEADERBOARD_MAX = 100;

function followRowAcceptedLb(row: { status?: string | null }): boolean {
  return String(row.status ?? "accepted").toLowerCase() === "accepted";
}

async function mutualFriendUserIds(ctx: Context, viewerId: string): Promise<Set<string>> {
  const { data: out } = await ctx.supabase.from("user_follows").select("following_id, status").eq("follower_id", viewerId).limit(200);
  const iFollow = new Set<string>();
  for (const r of (out ?? []) as { following_id: string; status?: string | null }[]) {
    if (followRowAcceptedLb(r)) iFollow.add(r.following_id);
  }
  const { data: inc } = await ctx.supabase.from("user_follows").select("follower_id, status").eq("following_id", viewerId).limit(200);
  const mutual = new Set<string>();
  for (const r of (inc ?? []) as { follower_id: string; status?: string | null }[]) {
    if (followRowAcceptedLb(r) && iFollow.has(r.follower_id)) mutual.add(r.follower_id);
  }
  return mutual;
}

export const leaderboardRouter = createTRPCRouter({
  getWeekly: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(LEADERBOARD_MAX).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? LEADERBOARD_MAX;
      const offset = input?.cursor ? parseInt(input.cursor, 10) : 0;
      const safeOffset = Number.isNaN(offset) || offset < 0 ? 0 : offset;
      const noPagination = input?.cursor == null && input?.limit == null;

      const todayKey = getTodayDateKey();
      const weekStartKey = getRollingWeekStartDateKey();
      const userId = ctx.userId;
      const server = getSupabaseServer() ?? ctx.supabase;
      const weeklyCacheKey = `leaderboard:weekly:v1:${weekStartKey}:${todayKey}:${userId ?? "anon"}`;
      const canCacheWeekly = noPagination && safeOffset === 0;

      if (canCacheWeekly) {
        const cached = await getCached<unknown>(weeklyCacheKey);
        if (cached != null) return cached;
      }

      const { data: secures, error: securesErr } = await server
        .from("day_secures")
        .select("user_id, date_key")
        .gte("date_key", weekStartKey)
        .lte("date_key", todayKey)
        .limit(2000);
      if (securesErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: securesErr.message });
      }

      const countByUser = new Map<string, number>();
      for (const row of secures ?? []) {
        const uid = (row as { user_id: string }).user_id;
        countByUser.set(uid, (countByUser.get(uid) ?? 0) + 1);
      }

      const sortedUserIds = Array.from(countByUser.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([uid]) => uid)
        .slice(safeOffset, safeOffset + limit);

      if (sortedUserIds.length === 0) {
        const empty = { entries: [], currentUserRank: null, totalSecuredToday: 0 };
        const out = noPagination ? empty : { ...empty, nextCursor: undefined };
        if (canCacheWeekly) await setCached(weeklyCacheKey, out, 120);
        return out;
      }

      const [profilesResult, streaksResult, todaySecuresResult, respectCountsResult] = await Promise.all([
        server
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", sortedUserIds)
          .limit(200),
        server
          .from("streaks")
          .select("user_id, active_streak_count")
          .in("user_id", sortedUserIds)
          .limit(200),
        server
          .from("day_secures")
          .select("user_id")
          .eq("date_key", todayKey)
          .limit(1000),
        server
          .from("respects")
          .select("recipient_id")
          .in("recipient_id", sortedUserIds)
          .limit(10000),
      ]);
      const profiles = profilesResult.data;
      const streaks = streaksResult.data;
      const todaySecures = todaySecuresResult.data;
      const totalSecuredToday = new Set(
        (todaySecures ?? []).map((r: { user_id: string }) => r.user_id)
      ).size;
      const respectCounts = respectCountsResult.data;
      const respectByUser = new Map<string, number>();
      for (const r of respectCounts ?? []) {
        const id = (r as { recipient_id: string }).recipient_id;
        respectByUser.set(id, (respectByUser.get(id) ?? 0) + 1);
      }

      const profileMap = new Map(
        (profiles ?? []).map((p: LeaderboardProfileRow) => [p.user_id, p])
      );
      const streakMap = new Map(
        (streaks ?? []).map((s: LeaderboardStreakRow) => [s.user_id, s])
      );

      const entries = sortedUserIds.map((uid, index) => {
        const p = profileMap.get(uid);
        const s = streakMap.get(uid);
        return {
          userId: uid,
          username: p?.username ?? "?",
          displayName: p?.display_name ?? p?.username ?? "?",
          avatarUrl: p?.avatar_url ?? null,
          securedDaysThisWeek: countByUser.get(uid) ?? 0,
          currentStreak: s?.active_streak_count ?? 0,
          rank: safeOffset + index + 1,
          respectCount: respectByUser.get(uid) ?? 0,
        };
      });

      const allSorted = Array.from(countByUser.entries()).sort((a, b) => b[1] - a[1]).map(([uid]) => uid);
      const currentUserRank = userId ? allSorted.indexOf(userId) + 1 || null : null;
      const hasMore = safeOffset + entries.length < allSorted.length;
      const nextCursor = hasMore ? String(safeOffset + limit) : undefined;

      const base = {
        entries,
        currentUserRank: currentUserRank && currentUserRank > 0 ? currentUserRank : null,
        totalSecuredToday,
      };
      const result = noPagination ? base : { ...base, nextCursor };
      if (canCacheWeekly) await setCached(weeklyCacheKey, result, 120);
      return result;
    }),

  getFriendsBoard: protectedProcedure.query(async ({ ctx }) => {
    const server = getSupabaseServer() ?? ctx.supabase;
    const viewerId = ctx.userId;
    const weekStartKey = getRollingWeekStartDateKey();
    const todayKey = getTodayDateKey();

    const mutual = await mutualFriendUserIds(ctx, viewerId);
    const candidateIds = [...new Set([viewerId, ...mutual])];

    const { data: secures, error: sErr } = await server
      .from("day_secures")
      .select("user_id")
      .in("user_id", candidateIds)
      .gte("date_key", weekStartKey)
      .lte("date_key", todayKey)
      .limit(5000);
    if (sErr) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: sErr.message });
    }
    const checkInCount = new Map<string, number>();
    for (const row of secures ?? []) {
      const uid = (row as { user_id: string }).user_id;
      checkInCount.set(uid, (checkInCount.get(uid) ?? 0) + 1);
    }

    const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", candidateIds).limit(200);
    const streakMap = new Map<string, number>();
    for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) {
      streakMap.set(s.user_id, s.active_streak_count ?? 0);
    }

    const { data: profiles } = await server
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", candidateIds)
      .limit(200);

    const profileMap = new Map((profiles ?? []).map((p: LeaderboardProfileRow) => [p.user_id, p]));

    type Row = {
      userId: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
      checkInsThisWeek: number;
      currentStreak: number;
      points: number;
    };

    const rows: Row[] = candidateIds.map((uid) => {
      const p = profileMap.get(uid);
      const checkIns = checkInCount.get(uid) ?? 0;
      const streak = streakMap.get(uid) ?? 0;
      return {
        userId: uid,
        username: p?.username ?? "?",
        displayName: p?.display_name ?? p?.username ?? "?",
        avatarUrl: p?.avatar_url ?? null,
        checkInsThisWeek: checkIns,
        currentStreak: streak,
        points: consistencyScore(checkIns, streak),
      };
    });

    rows.sort((a, b) => b.points - a.points);
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
    const leaderPts = ranked[0]?.points ?? 1;

    return {
      leaderPoints: leaderPts,
      entries: ranked.map((r) => ({
        userId: r.userId,
        username: r.username,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        rank: r.rank,
        points: r.points,
        checkInsThisWeek: r.checkInsThisWeek,
        currentStreak: r.currentStreak,
        progressVsLeader: leaderPts > 0 ? Math.min(100, Math.round((r.points / leaderPts) * 100)) : 0,
        gapToAbove:
          r.rank > 1 ? Math.max(0, ranked[r.rank - 2]!.points - r.points) : 0,
      })),
    };
  }),

  getChallengeBoard: protectedProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        scope: z.enum(["friends", "everyone"]).optional().default("everyone"),
      })
    )
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const viewerId = ctx.userId;
      const weekStartKey = getRollingWeekStartDateKey();
      const todayKey = getTodayDateKey();

      const { data: ch, error: chErr } = await server.from("challenges").select("id, visibility, title").eq("id", input.challengeId).maybeSingle();
      if (chErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: chErr.message });
      if (!ch) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

      const vis = String((ch as { visibility?: string }).visibility ?? "public").toLowerCase();

      const { data: participants, error: pErr } = await server
        .from("active_challenges")
        .select("user_id")
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .limit(500);
      if (pErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: pErr.message });

      let userIds = [...new Set((participants ?? []).map((r: { user_id: string }) => r.user_id))];
      if (vis === "private") {
        userIds = userIds.filter((id) => id === viewerId);
        if (!userIds.includes(viewerId)) userIds = [viewerId];
      }

      if (input.scope === "friends" && vis !== "private") {
        const mutual = await mutualFriendUserIds(ctx, viewerId);
        userIds = userIds.filter((id) => id === viewerId || mutual.has(id));
      }

      if (userIds.length === 0) {
        return { leaderPoints: 1, challengeTitle: (ch as { title?: string }).title ?? "Challenge", visibility: vis, entries: [] };
      }

      const { data: secures } = await server
        .from("day_secures")
        .select("user_id")
        .in("user_id", userIds)
        .gte("date_key", weekStartKey)
        .lte("date_key", todayKey)
        .limit(5000);
      const checkInCount = new Map<string, number>();
      for (const row of secures ?? []) {
        const uid = (row as { user_id: string }).user_id;
        checkInCount.set(uid, (checkInCount.get(uid) ?? 0) + 1);
      }

      const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", userIds).limit(200);
      const streakMap = new Map<string, number>();
      for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) {
        streakMap.set(s.user_id, s.active_streak_count ?? 0);
      }

      const { data: profiles } = await server
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds)
        .limit(200);
      const profileMap = new Map((profiles ?? []).map((p: LeaderboardProfileRow) => [p.user_id, p]));

      const rows = userIds.map((uid) => {
        const p = profileMap.get(uid);
        const checkIns = checkInCount.get(uid) ?? 0;
        const streak = streakMap.get(uid) ?? 0;
        return {
          userId: uid,
          username: p?.username ?? "?",
          displayName: p?.display_name ?? p?.username ?? "?",
          avatarUrl: p?.avatar_url ?? null,
          checkInsThisWeek: checkIns,
          currentStreak: streak,
          points: consistencyScore(checkIns, streak),
        };
      });
      rows.sort((a, b) => b.points - a.points);
      const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
      const leaderPts = ranked[0]?.points ?? 1;

      return {
        leaderPoints: leaderPts,
        challengeTitle: (ch as { title?: string }).title ?? "Challenge",
        visibility: vis,
        entries: ranked.map((r) => ({
          userId: r.userId,
          username: r.username,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl,
          rank: r.rank,
          points: r.points,
          checkInsThisWeek: r.checkInsThisWeek,
          currentStreak: r.currentStreak,
          progressVsLeader: leaderPts > 0 ? Math.min(100, Math.round((r.points / leaderPts) * 100)) : 0,
          gapToAbove: r.rank > 1 ? Math.max(0, ranked[r.rank - 2]!.points - r.points) : 0,
        })),
      };
    }),
});

import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
import type { LeaderboardProfileRow, LeaderboardStreakRow } from "../../types/db";
import { getTodayDateKey } from "../../lib/date-utils";
import { getCached, setCached } from "../../lib/cache";
import { getSupabaseServer } from "../../lib/supabase-server";
import { consistencyScore } from "../../lib/scoring";
import { getMembersWithStats } from "./team";

function getWeekStartDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

const LEADERBOARD_MAX = 100;

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
      const weekStartKey = getWeekStartDateKey();
      const userId = ctx.userId;
      const weeklyCacheKey = `leaderboard:weekly:v1:${weekStartKey}:${todayKey}:${userId ?? "anon"}`;
      const canCacheWeekly = noPagination && safeOffset === 0;

      if (canCacheWeekly) {
        const cached = await getCached<unknown>(weeklyCacheKey);
        if (cached != null) return cached;
      }

      const { data: secures } = await ctx.supabase
        .from("day_secures")
        .select("user_id, date_key")
        .gte("date_key", weekStartKey)
        .lte("date_key", todayKey)
        .limit(10000);

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
        ctx.supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", sortedUserIds),
        ctx.supabase
          .from("streaks")
          .select("user_id, active_streak_count")
          .in("user_id", sortedUserIds),
        ctx.supabase
          .from("day_secures")
          .select("user_id")
          .eq("date_key", todayKey)
          .limit(5000),
        ctx.supabase
          .from("respects")
          .select("recipient_id")
          .in("recipient_id", sortedUserIds),
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
    const weekStartKey = getWeekStartDateKey();
    const todayKey = getTodayDateKey();

    const followingIds: string[] = [];
    const { data: follows, error: fErr } = await ctx.supabase.from("user_follows").select("following_id").eq("follower_id", viewerId);
    if (!fErr && follows) {
      for (const r of follows as { following_id: string }[]) followingIds.push(r.following_id);
    }
    const candidateIds = [...new Set([viewerId, ...followingIds])];

    const { data: secures, error: sErr } = await server
      .from("day_secures")
      .select("user_id")
      .in("user_id", candidateIds)
      .gte("date_key", weekStartKey)
      .lte("date_key", todayKey);
    if (sErr) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: sErr.message });
    }
    const checkInCount = new Map<string, number>();
    for (const row of secures ?? []) {
      const uid = (row as { user_id: string }).user_id;
      checkInCount.set(uid, (checkInCount.get(uid) ?? 0) + 1);
    }

    const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", candidateIds);
    const streakMap = new Map<string, number>();
    for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) {
      streakMap.set(s.user_id, s.active_streak_count ?? 0);
    }

    const { data: profiles } = await server
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", candidateIds);

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
    .input(z.object({ challengeId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const server = getSupabaseServer() ?? ctx.supabase;
      const viewerId = ctx.userId;
      const weekStartKey = getWeekStartDateKey();
      const todayKey = getTodayDateKey();

      const { data: ch, error: chErr } = await server.from("challenges").select("id, visibility, title").eq("id", input.challengeId).maybeSingle();
      if (chErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: chErr.message });
      if (!ch) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

      const vis = String((ch as { visibility?: string }).visibility ?? "public").toLowerCase();

      const { data: participants, error: pErr } = await server
        .from("active_challenges")
        .select("user_id")
        .eq("challenge_id", input.challengeId)
        .eq("status", "active");
      if (pErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: pErr.message });

      let userIds = [...new Set((participants ?? []).map((r: { user_id: string }) => r.user_id))];
      if (vis === "private") {
        userIds = userIds.filter((id) => id === viewerId);
        if (!userIds.includes(viewerId)) userIds = [viewerId];
      }

      if (userIds.length === 0) {
        return { leaderPoints: 1, challengeTitle: (ch as { title?: string }).title ?? "Challenge", visibility: vis, entries: [] };
      }

      const { data: secures } = await server
        .from("day_secures")
        .select("user_id")
        .in("user_id", userIds)
        .gte("date_key", weekStartKey)
        .lte("date_key", todayKey);
      const checkInCount = new Map<string, number>();
      for (const row of secures ?? []) {
        const uid = (row as { user_id: string }).user_id;
        checkInCount.set(uid, (checkInCount.get(uid) ?? 0) + 1);
      }

      const { data: streakRows } = await server.from("streaks").select("user_id, active_streak_count").in("user_id", userIds);
      const streakMap = new Map<string, number>();
      for (const s of (streakRows ?? []) as { user_id: string; active_streak_count?: number }[]) {
        streakMap.set(s.user_id, s.active_streak_count ?? 0);
      }

      const { data: profiles } = await server
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);
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

  getTeamBoard: protectedProcedure
    .input(z.object({ teamId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      let teamId = input.teamId;
      if (!teamId) {
        const { data: memberships } = await ctx.supabase
          .from("team_members")
          .select("team_id, joined_at")
          .eq("user_id", ctx.userId)
          .order("joined_at", { ascending: false })
          .limit(1);
        teamId = (memberships?.[0] as { team_id?: string } | undefined)?.team_id;
      }
      if (!teamId) {
        return { teamName: null as string | null, goalMode: "individual" as const, leaderPoints: 1, entries: [] as unknown[] };
      }

      const { data: me } = await ctx.supabase.from("team_members").select("id").eq("team_id", teamId).eq("user_id", ctx.userId).maybeSingle();
      if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });

      const { data: teamRow } = await ctx.supabase.from("teams").select("name, goal_mode").eq("id", teamId).single();
      const goalMode = ((teamRow as { goal_mode?: string } | null)?.goal_mode ?? "individual") as "individual" | "shared";

      const members = await getMembersWithStats(ctx as { supabase: typeof ctx.supabase; userId: string }, teamId);
      const base = members.map((m) => ({
        userId: m.user_id,
        username: m.profiles?.username ?? "?",
        displayName: m.profiles?.display_name ?? m.profiles?.username ?? "Member",
        avatarUrl: m.profiles?.avatar_url ?? null,
        checkInsThisWeek: m.tasks_completed ?? 0,
        currentStreak: m.current_streak ?? 0,
      }));

      const sorted = [...base].sort((a, b) => {
        if (goalMode === "shared") return b.checkInsThisWeek - a.checkInsThisWeek;
        if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
        return b.checkInsThisWeek - a.checkInsThisWeek;
      });

      const leaderPts = sorted[0]
        ? consistencyScore(Math.max(0, sorted[0].checkInsThisWeek), sorted[0].currentStreak)
        : 1;

      const ranked = sorted.map((r, i) => {
        const points = consistencyScore(Math.max(0, r.checkInsThisWeek), r.currentStreak);
        const abovePts =
          i > 0 ? consistencyScore(Math.max(0, sorted[i - 1]!.checkInsThisWeek), sorted[i - 1]!.currentStreak) : points;
        return {
          userId: r.userId,
          username: r.username,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl,
          rank: i + 1,
          points,
          checkInsThisWeek: r.checkInsThisWeek,
          currentStreak: r.currentStreak,
          progressVsLeader: leaderPts > 0 ? Math.min(100, Math.round((points / leaderPts) * 100)) : 0,
          gapToAbove: i > 0 ? Math.max(0, abovePts - points) : 0,
        };
      });

      return {
        teamName: (teamRow as { name?: string } | null)?.name ?? "Team",
        goalMode,
        leaderPoints: leaderPts,
        entries: ranked,
      };
    }),
});

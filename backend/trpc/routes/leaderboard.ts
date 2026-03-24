import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import type { LeaderboardProfileRow, LeaderboardStreakRow } from "../../types/db";
import { getTodayDateKey } from "../../lib/date-utils";
import { getCached, setCached } from "../../lib/cache";

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
});

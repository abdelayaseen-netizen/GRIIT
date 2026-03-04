import * as z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";

function getWeekStartDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().split("T")[0];
}

export const leaderboardRouter = createTRPCRouter({
  getWeekly: publicProcedure.query(async ({ ctx }) => {
    const todayKey = new Date().toISOString().split("T")[0];
    const weekStartKey = getWeekStartDateKey();
    const userId = ctx.userId;

    const { data: secures } = await ctx.supabase
      .from("day_secures")
      .select("user_id, date_key")
      .gte("date_key", weekStartKey)
      .lte("date_key", todayKey);

    const countByUser = new Map<string, number>();
    for (const row of secures ?? []) {
      const uid = row.user_id;
      countByUser.set(uid, (countByUser.get(uid) ?? 0) + 1);
    }

    const LEADERBOARD_TOP = 100;
    const sortedUserIds = Array.from(countByUser.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([uid]) => uid)
      .slice(0, LEADERBOARD_TOP);

    if (sortedUserIds.length === 0) {
      return {
        entries: [],
        currentUserRank: null,
        totalSecuredToday: 0,
      };
    }

    const { data: profiles } = await ctx.supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", sortedUserIds);

    const { data: streaks } = await ctx.supabase
      .from("streaks")
      .select("user_id, active_streak_count")
      .in("user_id", sortedUserIds);

    const { data: todaySecures } = await ctx.supabase
      .from("day_secures")
      .select("user_id")
      .eq("date_key", todayKey);
    const totalSecuredToday = new Set((todaySecures ?? []).map((r: any) => r.user_id)).size;

    const { data: respectCounts } = await ctx.supabase
      .from("respects")
      .select("recipient_id")
      .in("recipient_id", sortedUserIds);
    const respectByUser = new Map<string, number>();
    for (const r of respectCounts ?? []) {
      const id = (r as any).recipient_id;
      respectByUser.set(id, (respectByUser.get(id) ?? 0) + 1);
    }

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const streakMap = new Map((streaks ?? []).map((s: any) => [s.user_id, s]));

    const entries = sortedUserIds.map((userId, index) => {
      const p = profileMap.get(userId);
      const s = streakMap.get(userId);
      return {
        userId,
        username: p?.username ?? "?",
        displayName: p?.display_name ?? p?.username ?? "?",
        avatarUrl: p?.avatar_url ?? null,
        securedDaysThisWeek: countByUser.get(userId) ?? 0,
        currentStreak: s?.active_streak_count ?? 0,
        rank: index + 1,
        respectCount: respectByUser.get(userId) ?? 0,
      };
    });

    const currentUserRank = userId ? (sortedUserIds.indexOf(userId) + 1 || null) : null;

    return {
      entries,
      currentUserRank: currentUserRank > 0 ? currentUserRank : null,
      totalSecuredToday,
    };
  }),
});

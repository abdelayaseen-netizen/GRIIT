import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";

export const profilesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      username: z.string().min(3),
      display_name: z.string().optional(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
      cover_url: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .upsert({
          user_id: ctx.userId,
          username: input.username,
          display_name: input.display_name || input.username,
          bio: input.bio || '',
          avatar_url: input.avatar_url,
          cover_url: input.cover_url,
          onboarding_completed: false,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        const code = (error as any).code;
        if (code === '23505') {
          throw new Error('Username already taken');
        }
        throw new Error(error.message);
      }
      return data;
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', ctx.userId)
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    }),

  update: protectedProcedure
    .input(z.object({
      username: z.string().min(3).optional(),
      display_name: z.string().optional(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
      cover_url: z.string().optional(),
      onboarding_completed: z.boolean().optional(),
      onboarding_completed_at: z.string().optional(),
      primary_goal: z.string().optional(),
      daily_time_budget: z.string().optional(),
      starter_challenge_id: z.string().optional(),
      preferred_secure_time: z.string().optional(), // "HH:mm" e.g. "20:00"
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(input)
        .eq('user_id', ctx.userId)
        .select()
        .single();

      if (error) {
        const code = (error as any).code;
        if (code === '23505') {
          throw new Error('Username already taken');
        }
        throw new Error(error.message);
      }
      return data;
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [activeChallenges, completedChallenges, streakData, profileResult, freezesResult] = await Promise.all([
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'active'),
        ctx.supabase
          .from('active_challenges')
          .select('id')
          .eq('user_id', ctx.userId)
          .eq('status', 'completed'),
        ctx.supabase
          .from('streaks')
          .select('*')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('profiles')
          .select('streak_freeze_used_count, streak_freeze_reset_at, total_days_secured, tier, preferred_secure_time')
          .eq('user_id', ctx.userId)
          .maybeSingle(),
        ctx.supabase
          .from('streak_freezes')
          .select('date_key')
          .eq('user_id', ctx.userId),
      ]);

      const profileRow = profileResult?.error ? { data: null } : profileResult;
      const freezesRows = freezesResult?.error ? { data: [] } : freezesResult;

      const streakFreezePerMonth = 1;
      let usedCount = profileRow?.data?.streak_freeze_used_count ?? 0;
      let resetAt = profileRow?.data?.streak_freeze_reset_at ? new Date(profileRow.data.streak_freeze_reset_at) : new Date();
      const now = new Date();
      if (resetAt && (now.getTime() - new Date(resetAt).getTime()) / (1000 * 60 * 60 * 24) >= 30) {
        usedCount = 0;
        resetAt = now;
        await ctx.supabase
          .from('profiles')
          .update({ streak_freeze_used_count: 0, streak_freeze_reset_at: resetAt.toISOString() })
          .eq('user_id', ctx.userId)
          .then(() => {})
          .catch(() => {});
      }
      const freezesRemaining = Math.max(0, streakFreezePerMonth - usedCount);
      const frozenDateKeys = new Set((freezesRows?.data ?? []).map((r: any) => r.date_key));

      const lastCompletedDateKey = streakData.data?.last_completed_date_key ?? null;
      const todayKey = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];

      let effectiveMissedDays = 0;
      if (lastCompletedDateKey != null && lastCompletedDateKey < todayKey) {
        const missed = daysBetweenKeys(lastCompletedDateKey, yesterdayKey);
        effectiveMissedDays = missed.filter((k: string) => !frozenDateKeys.has(k)).length;
      }

      const activeStreak = streakData.data?.active_streak_count ?? 0;
      const canUseFreeze = effectiveMissedDays === 1 && activeStreak > 0 && freezesRemaining > 0;

      const totalDaysSecured = profileRow?.data?.total_days_secured ?? 0;
      const tier = profileRow?.data?.tier ?? getTierForDays(totalDaysSecured);
      const pointsToNextTier = getPointsToNextTier(totalDaysSecured);
      const nextTierName = getNextTierName(totalDaysSecured);
      const preferredSecureTime = profileRow?.data?.preferred_secure_time ?? '20:00';

      return {
        activeChallenges: activeChallenges.data?.length || 0,
        completedChallenges: completedChallenges.data?.length || 0,
        activeStreak: streakData.data?.active_streak_count || 0,
        longestStreak: streakData.data?.longest_streak_count || 0,
        lastCompletedDateKey: lastCompletedDateKey,
        streakFreezeUsedCount: usedCount,
        streakFreezeResetAt: resetAt.toISOString(),
        freezesRemaining,
        effectiveMissedDays,
        canUseFreeze,
        totalDaysSecured,
        tier,
        pointsToNextTier,
        nextTierName,
        preferredSecureTime,
      };
    }),
});

function daysBetweenKeys(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  const [sy, sm, sd] = startKey.split('-').map(Number);
  const [ey, em, ed] = endKey.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    out.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

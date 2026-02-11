import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

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
          id: ctx.userId,
          username: input.username,
          display_name: input.display_name || input.username,
          bio: input.bio || '',
          avatar_url: input.avatar_url,
          cover_url: input.cover_url,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        const code = (error as any).code;
        if (code === '23505') {
          throw new Error('Username already taken');
        }
        console.error('[profiles.create] Error:', error.message, 'code:', code);
        throw new Error(error.message);
      }
      return data;
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('id', ctx.userId)
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
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();

      if (error) {
        const code = (error as any).code;
        if (code === '23505') {
          throw new Error('Username already taken');
        }
        console.error('[profiles.update] Error:', error.message, 'code:', code);
        throw new Error(error.message);
      }
      return data;
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [activeChallenges, completedChallenges, streakData] = await Promise.all([
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
      ]);

      return {
        activeChallenges: activeChallenges.data?.length || 0,
        completedChallenges: completedChallenges.data?.length || 0,
        activeStreak: streakData.data?.active_streak_count || 0,
        longestStreak: streakData.data?.longest_streak_count || 0,
      };
    }),
});

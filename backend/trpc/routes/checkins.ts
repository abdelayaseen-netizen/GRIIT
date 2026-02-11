import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

export const checkinsRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string(),
      taskId: z.string(),
      value: z.number().optional(),
      noteText: z.string().optional(),
      proofUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const dateKey = new Date().toISOString().split('T')[0];

      const { data, error } = await ctx.supabase
        .from('check_ins')
        .upsert({
          user_id: ctx.userId,
          active_challenge_id: input.activeChallengeId,
          task_id: input.taskId,
          date_key: dateKey,
          status: 'completed',
          value: input.value,
          note_text: input.noteText,
          proof_url: input.proofUrl,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const { data: allTasks } = await ctx.supabase
        .from('challenge_tasks')
        .select('id, required')
        .eq('challenge_id', (await ctx.supabase
          .from('active_challenges')
          .select('challenge_id')
          .eq('id', input.activeChallengeId)
          .single()
        ).data?.challenge_id);

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = allTasks?.filter(t => t.required) || [];
      const completedRequired = completedCheckins?.filter(c => 
        requiredTasks.some(rt => rt.id === c.task_id)
      ) || [];

      const progress = requiredTasks.length > 0 
        ? (completedRequired.length / requiredTasks.length) * 100 
        : 0;

      await ctx.supabase
        .from('active_challenges')
        .update({ progress_percent: progress })
        .eq('id', input.activeChallengeId);

      return data;
    }),

  getTodayCheckins: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const dateKey = new Date().toISOString().split('T')[0];

      const { data, error } = await ctx.supabase
        .from('check_ins')
        .select('*')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey);

      if (error) throw new Error(error.message);
      return data;
    }),

  secureDay: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const dateKey = new Date().toISOString().split('T')[0];

      const { data: activeChallenge, error: acError } = await ctx.supabase
        .from('active_challenges')
        .select('*, challenges (challenge_tasks (id, required))')
        .eq('id', input.activeChallengeId)
        .single();

      if (acError) throw new Error(acError.message);

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = (activeChallenge as any).challenges.challenge_tasks.filter((t: any) => t.required);
      const allRequiredCompleted = requiredTasks.every((rt: any) =>
        completedCheckins?.some(c => c.task_id === rt.id)
      );

      if (!allRequiredCompleted) {
        throw new Error('Not all required tasks completed');
      }

      const { data: streak } = await ctx.supabase
        .from('streaks')
        .select('*')
        .eq('user_id', ctx.userId)
        .single();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];

      let newStreakCount = 1;
      if (streak?.last_completed_date_key === yesterdayKey) {
        newStreakCount = (streak.active_streak_count || 0) + 1;
      }

      const longestStreak = Math.max(newStreakCount, streak?.longest_streak_count || 0);

      await ctx.supabase
        .from('streaks')
        .upsert({
          user_id: ctx.userId,
          active_streak_count: newStreakCount,
          longest_streak_count: longestStreak,
          last_completed_date_key: dateKey,
        });

      await ctx.supabase
        .from('active_challenges')
        .update({
          current_day: (activeChallenge.current_day || 0) + 1,
          progress_percent: 100,
        })
        .eq('id', input.activeChallengeId);

      return { success: true, newStreakCount };
    }),
});

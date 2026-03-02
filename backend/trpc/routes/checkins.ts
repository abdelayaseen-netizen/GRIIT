import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { computeNewStreakCount } from "../../lib/streak";
import { getTierForDays } from "../../lib/progression";

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

      const { data: activeRow, error: acErr } = await ctx.supabase
        .from('active_challenges')
        .select('challenge_id')
        .eq('id', input.activeChallengeId)
        .single();

      if (acErr || !activeRow?.challenge_id) {
        throw new Error('Active challenge not found');
      }

      const { data: allTasks } = await ctx.supabase
        .from('challenge_tasks')
        .select('id, required')
        .eq('challenge_id', activeRow.challenge_id);

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

      const challengeTasks = (activeChallenge as any)?.challenges?.challenge_tasks;
      if (!Array.isArray(challengeTasks)) {
        throw new Error('Challenge tasks not found');
      }

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = challengeTasks.filter((t: any) => t.required);
      const allRequiredCompleted = requiredTasks.every((rt: any) =>
        completedCheckins?.some(c => c.task_id === rt.id)
      );

      if (!allRequiredCompleted) {
        throw new Error('Not all required tasks completed');
      }

      const { data: streak } = await ctx.supabase
        .from('streaks')
        .select('last_completed_date_key, active_streak_count, longest_streak_count')
        .eq('user_id', ctx.userId)
        .single();

      const { newStreakCount, longestStreak } = computeNewStreakCount(dateKey, streak);

      await ctx.supabase
        .from('streaks')
        .upsert(
          {
            user_id: ctx.userId,
            active_streak_count: newStreakCount,
            longest_streak_count: longestStreak,
            last_completed_date_key: dateKey,
          },
          { onConflict: 'user_id' }
        );

      await ctx.supabase
        .from('active_challenges')
        .update({
          current_day: (activeChallenge.current_day || 0) + 1,
          progress_percent: 100,
        })
        .eq('id', input.activeChallengeId);

      await ctx.supabase.from('day_secures').insert({ user_id: ctx.userId, date_key: dateKey }).then(() => {}).catch(() => {});

      const { data: profileRow } = await ctx.supabase
        .from('profiles')
        .select('total_days_secured')
        .eq('user_id', ctx.userId)
        .single();
      const totalDays = (profileRow?.total_days_secured ?? 0) + 1;
      const tier = getTierForDays(totalDays);
      await ctx.supabase
        .from('profiles')
        .update({ total_days_secured: totalDays, tier, updated_at: new Date().toISOString() })
        .eq('user_id', ctx.userId)
        .then(() => {}).catch(() => {});

      return { success: true, newStreakCount };
    }),
});

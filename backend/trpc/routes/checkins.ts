import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { assertActiveChallengeOwnership } from "../guards";
import { requireNoError } from "../errors";
import { computeNewStreakCount } from "../../lib/streak";
import { getTierForDays } from "../../lib/progression";
import { shouldEarnLastStand, newAvailableAfterEarn } from "../../lib/last-stand";
import { getTodayDateKey } from "../../lib/date-utils";
import type { StreakRow, DaySecureRow, ActiveChallengeWithTasks, PgError } from "../../types/db";
import {
  type ChallengeTaskRowRaw,
  getTaskVerification,
  isTaskRequired,
} from "../../lib/challenge-tasks";
import { isChallengeExpired } from "../../lib/challenge-timer";

export const checkinsRouter = createTRPCRouter({
  complete: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string().uuid(),
      taskId: z.string().uuid(),
      value: z.number().optional(),
      noteText: z.string().max(2000).optional(),
      proofUrl: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const dateKey = getTodayDateKey();

      const { data: chRow } = await ctx.supabase
        .from("challenges")
        .select("duration_type, ends_at, live_date")
        .eq("id", challenge_id)
        .single();
      const ch = chRow as { duration_type?: string; ends_at?: string | null; live_date?: string | null } | null;
      if (ch?.duration_type === "24h") {
        const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
        if (isChallengeExpired(endsAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer complete tasks." });
        }
      }

      const { data: taskRow } = await ctx.supabase
        .from('challenge_tasks')
        .select('id, task_type, config')
        .eq('id', input.taskId)
        .single();

      const taskRaw = taskRow as ChallengeTaskRowRaw | null;
      const { needsProof, minWords, durationMinutes } = getTaskVerification(taskRaw);
      const taskType = taskRaw?.task_type ?? 'manual';

      if (needsProof && !(input.proofUrl && input.proofUrl.trim())) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This task requires photo proof. Please take or upload a photo before completing.',
        });
      }

      const isJournal = taskType === 'journal' || taskType === 'manual';
      if (isJournal && minWords > 0) {
        const text = (input.noteText ?? '').trim();
        const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
        if (wordCount < minWords) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `This task requires at least ${minWords} words. You wrote ${wordCount}.`,
          });
        }
      }

      const isTimer = taskType === 'timer';
      if (isTimer && durationMinutes > 0) {
        const completedMinutes = input.value ?? 0;
        if (completedMinutes < durationMinutes) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `This task requires at least ${durationMinutes} minutes. You logged ${completedMinutes}.`,
          });
        }
      }

      const proofUrl = input.proofUrl?.trim() || null;
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
          proof_url: proofUrl,
          completion_image_url: proofUrl,
        })
        .select()
        .single();

      requireNoError(error, "Failed to save check-in.");

      const { data: allTasks } = await ctx.supabase
        .from('challenge_tasks')
        .select('id, task_type, config')
        .eq('challenge_id', challenge_id);

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = (allTasks ?? []).filter((t) => isTaskRequired(t as ChallengeTaskRowRaw));
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
      activeChallengeId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);
      const dateKey = getTodayDateKey();

      const { data, error } = await ctx.supabase
        .from('check_ins')
        .select('id, task_id, date_key, status, value, note_text, proof_url, completion_image_url, proof_source, proof_payload_json, external_activity_id, verification_status, created_at')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey);

      requireNoError(error, "Failed to load check-ins.");
      return data ?? [];
    }),

  /** All today check-ins for the user across all their active challenges (for home). */
  getTodayCheckinsForUser: protectedProcedure
    .query(async ({ ctx }) => {
      const dateKey = getTodayDateKey();
      const { data: acList, error: acErr } = await ctx.supabase
        .from('active_challenges')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('status', 'active');
      requireNoError(acErr, "Failed to load active challenges.");
      const acIds = (acList ?? []).map((r: { id: string }) => r.id);
      if (acIds.length === 0) return [];
      const { data, error } = await ctx.supabase
        .from('check_ins')
        .select('id, active_challenge_id, task_id, date_key, status, value, note_text, proof_url, completion_image_url, proof_source, external_activity_id, verification_status, created_at')
        .in('active_challenge_id', acIds)
        .eq('date_key', dateKey);
      requireNoError(error, "Failed to load today check-ins.");
      return data ?? [];
    }),

  secureDay: protectedProcedure
    .input(z.object({
      activeChallengeId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { challenge_id } = await assertActiveChallengeOwnership(ctx.supabase, input.activeChallengeId, ctx.userId);

      const { data: chRow } = await ctx.supabase
        .from("challenges")
        .select("duration_type, ends_at, live_date")
        .eq("id", challenge_id)
        .single();
      const ch = chRow as { duration_type?: string; ends_at?: string | null; live_date?: string | null } | null;
      if (ch?.duration_type === "24h") {
        const endsAt = ch.ends_at ?? (ch.live_date ? new Date(new Date(ch.live_date).getTime() + 24 * 60 * 60 * 1000).toISOString() : null);
        if (isChallengeExpired(endsAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This 24-hour challenge has ended. You can no longer secure the day." });
        }
      }

      const { data: rpcRows, error: rpcError } = await ctx.supabase.rpc("secure_day", {
        p_active_challenge_id: input.activeChallengeId,
      });

      if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
        const row = rpcRows[0] as { new_streak_count: number; last_stand_earned: boolean };
        const { data: acRow } = await ctx.supabase
          .from("active_challenges")
          .select("challenge_id")
          .eq("id", input.activeChallengeId)
          .single();
        const challengeId = (acRow as { challenge_id?: string } | null)?.challenge_id;
        if (challengeId) {
          const { data: ch } = await ctx.supabase.from("challenges").select("participation_type, run_status").eq("id", challengeId).single();
          if ((ch as { participation_type?: string })?.participation_type === "team" && (ch as { run_status?: string })?.run_status === "active") {
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: yesterday });
            await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: today });
          }
        }
        return {
          success: true,
          newStreakCount: row.new_streak_count,
          lastStandEarned: row.last_stand_earned,
        };
      }

      const code = (rpcError as { code?: string })?.code;
      const msg = (rpcError as { message?: string })?.message ?? "";
      if (msg.includes("NOT_ALL_REQUIRED")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not all required tasks completed." });
      }
      if (rpcError && code !== "42883") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to secure day." });
      }

      const dateKey = getTodayDateKey();

      const { data: alreadySecured } = await ctx.supabase
        .from("day_secures")
        .select("date_key")
        .eq("user_id", ctx.userId)
        .eq("date_key", dateKey)
        .limit(1)
        .maybeSingle();
      const securedRow = alreadySecured as DaySecureRow | null;
      if (securedRow) {
        const { data: streak } = await ctx.supabase
          .from("streaks")
          .select("active_streak_count")
          .eq("user_id", ctx.userId)
          .single();
        const s = streak as { active_streak_count?: number } | null;
        return { success: true, newStreakCount: s?.active_streak_count ?? 0, lastStandEarned: false };
      }

      const { data: activeChallenge, error: acError } = await ctx.supabase
        .from("active_challenges")
        .select("*, challenges (challenge_tasks (id, task_type, config))")
        .eq("id", input.activeChallengeId)
        .single();

      requireNoError(acError, "Active challenge not found.");

      const ac = activeChallenge as ActiveChallengeWithTasks | null;
      const challengeTasksRaw = ac?.challenges?.challenge_tasks as ChallengeTaskRowRaw[] | null | undefined;
      if (!Array.isArray(challengeTasksRaw)) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Challenge tasks not found." });
      }

      const { data: completedCheckins } = await ctx.supabase
        .from('check_ins')
        .select('task_id')
        .eq('active_challenge_id', input.activeChallengeId)
        .eq('date_key', dateKey)
        .eq('status', 'completed');

      const requiredTasks = challengeTasksRaw.filter((t) => isTaskRequired(t));
      const allRequiredCompleted = requiredTasks.every((rt: { id: string }) =>
        completedCheckins?.some((c: { task_id: string }) => c.task_id === rt.id)
      );

      if (!allRequiredCompleted) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not all required tasks completed." });
      }

      const { data: streak } = await ctx.supabase
        .from("streaks")
        .select("last_completed_date_key, active_streak_count, longest_streak_count, last_stands_available, last_stands_used_total")
        .eq("user_id", ctx.userId)
        .single();

      const { newStreakCount, longestStreak } = computeNewStreakCount(dateKey, streak as StreakRow | null);

      const streakPayload: Record<string, unknown> = {
        user_id: ctx.userId,
        active_streak_count: newStreakCount,
        longest_streak_count: longestStreak,
        last_completed_date_key: dateKey,
      };

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startKey = sevenDaysAgo.toISOString().split('T')[0];
      const { data: securesLast7 } = await ctx.supabase
        .from('day_secures')
        .select('date_key')
        .eq('user_id', ctx.userId)
        .gte('date_key', startKey)
        .lte('date_key', dateKey);
      const securedDaysLast7 = new Set((securesLast7 ?? []).map((r: DaySecureRow) => r.date_key));
      if (dateKey) securedDaysLast7.add(dateKey);
      const countLast7 = securedDaysLast7.size;

      const streakRow = streak as StreakRow | null;
      const currentLastStands = Math.min(2, Math.max(0, streakRow?.last_stands_available ?? 0));
      let lastStandEarned = false;
      if (shouldEarnLastStand(countLast7, currentLastStands)) {
        (streakPayload as any).last_stands_available = newAvailableAfterEarn(currentLastStands);
        (streakPayload as any).last_stand_earned_at = now.toISOString();
        lastStandEarned = true;
      }

      await ctx.supabase
        .from('streaks')
        .upsert(streakPayload, { onConflict: 'user_id' });

      await ctx.supabase
        .from("active_challenges")
        .update({
          current_day: (ac?.current_day ?? 0) + 1,
          progress_percent: 100,
        })
        .eq("id", input.activeChallengeId);

      const { error: daySecErr } = await ctx.supabase
        .from('day_secures')
        .insert({ user_id: ctx.userId, date_key: dateKey });
      if (daySecErr && (daySecErr as PgError).code !== "23505") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record day secure." });
      }

      const { data: profileRow } = await ctx.supabase
        .from('profiles')
        .select('total_days_secured')
        .eq('user_id', ctx.userId)
        .single();
      const totalDays = (profileRow?.total_days_secured ?? 0) + 1;
      const tier = getTierForDays(totalDays);
      const { error: profileErr } = await ctx.supabase
        .from('profiles')
        .update({ total_days_secured: totalDays, tier, updated_at: new Date().toISOString() })
        .eq('user_id', ctx.userId);
      requireNoError(profileErr, "Failed to update profile.");

      const challengeId = (ac as { challenge_id?: string })?.challenge_id;
      if (challengeId) {
        const { data: ch } = await ctx.supabase.from("challenges").select("participation_type, run_status").eq("id", challengeId).single();
        if ((ch as { participation_type?: string })?.participation_type === "team" && (ch as { run_status?: string })?.run_status === "active") {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: yesterday });
          await ctx.supabase.rpc("evaluate_team_day", { p_challenge_id: challengeId, p_date_key: dateKey });
        }
      }

      return { success: true, newStreakCount, lastStandEarned };
    }),
});

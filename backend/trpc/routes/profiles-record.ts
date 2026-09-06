/**
 * profiles.getRecord — one payload for the profile v2 record surface.
 *
 * Derives in-process from:
 *   active_challenges.status / start_at / end_at
 *   day_secures.date_key
 *   profiles.timezone
 *   streaks.active_streak_count / longest_streak_count / last_completed_date_key
 *
 * No new Postgres RPC. If this exceeds 300ms on ~6 months of day_secures, stop
 * and propose one — do not add it here first.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import {
  dateKeyFromIsoInTimeZone,
  getTodayDateKey,
} from "../../lib/date-utils";
import { logger } from "../../lib/logger";
import { buildProfileRecord, type ChallengeRangeInput } from "@/lib/profile-v2-record";
import { PROFILE_V2_BADGES } from "@/lib/profile-v2-badges";

type ActiveRow = {
  id: string;
  challenge_id: string;
  status: string;
  start_at: string;
  end_at: string;
};

type ChallengeRow = {
  id: string;
  title?: string | null;
  duration_days?: number | null;
};

type TaskCountRow = { challenge_id: string };

export const profilesRecordProcedures = {
  getRecord: protectedProcedure
    .input(z.object({ userId: z.string().uuid().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const started = Date.now();
      const userId = input?.userId ?? ctx.userId;
      if (userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Visitor record is Phase 6.",
        });
      }

      const [profileRes, streakRes, activeRes, completedRes, securesRes, unlocksRes] =
        await Promise.all([
          ctx.supabase
            .from("profiles")
            .select("timezone, reminder_timezone")
            .eq("user_id", userId)
            .maybeSingle(),
          ctx.supabase
            .from("streaks")
            .select("active_streak_count, longest_streak_count, last_completed_date_key")
            .eq("user_id", userId)
            .maybeSingle(),
          ctx.supabase
            .from("active_challenges")
            .select("id, challenge_id, status, start_at, end_at")
            .eq("user_id", userId)
            .eq("status", "active")
            .limit(50),
          ctx.supabase
            .from("active_challenges")
            .select("id, challenge_id, status, start_at, end_at")
            .eq("user_id", userId)
            .eq("status", "completed")
            .limit(50),
          ctx.supabase
            .from("day_secures")
            .select("date_key")
            .eq("user_id", userId)
            .order("date_key", { ascending: true })
            .limit(400),
          ctx.supabase
            .from("user_achievements")
            .select("achievement_key, unlocked_at")
            .eq("user_id", userId)
            .limit(200),
        ]);

      if (profileRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: profileRes.error.message });
      }
      if (streakRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: streakRes.error.message });
      }
      if (activeRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: activeRes.error.message });
      }
      if (completedRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: completedRes.error.message });
      }
      if (securesRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: securesRes.error.message });
      }

      const tzRaw = profileRes.data as
        | { timezone?: string | null; reminder_timezone?: string | null }
        | null;
      const timezone = tzRaw?.timezone?.trim() || tzRaw?.reminder_timezone?.trim() || "UTC";
      const todayKey = getTodayDateKey(timezone);

      const acRows = [
        ...((activeRes.data ?? []) as ActiveRow[]),
        ...((completedRes.data ?? []) as ActiveRow[]),
      ];
      const challengeIds = [...new Set(acRows.map((r) => r.challenge_id))];

      let challenges: ChallengeRow[] = [];
      let taskRows: TaskCountRow[] = [];
      if (challengeIds.length > 0) {
        const [chRes, taskRes] = await Promise.all([
          ctx.supabase
            .from("challenges")
            .select("id, title, duration_days")
            .in("id", challengeIds)
            .limit(50),
          ctx.supabase
            .from("challenge_tasks")
            .select("challenge_id")
            .in("challenge_id", challengeIds)
            .limit(400),
        ]);
        if (chRes.error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: chRes.error.message });
        }
        challenges = (chRes.data ?? []) as ChallengeRow[];
        taskRows = (taskRes.data ?? []) as TaskCountRow[];
      }

      const titleById = new Map(challenges.map((c) => [c.id, c.title ?? "Challenge"]));
      const durationById = new Map(challenges.map((c) => [c.id, c.duration_days ?? 30]));
      const tasksById = new Map<string, number>();
      for (const t of taskRows) {
        tasksById.set(t.challenge_id, (tasksById.get(t.challenge_id) ?? 0) + 1);
      }

      const ranges: ChallengeRangeInput[] = acRows.map((row) => ({
        id: row.id,
        challengeId: row.challenge_id,
        name: titleById.get(row.challenge_id) ?? "Challenge",
        status: row.status,
        startDateKey: dateKeyFromIsoInTimeZone(row.start_at, timezone),
        endDateKey: dateKeyFromIsoInTimeZone(row.end_at, timezone),
        durationDays: durationById.get(row.challenge_id) ?? 30,
        tasksPerDay: tasksById.get(row.challenge_id) ?? 1,
      }));

      const streakRow = streakRes.data as {
        active_streak_count?: number | null;
        longest_streak_count?: number | null;
        last_completed_date_key?: string | null;
      } | null;

      const unlocks: Record<string, string> = {};
      const mappedKeys = new Set(PROFILE_V2_BADGES.flatMap((b) => b.legacyKeys));
      for (const row of (unlocksRes.data ?? []) as { achievement_key: string; unlocked_at: string }[]) {
        if (!mappedKeys.has(row.achievement_key)) continue;
        const prev = unlocks[row.achievement_key];
        if (!prev || row.unlocked_at < prev) unlocks[row.achievement_key] = row.unlocked_at;
      }

      const record = buildProfileRecord({
        todayKey,
        currentStreak: streakRow == null ? 0 : (streakRow.active_streak_count ?? 0),
        bestStreak: streakRow?.longest_streak_count ?? 0,
        lastCompletedDateKey: streakRow?.last_completed_date_key ?? null,
        ranges,
        securedDateKeys: ((securesRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key),
        badgeUnlocks: unlocks,
      });

      const elapsedMs = Date.now() - started;
      if (elapsedMs > 300) {
        logger.warn(
          { userId, elapsedMs, secureCount: (securesRes.data ?? []).length, rangeCount: ranges.length },
          "[profiles.getRecord] exceeded 300ms — propose a Postgres RPC before adding one"
        );
      }

      return {
        timezone,
        todayKey,
        elapsedMs,
        ...record,
      };
    }),
};

import { useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  cancelLegacyDailyReminders,
  scheduleLapsedUserReminders,
  scheduleWeeklySummary,
  cancelWeeklySummary,
  scheduleChallengeCountdowns,
} from "@/lib/notifications";
import { addLocalDays, calendarDateKey, lapsedOffsetsAvoidingG2a } from "@/lib/g2a-notifications";
import { scheduleG2aForUser, type G2aEnrollmentRow } from "@/lib/g2a-refresh";
import { fetchReminderSettings } from "@/lib/home-bootstrap-refresh";
import { getTodayDateKey, countSecuredLast7Days } from "@/lib/date-utils";
import type { EveningRemaining } from "@/lib/evening-secure";
import { deriveUserRank } from "@/lib/derive-user-rank";
import type { StatsFromApi, ActiveChallengeFromApi } from "@/types";

export interface UseNotificationSchedulerOptions {
  user: { id: string } | null;
  stats: StatsFromApi | null;
  activeChallenge: ActiveChallengeFromApi | null;
  /** IANA timezone from profiles.timezone — aligns with server date_key. */
  timezone?: string | null;
  evening?: EveningRemaining;
  /**
   * Build 90 04.7: the bootstrap payload's lists. The planner used to fetch
   * `listMyActive` (twice), `getSecuredDateKeys` and `getTodayCheckinsForUser` on every run,
   * right after `home.bootstrap` had returned the same rows. Undefined (section failed, or
   * nothing loaded yet) falls back to the planner's own requests.
   */
  enrollments?: G2aEnrollmentRow[];
  securedDateKeys?: string[];
  todayCheckins?: { task_id?: string; status?: string }[];
}

/**
 * The values a plan depends on, as one string. The effect used to key on
 * `activeChallenge.challenges` (a fresh object after every bootstrap refetch), so a finish
 * re-ran the planner three or four times with the same inputs.
 */
export function schedulerSignature(input: {
  userId: string | null;
  stats: StatsFromApi | null;
  timezone?: string | null;
  activeChallengeId?: string | null;
  challengeTitle?: string | null;
  evening?: EveningRemaining;
  enrollments?: G2aEnrollmentRow[];
  securedDateKeys?: string[];
  todayCheckins?: { task_id?: string; status?: string }[];
}): string {
  const enrollmentPart = (input.enrollments ?? []).map((ac) => {
    const tasks = (ac.challenges?.challenge_tasks ?? []) as { id?: string }[];
    return [ac.id ?? "", ac.start_at ?? ac.started_at ?? ac.created_at ?? "", ac.challenges?.duration_days ?? "", tasks.map((t) => t.id ?? "").join("+")].join("~");
  });
  const completedPart = (input.todayCheckins ?? [])
    .filter((c) => c.status === "completed" && typeof c.task_id === "string")
    .map((c) => c.task_id)
    .sort();
  return JSON.stringify([
    input.userId,
    input.stats?.lastCompletedDateKey ?? null,
    input.stats?.lastStandsAvailable ?? null,
    input.stats?.totalDaysSecured ?? null,
    input.stats?.activeStreak ?? null,
    input.stats?.tier ?? null,
    input.timezone ?? null,
    input.activeChallengeId ?? null,
    input.challengeTitle ?? null,
    input.evening?.remaining ?? null,
    input.evening?.total ?? null,
    input.evening?.challenge ?? null,
    input.evening?.cameraRemaining ?? null,
    enrollmentPart,
    [...(input.securedDateKeys ?? [])].sort(),
    completedPart,
  ]);
}

/**
 * G2a is the only per-day reminder pair. Weekly summary and challenge
 * countdowns stay. Lapsed fires on day 3+ after last open, never on a G2a day.
 */
export function useNotificationScheduler({
  user,
  stats,
  activeChallenge,
  timezone,
  evening,
  enrollments,
  securedDateKeys,
  todayCheckins,
}: UseNotificationSchedulerOptions): void {
  const queryClient = useQueryClient();
  const challengeTitle = (activeChallenge as { challenges?: { title?: string } } | null)?.challenges?.title ?? null;
  const activeChallengeId = (activeChallenge as { id?: string } | null)?.id ?? null;
  const signature = useMemo(
    () =>
      schedulerSignature({
        userId: user?.id ?? null,
        stats,
        timezone,
        activeChallengeId,
        challengeTitle,
        evening,
        enrollments,
        securedDateKeys,
        todayCheckins,
      }),
    [user?.id, stats, timezone, activeChallengeId, challengeTitle, evening, enrollments, securedDateKeys, todayCheckins],
  );
  const latest = useRef({ stats, timezone, activeChallengeId, challengeTitle, evening, enrollments, securedDateKeys, todayCheckins });
  latest.current = { stats, timezone, activeChallengeId, challengeTitle, evening, enrollments, securedDateKeys, todayCheckins };

  useEffect(() => {
    if (Platform.OS === "web" || !user || !stats) return;
    const input = latest.current;
    const currentStats = input.stats;
    if (!currentStats) return;
    const todayKey = getTodayDateKey(input.timezone);
    const lastKey = currentStats.lastCompletedDateKey ?? null;
    const streakCount = currentStats.activeStreak ?? 0;

    let cancelled = false;
    const runExtended = async () => {
      await cancelLegacyDailyReminders();
      if (cancelled) return;

      const settings = await fetchReminderSettings(queryClient);
      if (cancelled) return;

      // Bootstrap lists when present; the old per-run requests only when a section is missing.
      const activeRows = Array.isArray(input.enrollments)
        ? input.enrollments
        : ((await trpcQuery(TRPC.challenges.listMyActive).catch(() => [])) as G2aEnrollmentRow[]);
      if (cancelled) return;
      const securedKeys = Array.isArray(input.securedDateKeys)
        ? input.securedDateKeys
        : ((await trpcQuery(TRPC.profiles.getSecuredDateKeys).catch(() => [])) as string[]);
      if (cancelled) return;

      const daysSecuredThisWeek = countSecuredLast7Days(Array.isArray(securedKeys) ? securedKeys : [], input.timezone);
      const basePoints = (currentStats.totalDaysSecured ?? 0) * 5;

      if (settings?.weekly_summary_enabled !== false) {
        scheduleWeeklySummary({
          daysSecuredThisWeek,
          totalDaysThisWeek: 7,
          points: basePoints,
          rank: deriveUserRank(currentStats),
          streakCount,
        }).catch(() => {});
      } else {
        await cancelWeeklySummary();
      }

      const countdownData = (Array.isArray(activeRows) ? activeRows : [])
        .filter((ac) => ac.id && ac.challenges?.duration_days != null)
        .map((ac) => ({
          id: ac.id ?? "",
          name: ac.challenges?.title ?? "Challenge",
          startAt: ac.start_at ?? ac.started_at ?? ac.created_at ?? null,
          timeZone: input.timezone ?? "UTC",
          todayKey,
          totalDays: ac.challenges?.duration_days ?? 1,
        }))
        .filter((d) => d.id);
      scheduleChallengeCountdowns(countdownData).catch(() => {});

      const now = new Date();
      const securedToday = lastKey === todayKey;
      if (cancelled) return;
      await scheduleG2aForUser({
        timezone: input.timezone,
        lastCompletedDateKey: lastKey,
        streakCount,
        activeChallengeId: input.activeChallengeId,
        forceSecuredToday: securedToday,
        remainingToday: input.evening?.remaining,
        isCancelled: () => cancelled,
        ...(Array.isArray(activeRows) ? { enrollments: activeRows } : {}),
        ...(Array.isArray(input.todayCheckins) ? { todayCheckins: input.todayCheckins } : {}),
      });

      const g2aDays = [
        ...(securedToday ? [] : [calendarDateKey(now)]),
        calendarDateKey(addLocalDays(now, 1)),
      ];
      const lapsedOffsets = lapsedOffsetsAvoidingG2a(now, g2aDays);
      await scheduleLapsedUserReminders({
        streakCount,
        challengeName: input.challengeTitle ?? undefined,
        offsets: lapsedOffsets,
      });
    };
    void runExtended();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when a planned value changes (the signature), not on object identity
  }, [user, stats ? signature : null, queryClient]);
}

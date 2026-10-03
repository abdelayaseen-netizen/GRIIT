import { useEffect } from "react";
import { Platform } from "react-native";
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
import { scheduleG2aForUser } from "@/lib/g2a-refresh";
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
}

/**
 * G2a is the only per-day reminder pair. Weekly summary and challenge
 * countdowns stay. Lapsed fires on day 3+ after last open, never on a G2a day.
 */
export function useNotificationScheduler({ user, stats, activeChallenge, timezone, evening }: UseNotificationSchedulerOptions): void {
  useEffect(() => {
    if (Platform.OS === "web" || !user || !stats) return;
    const todayKey = getTodayDateKey(timezone);
    const lastKey = stats.lastCompletedDateKey ?? null;
    const streakCount = stats.activeStreak ?? 0;
    const challengeName = (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;

    let cancelled = false;
    const runExtended = async () => {
      await cancelLegacyDailyReminders();
      if (cancelled) return;

      const settings = (await trpcQuery(TRPC.notifications.getReminderSettings).catch(() => null)) as {
        morning_kickoff_enabled?: boolean;
        weekly_summary_enabled?: boolean;
      } | null;
      if (cancelled) return;

      const ch = activeChallenge?.challenges as Record<string, unknown> | null | undefined;
      const challengeTitle = typeof ch?.title === "string" ? ch.title : undefined;

      const myActive = (await trpcQuery(TRPC.challenges.listMyActive).catch(() => [])) as {
        id?: string;
        start_at?: string | null;
        started_at?: string | null;
        created_at?: string | null;
        challenges?: {
          duration_days?: number;
          title?: string;
          challenge_tasks?: Record<string, unknown>[];
        };
      }[];
      if (cancelled) return;

      const activeRows = Array.isArray(myActive) ? myActive : [];

      const securedKeys = (await trpcQuery(TRPC.profiles.getSecuredDateKeys).catch(() => [])) as string[];
      if (cancelled) return;

      const daysSecuredThisWeek = countSecuredLast7Days(Array.isArray(securedKeys) ? securedKeys : [], timezone);
      const basePoints = (stats.totalDaysSecured ?? 0) * 5;

      if (settings?.weekly_summary_enabled !== false) {
        scheduleWeeklySummary({
          daysSecuredThisWeek,
          totalDaysThisWeek: 7,
          points: basePoints,
          rank: deriveUserRank(stats),
          streakCount,
        }).catch(() => {});
      } else {
        await cancelWeeklySummary();
      }

      const countdownData = activeRows
        .filter((ac) => ac.id && ac.challenges?.duration_days != null)
        .map((ac) => ({
          id: ac.id ?? "",
          name: ac.challenges?.title ?? "Challenge",
          startAt: ac.start_at ?? ac.started_at ?? ac.created_at ?? null,
          timeZone: timezone ?? "UTC",
          todayKey,
          totalDays: ac.challenges?.duration_days ?? 1,
        }))
        .filter((d) => d.id);
      scheduleChallengeCountdowns(countdownData).catch(() => {});

      const now = new Date();
      const securedToday = lastKey === todayKey;
      if (cancelled) return;
      await scheduleG2aForUser({
        timezone,
        lastCompletedDateKey: lastKey,
        streakCount,
        activeChallengeId: (activeChallenge as { id?: string } | null)?.id ?? null,
        forceSecuredToday: securedToday,
        remainingToday: evening?.remaining,
        isCancelled: () => cancelled,
      });

      const g2aDays = [
        ...(securedToday ? [] : [calendarDateKey(now)]),
        calendarDateKey(addLocalDays(now, 1)),
      ];
      const lapsedOffsets = lapsedOffsetsAvoidingG2a(now, g2aDays);
      await scheduleLapsedUserReminders({
        streakCount,
        challengeName: challengeName ?? challengeTitle,
        offsets: lapsedOffsets,
      });
    };
    void runExtended();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps derived from stats; listing stats would re-run on any stats change
  }, [
    user,
    stats?.lastCompletedDateKey,
    stats?.lastStandsAvailable,
    stats?.totalDaysSecured,
    stats?.activeStreak,
    stats?.tier,
    timezone,
    activeChallenge?.id,
    activeChallenge?.challenges,
    evening?.remaining,
    evening?.total,
    evening?.challenge,
    evening?.cameraRemaining,
  ]);
}

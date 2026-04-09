import { useEffect } from "react";
import { Platform } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  scheduleNextSecureReminder,
  cancelSecureReminders,
  scheduleLapsedUserReminders,
  scheduleMorningMotivation,
  cancelMorningMotivation,
  scheduleWeeklySummary,
  cancelWeeklySummary,
  scheduleChallengeCountdowns,
  scheduleTaskWindowAlerts,
} from "@/lib/notifications";
import { getTodayDateKey, countSecuredLast7Days } from "@/lib/date-utils";
import { deriveUserRank } from "@/lib/derive-user-rank";
import type { StatsFromApi, ActiveChallengeFromApi } from "@/types";

export interface UseNotificationSchedulerOptions {
  user: { id: string } | null;
  stats: StatsFromApi | null;
  activeChallenge: ActiveChallengeFromApi | null;
}

/**
 * Schedules local notifications (secure reminder, lapsed, morning, weekly, countdowns, task windows).
 * Fire-and-forget — no return value.
 */
export function useNotificationScheduler({ user, stats, activeChallenge }: UseNotificationSchedulerOptions): void {
  useEffect(() => {
    if (Platform.OS === "web" || !user || !stats) return;
    const todayKey = getTodayDateKey();
    const lastKey = stats.lastCompletedDateKey ?? null;
    const preferred = stats.preferredSecureTime ?? "20:00";
    const lastStands = stats.lastStandsAvailable ?? 0;
    const streakCount = stats.activeStreak ?? 0;
    if (lastKey === todayKey) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduleNextSecureReminder(preferred, tomorrow, lastStands, streakCount).catch(() => {
        // error swallowed — handle in UI
      });
    } else {
      scheduleNextSecureReminder(preferred, undefined, lastStands, streakCount).catch(() => {
        // error swallowed — handle in UI
      });
    }
    const challengeName = (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;
    scheduleLapsedUserReminders({ streakCount, challengeName }).catch(() => {
      // error swallowed — handle in UI
    });

    let cancelled = false;
    const runExtended = async () => {
      const settings = (await trpcQuery(TRPC.notifications.getReminderSettings).catch(() => null)) as {
        morning_kickoff_enabled?: boolean;
        weekly_summary_enabled?: boolean;
      } | null;
      if (cancelled) return;

      const ch = activeChallenge?.challenges as Record<string, unknown> | null | undefined;
      const taskRows = (ch?.challenge_tasks as unknown[] | undefined) ?? [];
      const taskCount = taskRows.length;
      const currentDay = (activeChallenge as { current_day?: number })?.current_day ?? 1;
      const challengeTitle = typeof ch?.title === "string" ? ch.title : undefined;

      if (settings?.morning_kickoff_enabled !== false) {
        scheduleMorningMotivation({
          morningTime: "07:00",
          streakCount,
          taskCount,
          currentDay,
          challengeName: challengeTitle,
        }).catch(() => {});
      } else {
        await cancelMorningMotivation();
      }

      const securedKeys = (await trpcQuery(TRPC.profiles.getSecuredDateKeys).catch(() => [])) as string[];
      if (cancelled) return;

      const daysSecuredThisWeek = countSecuredLast7Days(Array.isArray(securedKeys) ? securedKeys : []);
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

      const myActive = (await trpcQuery(TRPC.challenges.listMyActive).catch(() => [])) as {
        id?: string;
        current_day?: number;
        challenges?: {
          duration_days?: number;
          title?: string;
          challenge_tasks?: Record<string, unknown>[];
        };
      }[];
      if (cancelled) return;

      const countdownData = (Array.isArray(myActive) ? myActive : [])
        .filter((ac) => ac.challenges?.duration_days != null && ac.current_day != null)
        .map((ac) => ({
          id: ac.id ?? "",
          name: ac.challenges?.title ?? "Challenge",
          currentDay: ac.current_day ?? 1,
          totalDays: ac.challenges?.duration_days ?? 1,
        }))
        .filter((d) => d.id);
      scheduleChallengeCountdowns(countdownData).catch(() => {});

      const winTasks: {
        id: string;
        taskType?: string;
        anchorTimeLocal?: string | null;
        windowStartOffsetMin?: number | null;
        challengeName?: string;
      }[] = [];
      for (const ac of Array.isArray(myActive) ? myActive : []) {
        const chInner = ac.challenges;
        const title = chInner?.title ?? "Challenge";
        const tasks = chInner?.challenge_tasks ?? [];
        for (const t of tasks) {
          const cfg = (t as { config?: Record<string, unknown> }).config;
          if (cfg && cfg.timeEnforcementEnabled === false) continue;

          const anchorFromCfg = typeof cfg?.anchorTimeLocal === "string" ? cfg.anchorTimeLocal : null;
          const anchor =
            anchorFromCfg ??
            (typeof (t as { anchorTimeLocal?: string }).anchorTimeLocal === "string"
              ? (t as { anchorTimeLocal: string }).anchorTimeLocal
              : null) ??
            (typeof (t as { anchor_time_local?: string }).anchor_time_local === "string"
              ? (t as { anchor_time_local: string }).anchor_time_local
              : null);
          if (!anchor?.trim()) continue;

          const w =
            typeof (t as { windowStartOffsetMin?: number }).windowStartOffsetMin === "number"
              ? (t as { windowStartOffsetMin: number }).windowStartOffsetMin
              : typeof (t as { window_start_offset_min?: number }).window_start_offset_min === "number"
                ? (t as { window_start_offset_min: number }).window_start_offset_min
                : typeof cfg?.windowStartOffsetMin === "number"
                  ? (cfg.windowStartOffsetMin as number)
                  : 0;

          const rawType = (t as { type?: string }).type;
          winTasks.push({
            id: `${ac.id ?? "ac"}-${String((t as { id?: string }).id)}`,
            taskType: typeof rawType === "string" ? rawType : undefined,
            anchorTimeLocal: anchor,
            windowStartOffsetMin: w,
            challengeName: title,
          });
        }
      }
      scheduleTaskWindowAlerts(winTasks).catch(() => {});
    };
    void runExtended();

    return () => {
      cancelled = true;
      cancelSecureReminders();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps derived from stats; listing stats would re-run on any stats change
  }, [
    user,
    stats?.lastCompletedDateKey,
    stats?.preferredSecureTime,
    stats?.lastStandsAvailable,
    stats?.totalDaysSecured,
    stats?.activeStreak,
    stats?.tier,
    activeChallenge?.id,
    activeChallenge?.challenges,
  ]);
}

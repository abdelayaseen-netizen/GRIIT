import { useEffect } from "react";
import { Platform } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  scheduleNextSecureReminder,
  SECURE_REMINDER_TIME,
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
import type { EveningRemaining } from "@/lib/evening-secure";
import { tasksDueTodayAcrossEnrollments } from "@/lib/notification-due-count";
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
 * Schedules local notifications (secure reminder, lapsed, morning, weekly, countdowns, task windows).
 * Fire-and-forget — no return value.
 */
export function useNotificationScheduler({ user, stats, activeChallenge, timezone, evening }: UseNotificationSchedulerOptions): void {
  useEffect(() => {
    if (Platform.OS === "web" || !user || !stats) return;
    const todayKey = getTodayDateKey(timezone);
    const lastKey = stats.lastCompletedDateKey ?? null;
    const preferred = SECURE_REMINDER_TIME;
    const lastStands = stats.lastStandsAvailable ?? 0;
    const streakCount = stats.activeStreak ?? 0;
    if (lastKey === todayKey) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduleNextSecureReminder(preferred, tomorrow, lastStands, streakCount, evening).catch(() => {
        // error swallowed — handle in UI
      });
    } else {
      scheduleNextSecureReminder(preferred, undefined, lastStands, streakCount, evening).catch(() => {
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
      const todayCheckins = (await trpcQuery(TRPC.checkins.getTodayCheckinsForUser).catch(() => [])) as {
        task_id?: string;
        status?: string;
      }[];
      if (cancelled) return;

      const activeRows = Array.isArray(myActive) ? myActive : [];
      const dueToday = tasksDueTodayAcrossEnrollments({
        enrollments: activeRows.map((ac) => ({
          tasks: (ac.challenges?.challenge_tasks ?? []).map((t) => {
            const row = t as { id?: string; config?: { required?: boolean } };
            return { id: row.id, required: row.config?.required ?? true };
          }),
        })),
        completedTaskIds: (Array.isArray(todayCheckins) ? todayCheckins : [])
          .filter((c) => c.status === "completed" && typeof c.task_id === "string")
          .map((c) => c.task_id as string),
      });

      const eveningAll: EveningRemaining = {
        remaining: dueToday.remaining,
        total: dueToday.due,
        challenge: evening?.challenge ?? challengeTitle ?? "GRIIT",
        cameraRemaining: evening?.cameraRemaining,
      };
      if (lastKey === todayKey) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        scheduleNextSecureReminder(preferred, tomorrow, lastStands, streakCount, eveningAll).catch(() => {});
      } else {
        scheduleNextSecureReminder(preferred, undefined, lastStands, streakCount, eveningAll).catch(() => {});
      }

      if (settings?.morning_kickoff_enabled !== false) {
        const ac = activeChallenge as {
          id?: string;
          start_at?: string | null;
          started_at?: string | null;
          created_at?: string | null;
        } | null;
        const matched = activeRows.find((r) => r.id && r.id === ac?.id) ?? activeRows[0];
        const startAt =
          ac?.start_at ??
          ac?.started_at ??
          ac?.created_at ??
          matched?.start_at ??
          matched?.started_at ??
          matched?.created_at ??
          null;
        const durationDays =
          typeof ch?.duration_days === "number"
            ? ch.duration_days
            : matched?.challenges?.duration_days;
        scheduleMorningMotivation({
          morningTime: "07:00",
          streakCount,
          taskCount: dueToday.due,
          startAt,
          timeZone: timezone ?? "UTC",
          todayKey,
          durationDays,
          challengeName: challengeTitle,
        }).catch(() => {});
      } else {
        await cancelMorningMotivation();
      }

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

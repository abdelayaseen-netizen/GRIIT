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
import {
  calendarDateKey,
  earliestWindowClose,
  g2aPushCandidates,
  lapsedOffsetsAvoidingG2a,
} from "@/lib/g2a-notifications";
import { cancelG2aDayReminders, scheduleG2aDayReminders } from "@/lib/g2a-notification-schedule";
import { closeTimeLabel } from "@/lib/g2a-home";
import { calendarDayFromStartAt } from "@/lib/home-day-total";
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

      const winTasks: { name: string; closeHHMM: string | null }[] = [];
      for (const ac of activeRows) {
        const tasks = ac.challenges?.challenge_tasks ?? [];
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
          const taskName =
            typeof (t as { title?: string }).title === "string" && (t as { title: string }).title.trim()
              ? (t as { title: string }).title.trim()
              : "task";
          winTasks.push({ name: taskName, closeHHMM: anchor.trim() });
        }
      }

      const now = new Date();
      const securedToday = lastKey === todayKey;
      const close = earliestWindowClose(winTasks, now, now);
      const matched = activeRows.find((r) => r.id && r.id === (activeChallenge as { id?: string } | null)?.id) ?? activeRows[0];
      const startAt = matched?.start_at ?? matched?.started_at ?? matched?.created_at ?? null;
      const durationDays =
        typeof matched?.challenges?.duration_days === "number" ? matched.challenges.duration_days : 1;
      const shownDay = calendarDayFromStartAt(startAt, timezone ?? "UTC", todayKey, durationDays);
      const title = challengeTitle ?? matched?.challenges?.title ?? "GRIIT";
      const challengeLine = `${title} · Day ${shownDay} of ${durationDays}`;
      const closeLabel = close
        ? closeTimeLabel({ mode: "by", start: close.hhmm, end: null }) || close.hhmm
        : "";

      if (securedToday) {
        await cancelG2aDayReminders();
      } else {
        const candidates = g2aPushCandidates({
          now,
          securedToday: false,
          windowCloseAt: close?.at ?? null,
          windowBody: close
            ? `${close.name} window closes at ${closeLabel}. Your streak is ${streakCount} days.`
            : null,
          challengeLine,
          eveningBody: `${evening?.remaining ?? dueToday.remaining} tasks left today. Your streak is ${streakCount} days.`,
          morningBody: `Secure today and it's ${streakCount + 1}.`,
        });
        await scheduleG2aDayReminders(candidates);
      }

      const g2aDays = securedToday ? [] : [calendarDateKey(now)];
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

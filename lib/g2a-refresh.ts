/**
 * Rebuild today's and tomorrow's G2a pair from the server's current check-ins.
 * Called after a successful check-in, after secure, and from the scheduler.
 */

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { calendarDayFromStartAt } from "@/lib/home-day-total";
import { addCalendarDaysToDateKey, getTodayDateKey } from "@/lib/date-utils";
import { tasksDueTodayAcrossEnrollments } from "@/lib/notification-due-count";
import { closeTimeLabel } from "@/lib/g2a-home";
import {
  g2aChallengeLine,
  g2aEveningBody,
  g2aMorningBody,
  g2aWindowBody,
  planG2aAhead,
  taskCloseHHMM,
  type G2aPushCandidate,
} from "@/lib/g2a-notifications";
import { applyG2aPlan } from "@/lib/g2a-notification-schedule";

type EnrollmentRow = {
  id?: string;
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  challenges?: {
    duration_days?: number;
    title?: string;
    challenge_tasks?: Record<string, unknown>[];
  };
};

export async function scheduleG2aForUser(args: {
  timezone?: string | null;
  lastCompletedDateKey?: string | null;
  streakCount: number;
  activeChallengeId?: string | null;
  /** Server already secured today. Do not wait for stats to catch up. */
  forceSecuredToday?: boolean;
  /** Caller already knows today's remaining. Used so a stale refetch cannot raise the count. */
  remainingToday?: number;
  isCancelled?: () => boolean;
}): Promise<{ today: G2aPushCandidate[]; tomorrow: G2aPushCandidate[] }> {
  const todayKey = getTodayDateKey(args.timezone);
  const myActive = (await trpcQuery(TRPC.challenges.listMyActive).catch(() => [])) as EnrollmentRow[];
  const todayCheckins = (await trpcQuery(TRPC.checkins.getTodayCheckinsForUser).catch(() => [])) as {
    task_id?: string;
    status?: string;
  }[];
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
  const securedToday = args.forceSecuredToday === true || args.lastCompletedDateKey === todayKey;
  const remainingToday = args.remainingToday ?? dueToday.remaining;
  const dueTomorrow = dueToday.due;

  const winTasks: { name: string; closeHHMM: string | null }[] = [];
  for (const ac of activeRows) {
    const tasks = ac.challenges?.challenge_tasks ?? [];
    for (const t of tasks) {
      const row = t as {
        title?: string;
        config?: { timeEnforcementEnabled?: boolean; anchorTimeLocal?: string };
        gateTime?: { mode?: string | null; start?: string | null; end?: string | null } | null;
        gate_time_mode?: string | null;
        gate_time_start?: string | null;
        gate_time_end?: string | null;
        anchorTimeLocal?: string | null;
        anchor_time_local?: string | null;
      };
      if (row.config && row.config.timeEnforcementEnabled === false) continue;
      const closeHHMM = taskCloseHHMM(row);
      if (!closeHHMM) continue;
      const taskName = typeof row.title === "string" && row.title.trim() ? row.title.trim() : "task";
      winTasks.push({ name: taskName, closeHHMM });
    }
  }

  const matched =
    activeRows.find((r) => r.id && r.id === args.activeChallengeId) ?? activeRows[0];
  const startAt = matched?.start_at ?? matched?.started_at ?? matched?.created_at ?? null;
  const durationDays = typeof matched?.challenges?.duration_days === "number" ? matched.challenges.duration_days : 1;
  const title = matched?.challenges?.title ?? "GRIIT";
  const tz = args.timezone ?? "UTC";
  const shownDay = calendarDayFromStartAt(startAt, tz, todayKey, durationDays);
  const tomorrowKey = addCalendarDaysToDateKey(todayKey, 1);
  const tomorrowDay = calendarDayFromStartAt(startAt, tz, tomorrowKey, durationDays);
  const morningTask =
    [...winTasks].sort((a, b) => (a.closeHHMM ?? "").localeCompare(b.closeHHMM ?? ""))[0]?.name ?? "task";
  const closeLabel = (hhmm: string) => closeTimeLabel({ mode: "by", start: hhmm, end: null }) || hhmm;
  const streakCount = args.streakCount;
  const plan = planG2aAhead({
    now: new Date(),
    securedToday,
    remainingToday,
    remainingTomorrow: dueTomorrow,
    tasks: winTasks,
    today: {
      challengeLine: g2aChallengeLine(title, shownDay, durationDays),
      windowBody: (close) => g2aWindowBody(close.name, closeLabel(close.hhmm), streakCount),
      eveningBody: g2aEveningBody(remainingToday, streakCount),
      morningBody: g2aMorningBody({ streak: streakCount, taskName: morningTask, day: shownDay }),
    },
    tomorrow: {
      challengeLine: g2aChallengeLine(title, tomorrowDay, durationDays),
      windowBody: (close) =>
        g2aWindowBody(close.name, closeLabel(close.hhmm), streakCount, { includeStreak: false }),
      eveningBody: g2aEveningBody(dueTomorrow, streakCount, { includeStreak: false }),
      morningBody: g2aMorningBody({
        streak: streakCount,
        taskName: morningTask,
        day: tomorrowDay,
        forTomorrow: true,
      }),
    },
  });
  if (args.isCancelled?.()) return plan;
  await applyG2aPlan(plan);
  return plan;
}

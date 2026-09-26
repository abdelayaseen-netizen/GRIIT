import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import { calendarDayFromStartAt } from "@/lib/home-day-total";
import { taskDisplayName, type HomeProofTask } from "@/lib/home-proof-card";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";

export type DayOpenEnrollment = {
  id: string;
  current_day?: number;
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  challenges?: {
    title?: string;
    duration_days?: number;
    challenge_tasks?: {
      id: string;
      title?: string;
      type?: string;
      require_photo?: boolean;
      gates?: TaskGate[];
      gateTime?: GateTime | null;
      windowState?: WindowState;
      config?: { required?: boolean } & Record<string, unknown>;
    }[];
  } | null;
};

export function dayOpenTasksFromActive(args: {
  enrollments: DayOpenEnrollment[];
  completed: { active_challenge_id?: string; task_id?: string; status?: string }[];
  todayKey: string;
  timeZone: string;
}): HomeProofTask[] {
  const out: HomeProofTask[] = [];
  for (const ac of args.enrollments) {
    const tasks = ac.challenges?.challenge_tasks ?? [];
    const required = tasks.filter((t) => (t.config?.required ?? true) === true);
    const doneSet = new Set(
      args.completed
        .filter((c) => c.active_challenge_id === ac.id && c.status === "completed")
        .map((c) => c.task_id),
    );
    const challengeName = (ac.challenges?.title ?? "").trim() || "Challenge";
    const durationDays = ac.challenges?.duration_days ?? 1;
    const startAt = ac.start_at ?? ac.started_at ?? ac.created_at;
    const currentDay = calendarDayFromStartAt(startAt, args.timeZone, args.todayKey, durationDays);
    const challengeSecuredToday =
      required.length > 0 && required.every((t) => doneSet.has(t.id));
    for (const t of required) {
      out.push({
        id: t.id,
        name: taskDisplayName({ title: t.title, type: t.type, requirePhoto: t.require_photo === true }),
        challengeName,
        activeChallengeId: ac.id,
        currentDay,
        durationDays,
        done: doneSet.has(t.id),
        challengeSecuredToday,
        taskType: String(t.type ?? "check_off").toLowerCase(),
        type: t.type,
        requirePhoto: t.require_photo === true,
        gates: t.gates,
        gateTime: t.gateTime ?? null,
        windowState: t.windowState ?? null,
        taskConfig: buildTaskConfigParam(t as unknown as Record<string, unknown>),
      });
    }
  }
  return out;
}

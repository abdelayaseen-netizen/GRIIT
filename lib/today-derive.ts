import { taskGates, type DetailTask, type Gate } from "@/lib/challenge-detail-mapping";
import { addCalendarDaysToDateKey, mondayFirstIndexForDateKey } from "@/lib/date-utils";
import type { TodayEnrollment, TodayState, TodayTask } from "@/lib/today-state";

export type TodayBadge = { done: number; total: number };

export type TodayWeekStrip = {
  secured: boolean[];
  todayIndex: number;
};

export type TodayProofPick = {
  enrollment: TodayEnrollment;
  task: TodayTask;
};

function flattenTasks(today: TodayState): TodayProofPick[] {
  const out: TodayProofPick[] = [];
  for (const enrollment of today.enrollments) {
    for (const task of enrollment.tasks) {
      out.push({ enrollment, task });
    }
  }
  return out;
}

/** First incomplete required task, else the first task, else null. */
export function pickProofTask(today: TodayState): TodayProofPick | null {
  const flat = flattenTasks(today);
  return flat.find((row) => !row.task.done) ?? flat[0] ?? null;
}

export function badge(today: TodayState): TodayBadge {
  const flat = flattenTasks(today);
  return {
    done: flat.filter((row) => row.task.done).length,
    total: flat.length,
  };
}

/** Mon→Sun fill from payload date_key + secured_date_keys. */
export function weekStrip(today: TodayState): TodayWeekStrip {
  if (!today.date_key) {
    return { secured: [false, false, false, false, false, false, false], todayIndex: 0 };
  }
  const todayIndex = mondayFirstIndexForDateKey(today.date_key);
  const monday = addCalendarDaysToDateKey(today.date_key, -todayIndex);
  const keys = new Set(today.secured_date_keys);
  const secured = Array.from({ length: 7 }, (_, i) => keys.has(addCalendarDaysToDateKey(monday, i)));
  return { secured, todayIndex };
}

export function proofGates(task: TodayTask): Gate[] {
  const config = (task.config ?? {}) as DetailTask["config"];
  return taskGates({
    require_photo: task.require_photo,
    require_location: task.require_location,
    config,
  });
}

export function proofDotKind(taskDone: boolean): "filled" | "outline" {
  return taskDone ? "filled" : "outline";
}

export function firstUnsecuredEnrollment(today: TodayState): TodayEnrollment | null {
  return today.enrollments.find((e) => !e.secured_today) ?? null;
}

export function taskTypeFromToday(task: TodayTask): string {
  const cfg = task.config ?? {};
  if (typeof cfg.task_type === "string" && cfg.task_type.trim()) return cfg.task_type;
  if (typeof cfg.type === "string" && cfg.type.trim()) return cfg.type;
  if (task.require_photo) return "photo";
  return "checkin";
}

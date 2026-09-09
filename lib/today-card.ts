import {
  formatTimeWindow,
  taskGates,
  type GateKind,
} from "@/lib/challenge-detail-mapping";
import type { TodayState, TodayTask } from "@/lib/today-state";

export type TodayCardTask = {
  id: string;
  name: string;
  gates: GateKind[];
  time_window?: string;
  done: boolean;
};

export type TodayCardGroup = {
  challenge_name: string;
  active_challenge_id: string;
  tasks: TodayCardTask[];
};

export type TodayCardModel = {
  groups: TodayCardGroup[];
  done: number;
  total: number;
  labelled: boolean;
  day_secured: boolean;
};

/** Copy table. Built here; screens must not invent gate words. */
const GATE_COPY = {
  camera: "Camera",
  location: "Location",
  selfReported: "Self-reported",
  timeWindow: (window: string) => `Time window ${window}`,
  join: " · ",
} as const;

function configWindow(task: TodayTask): { start: string; end: string } {
  const config = task.config ?? {};
  const start = typeof config.schedule_window_start === "string" ? config.schedule_window_start.trim() : "";
  const end = typeof config.schedule_window_end === "string" ? config.schedule_window_end.trim() : "";
  return { start, end };
}

function toCardTask(task: TodayTask): TodayCardTask {
  const gates = taskGates({
    require_photo: task.require_photo,
    require_location: task.require_location,
    config: task.config,
  }).map((g) => g.kind);
  const { start, end } = configWindow(task);
  const time_window = start && end ? formatTimeWindow(start, end) ?? undefined : undefined;
  return {
    id: task.id,
    name: task.title,
    gates,
    time_window,
    done: task.done,
  };
}

export function todayCardGateLabel(task: Pick<TodayCardTask, "gates" | "time_window">): string {
  if (task.gates.length === 0) return GATE_COPY.selfReported;
  return task.gates
    .map((kind) => {
      if (kind === "camera") return GATE_COPY.camera;
      if (kind === "location") return GATE_COPY.location;
      return GATE_COPY.timeWindow(task.time_window ?? "");
    })
    .join(GATE_COPY.join);
}

/** Groups stay in enrollment order. Undone first inside each group only. */
export function todayCard(today: TodayState): TodayCardModel {
  const groups = today.enrollments.map((enrollment) => {
    const tasks = enrollment.tasks
      .map(toCardTask)
      .sort((a, b) => Number(a.done) - Number(b.done));
    return {
      challenge_name: enrollment.title,
      active_challenge_id: enrollment.active_challenge_id,
      tasks,
    };
  });
  const all = groups.flatMap((g) => g.tasks);
  const done = all.filter((t) => t.done).length;
  return {
    groups,
    done,
    total: all.length,
    labelled: groups.length > 1,
    day_secured: today.secured,
  };
}

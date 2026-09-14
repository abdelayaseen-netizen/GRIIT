import type { GateKind } from "@/lib/challenge-detail-mapping";

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

const GATE_COPY = {
  camera: "Camera",
  location: "Location",
  selfReported: "Self-reported",
  timeWindow: (window: string) => `Time window ${window}`,
  join: " · ",
} as const;

/** Same vocabulary as taskGates() / formatTimeWindow(). Screens do not invent gate words. */
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

/** Flat shape for ramp math (end values = Day N targets from config). */
export type DailyTargetTaskInput = {
  target_mode: string;
  start_value: number | null;
  target_value: number | null;
  start_duration_minutes: number | null;
  duration_minutes: number | null;
};

function roundForKind(
  n: number,
  kind: "int" | "runDistance" | "decimal"
): number {
  if (kind === "int") return Math.round(n);
  if (kind === "runDistance") return Math.round(n * 10) / 10;
  return Math.round(n * 10) / 10;
}

/**
 * Linear daily target for a task. dayNumber and totalDays are 1-indexed length of the challenge.
 */
export function getDailyTarget(
  task: DailyTargetTaskInput,
  dayNumber: number,
  totalDays: number,
  roundKind: "int" | "runDistance" = "int"
): { targetValue: number | null; durationMinutes: number | null } {
  const fixedValue = task.target_value;
  const fixedDur = task.duration_minutes;
  const mode = task.target_mode === "ramp" ? "ramp" : "fixed";
  const hasRampValue = task.start_value != null && fixedValue != null;
  const hasRampDur =
    task.start_duration_minutes != null && fixedDur != null;

  if (mode !== "ramp" || (!hasRampValue && !hasRampDur)) {
    return { targetValue: fixedValue, durationMinutes: fixedDur };
  }

  const n = Math.max(1, dayNumber);
  const total = Math.max(1, totalDays);
  const progress = total <= 1 ? 1 : (n - 1) / (total - 1);

  let outV: number | null = fixedValue;
  let outD: number | null = fixedDur;

  if (hasRampValue) {
    const start = Number(task.start_value);
    const end = Number(fixedValue);
    const raw = start + (end - start) * progress;
    outV = roundForKind(raw, roundKind);
  }
  if (hasRampDur) {
    const startD = Number(task.start_duration_minutes);
    const endD = Number(fixedDur);
    const rawD = startD + (endD - startD) * progress;
    outD = Math.round(rawD);
  }

  return { targetValue: outV, durationMinutes: outD };
}

/**
 * Maps challenge_tasks row + config to end targets used by getDailyTarget.
 */
export function getEndTargetsForTaskType(
  taskType: string,
  config: Record<string, unknown> | null | undefined
): { target_value: number | null; duration_minutes: number | null } {
  const c = config ?? {};
  switch (taskType) {
    case "run": {
      if (c["tracking_mode"] === "time") {
        const dm =
          typeof c["duration_minutes"] === "number" ? (c["duration_minutes"] as number) : null;
        return { target_value: dm, duration_minutes: dm };
      }
      const tv = typeof c["target_value"] === "number" ? (c["target_value"] as number) : null;
      return { target_value: tv, duration_minutes: null };
    }
    case "timer": {
      const dm = typeof c["duration_minutes"] === "number" ? (c["duration_minutes"] as number) : null;
      return { target_value: null, duration_minutes: dm };
    }
    case "water": {
      const tv = typeof c["target_value"] === "number" ? (c["target_value"] as number) : null;
      return { target_value: tv, duration_minutes: null };
    }
    case "reading": {
      const pages = typeof c["target_pages"] === "number" ? (c["target_pages"] as number) : null;
      const session =
        typeof c["reading_session_minutes"] === "number"
          ? (c["reading_session_minutes"] as number)
          : typeof c["duration_minutes"] === "number"
            ? (c["duration_minutes"] as number)
            : null;
      return { target_value: pages, duration_minutes: session };
    }
    case "counter": {
      const tv = typeof c["target_count"] === "number" ? (c["target_count"] as number) : null;
      return { target_value: tv, duration_minutes: null };
    }
    case "workout": {
      const dm = typeof c["duration_minutes"] === "number" ? (c["duration_minutes"] as number) : null;
      return { target_value: dm, duration_minutes: dm };
    }
    default:
      return { target_value: null, duration_minutes: null };
  }
}

export function getDailyTargetForChallengeTask(
  row: {
    task_type?: string | null;
    target_mode?: string | null;
    start_value?: number | null;
    start_duration_minutes?: number | null;
    config?: Record<string, unknown> | null;
    min_duration_minutes?: number | null;
  },
  dayNumber: number,
  totalDays: number
): { targetValue: number | null; durationMinutes: number | null } {
  const taskType = row.task_type ?? "manual";
  const { target_value, duration_minutes } = getEndTargetsForTaskType(
    taskType,
    row.config
  );
  const endDur =
    row.min_duration_minutes != null
      ? row.min_duration_minutes
      : duration_minutes;
  const roundKind = taskType === "run" ? "runDistance" : "int";
  return getDailyTarget(
    {
      target_mode: row.target_mode ?? "fixed",
      start_value: row.start_value != null ? Number(row.start_value) : null,
      target_value: target_value != null ? Number(target_value) : null,
      start_duration_minutes:
        row.start_duration_minutes != null
          ? row.start_duration_minutes
          : null,
      duration_minutes: endDur != null ? Number(endDur) : null,
    },
    dayNumber,
    totalDays,
    roundKind
  );
}

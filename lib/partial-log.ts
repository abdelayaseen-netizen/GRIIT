/**
 * Build 92 chunk 03: short-of-goal and partial-log lines.
 * Port of design/handoff/b92/part1-finish-loop/src/finish/format.ts (shortOfGoal, soFarLine, dayTotal,
 * parseHms). Copy from the Part 1 README rows Run, Partial, Short toast, Home row. Do not import the handoff.
 */

/** "2", "1.5", "0.25" — no trailing zeros. */
export function fmtQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

/** "h:mm:ss" or "mm:ss" → seconds. */
export function parseHms(v: string): number | null {
  const parts = v.trim().split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : NaN));
  if (nums.some((n) => Number.isNaN(n))) return null;
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}

/** Under the goal: the done line and how short. At or past it: null. */
export function shortOfGoal(value: number, goal: number, unit: string): { done: string; short: string } | null {
  if (goal <= 0 || value >= goal) return null;
  const gap = Math.round((goal - value) * 100) / 100;
  const u = unit.trim();
  return {
    done: `${fmtQty(value)} of ${fmtQty(goal)}${u ? ` ${u}` : ""}`,
    short: `${fmtQty(gap)}${u ? ` ${u}` : ""} short`,
  };
}

export const WONT_COUNT_NOTE = (goal: number, unit: string) =>
  `Today won't count toward the ${fmtQty(goal)} ${unit} goal. The run is saved, the task stays open and today isn't secured.`;

/** "Save 2 mi · won't count today" / "Save 4 · won't count today". */
export const shortSaveLabel = (amount: string) => `Save ${amount} · won't count today`;

/** "Run saved. 1 mi short, so today isn't secured yet." */
export const shortToast = (what: string, short: string) => `${what} saved. ${short} short, so today isn't secured yet.`;

/** Logs of one local day add up; another day starts at zero. */
export const dayTotal = (logs: { value: number; localDate: string }[], today: string) =>
  logs.filter((l) => l.localDate === today).reduce((a, l) => a + l.value, 0);

/** Floating-point-safe sum of the saved total and the log being typed. */
export const partialLogTotal = (soFar: number, adding: number | null) =>
  Math.round((soFar + (adding ?? 0)) * 1000) / 1000;

/** "2 of 3 mi so far" (+ " today") until the goal; "3 of 3 mi" at or past it. */
export function soFarLine(total: number, goal: number, unit: string, today = false): string {
  const u = unit.trim();
  const tail = u ? ` ${u}` : "";
  if (total >= goal) return `${fmtQty(goal)} of ${fmtQty(goal)}${tail}`;
  return `${fmtQty(total)} of ${fmtQty(goal)}${tail} so far${today ? " today" : ""}`;
}

/** Home row under an open task with a saved partial: "2 of 3 mi logged". */
export function homePartialLine(done: number, goal: number, unit: string): string | null {
  if (!(done > 0) || goal <= 0 || done >= goal) return null;
  const u = unit.trim();
  return `${fmtQty(done)} of ${fmtQty(goal)}${u ? ` ${u}` : ""} logged`;
}

export const PARTIAL_ADD_DISTANCE = "Add distance";
export const PARTIAL_TODAY_TOTAL = "Today's total";

export type PartialLog = {
  value: number;
  distance_km?: number;
  duration_min?: number;
  entry_mode?: string;
  at: string;
};

/** Reads `partial_logs` off a check-in's proof payload; anything else is an empty list. */
export function partialLogsFrom(payload: unknown): PartialLog[] {
  if (!payload || typeof payload !== "object") return [];
  const raw = (payload as { partial_logs?: unknown }).partial_logs;
  if (!Array.isArray(raw)) return [];
  return raw.filter((l): l is PartialLog => !!l && typeof l === "object" && typeof (l as PartialLog).value === "number");
}

/**
 * Home row for an open task with a pending total. Runs store kilometres; the goal and unit come
 * from the task config (`target_value` + `unit`/`distance_unit`, counters via the counter keys).
 */
export function homeTaskPartialLine(
  task: Record<string, unknown>,
  taskType: string,
  pendingValue: number | undefined,
): string | null {
  if (!(typeof pendingValue === "number" && pendingValue > 0)) return null;
  const cfg = ((task.config ?? {}) as Record<string, unknown>) || {};
  const num = (k: string) => (typeof cfg[k] === "number" && (cfg[k] as number) > 0 ? (cfg[k] as number) : null);
  if (taskType === "run") {
    const goal = num("target_value") ?? num("distance");
    if (goal == null) return null;
    const unitRaw = String(cfg.unit ?? cfg.distance_unit ?? "km").toLowerCase();
    const unit = unitRaw.startsWith("mi") ? "mi" : "km";
    const done = unit === "mi" ? pendingValue / 1.609344 : pendingValue;
    return homePartialLine(Math.round(done * 100) / 100, goal, unit);
  }
  if (taskType === "counter" || taskType === "water" || taskType === "reading") {
    const goal =
      num("daily_target") ?? num("goal") ?? num("target_value") ?? num("target_count") ?? num("target_pages") ?? num("cup_count") ?? num("pages");
    if (goal == null) return null;
    const unit = String(cfg.unit ?? cfg.unit_label ?? cfg.target_unit ?? (taskType === "reading" ? "pages" : taskType === "water" ? "cups" : "")).trim();
    return homePartialLine(pendingValue, goal, unit);
  }
  return null;
}

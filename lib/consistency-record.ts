export const CONSISTENCY_TITLE = "Consistency";
export const DAYS_SECURED_LABEL = "Days secured";
export const LONGEST_STREAK_LABEL = "Longest streak";
export const TOTAL_SECURED_LABEL = "Total secured";
export const COMPLETION_LABEL = "Completion";
export const FIRST_PROOF_LABEL = "First proof";
export const CAMERA_PROOF_LABEL = "Camera proof";
export const SELF_REPORTED_LABEL = "Self-reported";
export const BY_MONTH_LABEL = "By month";
export const BY_CHALLENGE_LABEL = "By challenge";
export const DAYS_CAPTION = "days";
export const CONSISTENCY_FOOTER =
  "A day is secured or it is not. A part-done day counts for nothing, and the count is here so the record is not shorter than the truth.";
export const HELD_BY_LAST_STAND_LABEL = "Held by a Last Stand";
export const HELD_BY_FREEZE_LABEL = "Held by a freeze";
export const RECORD_DAY_SECURED = "Secured";
export const RECORD_DAY_NOT_SECURED = "Not secured";
export const RECORD_DAY_OPEN = "Open";
export const NOTHING_WAS_CHECKED = "nothing was checked";

export type RecordDayRowState = "secured" | "not_secured" | "last_stand" | "frozen" | "open";

export type RecordDayRow = {
  dateKey: string;
  state: RecordDayRowState;
  done: number;
  total: number;
  cameraProof: boolean;
  missedTaskNames: readonly string[];
};

export function lastStandSplitLine(n: number): string {
  return `Held by a Last Stand — ${n} days`;
}

export function freezeSplitLine(n: number): string {
  return `Held by a freeze — ${n} days`;
}

export function recordDayLabel(state: string): string {
  if (state === "last_stand") return HELD_BY_LAST_STAND_LABEL;
  if (state === "frozen") return HELD_BY_FREEZE_LABEL;
  if (state === "secured") return RECORD_DAY_SECURED;
  if (state === "open") return RECORD_DAY_OPEN;
  return RECORD_DAY_NOT_SECURED;
}

export function recordDayDetail(day: RecordDayRow): string {
  if (day.state === "secured") {
    return `${day.total} of ${day.total} · ${day.cameraProof ? 1 : 0} camera proof`;
  }
  if (day.state === "last_stand") {
    return `${day.done} of ${day.total} · ${NOTHING_WAS_CHECKED}`;
  }
  const missed = day.missedTaskNames.map((n) => n.trim()).filter(Boolean).join(", ");
  return missed ? `${day.done} of ${day.total} · ${missed}` : `${day.done} of ${day.total}`;
}

export function recordDayNumber(dateKey: string): string {
  const day = Number(dateKey.slice(-2));
  return Number.isFinite(day) ? String(day) : dateKey;
}

export function ofElapsed(elapsed: number): string {
  return `of ${elapsed}`;
}

export function heroDayLine(day: number, total: number): string {
  return `Day ${day} of ${total}.`;
}

export function daysValue(n: number): string {
  return `${n} days`;
}

export function challengeProofCaption(camera: number, selfReported: number): string {
  return `${camera} camera proof, ${selfReported} self-reported`;
}

/** Percentage of days elapsed. Never duration_days. */
export function completionPct(verifiedClosed: number, closedDueDays: number): string {
  if (closedDueDays <= 0) return "—";
  return `${Math.round((verifiedClosed / closedDueDays) * 100)}%`;
}

/** One cell kind for the week strip and the proofs calendar (frame 126). */

export type DayCellKind =
  | "self"
  | "camera"
  | "private"
  | "photo_missing"
  | "freeze"
  | "last_stand"
  | "missed"
  | "today"
  | "future"
  | "before"
  | "na";

export type ProofsDayIn = {
  date: string;
  state: string;
  cover_url?: string | null;
  shared?: boolean;
};

export type DayCellModel = {
  date: string;
  kind: DayCellKind;
  coverUrl?: string | null;
  lock: boolean;
};

const LABELS: Record<DayCellKind, string> = {
  self: "secured, self-reported",
  camera: "secured, camera photo",
  private: "secured, camera photo, private",
  photo_missing: "secured, photo not saved",
  freeze: "held by a freeze",
  last_stand: "held by a Last Stand",
  missed: "missed",
  today: "today, open",
  future: "not yet",
  before: "before you joined",
  na: "not applicable",
};

export function dayCellLabel(kind: DayCellKind): string {
  return LABELS[kind];
}

/** Visitor never sees a lock or a private photo. */
export function dayCellFromProofsDay(
  day: ProofsDayIn,
  viewer: "owner" | "visitor",
): DayCellModel {
  const date = day.date;
  const shared = day.shared === true;
  const cover = day.cover_url ?? null;
  const camera = day.state === "camera" || (day.state === "today_secured" && Boolean(cover));

  if (viewer === "visitor" && camera && !shared) {
    return { date, kind: "self", coverUrl: null, lock: false };
  }
  if (camera && !cover) {
    return { date, kind: "photo_missing", coverUrl: null, lock: false };
  }
  if (camera && !shared && viewer === "owner") {
    return { date, kind: "private", coverUrl: cover, lock: true };
  }
  if (camera) {
    return { date, kind: "camera", coverUrl: cover, lock: false };
  }
  if (day.state === "self" || day.state === "today_secured") {
    return { date, kind: "self", coverUrl: null, lock: false };
  }
  if (day.state === "freeze") return { date, kind: "freeze", lock: false };
  if (day.state === "last_stand") return { date, kind: "last_stand", lock: false };
  if (day.state === "today_open") return { date, kind: "today", lock: false };
  if (day.state === "missed") return { date, kind: "missed", lock: false };
  if (day.state === "future") return { date, kind: "future", lock: false };
  return { date, kind: "before", lock: false };
}

export function dayCellFromWeekState(
  state: "secured" | "frozen" | "last_stand" | "missed" | "na",
  isToday: boolean,
): DayCellKind {
  if (state === "na") return "na";
  if (state === "secured") return "self";
  if (state === "frozen") return "freeze";
  if (state === "last_stand") return "last_stand";
  if (isToday) return "today";
  return "missed";
}

/** Outline width. Days before enrollment (`na`) have none. */
export function dayCellBorderWidth(kind: DayCellKind): number {
  if (kind === "today") return 2;
  if (kind === "last_stand") return 1.5;
  if (
    kind === "missed" ||
    kind === "future" ||
    kind === "before" ||
    kind === "photo_missing" ||
    kind === "freeze"
  ) {
    return 1;
  }
  return 0;
}

export function monthTitle(monthKey: string): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  if (!year || !month) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Monday-first blanks before the 1st of the month. */
export function leadingBlanksMondayFirst(monthKey: string): number {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  if (!year || !month) return 0;
  const dow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (dow + 6) % 7;
}

export const CALENDAR_LEGEND_OWNER = [
  "Secured",
  "Camera photo",
  "Private",
  "Freeze",
  "Last Stand",
  "Missed",
  "Today",
] as const;

export const CALENDAR_LEGEND_VISITOR = [
  "Secured",
  "Camera photo",
  "Freeze",
  "Last Stand",
  "Missed",
  "Today",
] as const;

export const NO_DAYS_YET = "No days yet. Day 1 is today.";

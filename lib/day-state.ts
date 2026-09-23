/**
 * Chunk U: one DayState union, one glyph table, one dayArray.
 * Every number on Profile / Home / the board is a reduction over this array.
 */
import {
  addCalendarDaysToDateKey,
  getCurrentWeekDateKeys,
  getTodayDateKey,
  mondayFirstIndexForDateKey,
} from "@/lib/date-utils";

export type DayState =
  | "camera"
  | "self"
  | "freeze"
  | "laststand"
  | "missed"
  | "today"
  | "notdue"
  | "beforejoin";

export const DAY_STATES: readonly DayState[] = [
  "camera",
  "self",
  "freeze",
  "laststand",
  "missed",
  "today",
  "notdue",
  "beforejoin",
] as const;

/** Shape carries the state; colour only reinforces it (contradiction 66 / 72). */
export const DAY_GLYPH: Record<
  DayState,
  { icon?: "check" | "snowflake" | "shield"; fill?: string; border?: string; dashed?: boolean; dot?: boolean; dash?: boolean }
> = {
  camera: { icon: "check", fill: "brand" },
  self: { fill: "brandTint", border: "brand", dot: true },
  freeze: { icon: "snowflake", fill: "surface", border: "border" },
  laststand: { icon: "shield", fill: "surface", border: "brand" },
  missed: { border: "border", dash: true },
  today: { border: "brand", dashed: true },
  notdue: { dot: true },
  beforejoin: {},
};

export const DAY_GLYPH_LABEL: Record<DayState, string> = {
  camera: "Camera proof",
  self: "Self-reported",
  freeze: "Freeze held it",
  laststand: "Last Stand held it",
  missed: "Missed",
  today: "Open, today",
  notdue: "Not due yet",
  beforejoin: "Before first join",
};

export type EnrollmentInput = {
  challengeId: string;
  startDateKey: string;
  endDateKey?: string | null;
};

export type SecuredDayInput = {
  dateKey: string;
  camera?: boolean;
};

export type DayRecord = {
  dateKey: string;
  state: DayState;
  challengeIds: string[];
};

export type DayArrayOptions = {
  todayKey?: string;
  frozenDateKeys?: readonly string[];
  lastStandDateKeys?: readonly string[];
  visitor?: boolean;
  throughDateKey?: string;
};

function asSecured(securedDays: readonly SecuredDayInput[] | readonly string[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const row of securedDays) {
    if (typeof row === "string") map.set(row, false);
    else map.set(row.dateKey, row.camera === true);
  }
  return map;
}

function enrollmentsOn(dateKey: string, enrollments: readonly EnrollmentInput[]): string[] {
  return enrollments
    .filter((e) => e.startDateKey <= dateKey && (!e.endDateKey || dateKey <= e.endDateKey))
    .map((e) => e.challengeId);
}

function firstJoinKey(enrollments: readonly EnrollmentInput[]): string | null {
  let first: string | null = null;
  for (const e of enrollments) {
    if (!first || e.startDateKey < first) first = e.startDateKey;
  }
  return first;
}

function keysInclusive(start: string, end: string): string[] {
  if (start > end) return [];
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addCalendarDaysToDateKey(cur, 1);
  }
  return out;
}

export function isSecuredState(state: DayState): boolean {
  return state === "camera" || state === "self";
}

export function isHeldState(state: DayState): boolean {
  return state === "freeze" || state === "laststand";
}

export function isElapsedState(state: DayState): boolean {
  return state !== "today" && state !== "notdue" && state !== "beforejoin";
}

function stateFor(input: {
  dateKey: string;
  todayKey: string;
  firstJoin: string | null;
  due: boolean;
  secured: boolean;
  camera: boolean;
  frozen: boolean;
  lastStand: boolean;
}): DayState {
  if (!input.firstJoin || input.dateKey < input.firstJoin) return "beforejoin";
  if (input.dateKey > input.todayKey) return "notdue";
  if (!input.due) return "notdue";
  if (input.dateKey === input.todayKey && !input.secured) return "today";
  if (input.lastStand && !input.secured) return "laststand";
  if (input.frozen && !input.secured) return "freeze";
  if (input.secured) return input.camera ? "camera" : "self";
  return "missed";
}

/**
 * One array of enrolled days. Numbers on Consistency, the week strip, the streak,
 * and the per-challenge board are reductions over this — never authored props.
 */
export function dayArray(
  enrollments: readonly EnrollmentInput[],
  securedDays: readonly SecuredDayInput[] | readonly string[],
  tz: string,
  opts: DayArrayOptions = {},
): DayRecord[] {
  const todayKey = opts.todayKey ?? getTodayDateKey(tz);
  const firstJoin = firstJoinKey(enrollments);
  if (!firstJoin) return [];

  const monthEnd = `${todayKey.slice(0, 7)}-${String(
    new Date(Date.UTC(Number(todayKey.slice(0, 4)), Number(todayKey.slice(5, 7)), 0)).getUTCDate(),
  ).padStart(2, "0")}`;
  const through = opts.throughDateKey ?? (monthEnd > todayKey ? monthEnd : todayKey);
  const secured = asSecured(securedDays);
  const frozen = new Set(opts.frozenDateKeys ?? []);
  const stood = new Set(opts.lastStandDateKeys ?? []);

  return keysInclusive(firstJoin, through).map((dateKey) => {
    const challengeIds = enrollmentsOn(dateKey, enrollments);
    return {
      dateKey,
      challengeIds,
      state: stateFor({
        dateKey,
        todayKey,
        firstJoin,
        due: challengeIds.length > 0,
        secured: secured.has(dateKey),
        camera: secured.get(dateKey) === true,
        frozen: frozen.has(dateKey),
        lastStand: stood.has(dateKey),
      }),
    };
  });
}

export function consistencyFromDays(days: readonly DayRecord[]): {
  secured: number;
  elapsed: number;
  firstJoinDate: string | null;
} {
  const elapsedDays = days.filter((d) => isElapsedState(d.state));
  return {
    secured: elapsedDays.filter((d) => isSecuredState(d.state)).length,
    elapsed: elapsedDays.length,
    firstJoinDate: days.find((d) => d.state !== "beforejoin")?.dateKey ?? days[0]?.dateKey ?? null,
  };
}

/** Spec: "{secured} of {elapsed} days secured" */
export function consistencyHeadlineFromDays(days: readonly DayRecord[]): string {
  const { secured, elapsed } = consistencyFromDays(days);
  if (elapsed === 0) {
    return days.some((d) => d.state === "today") ? "First day is today." : "No due days yet.";
  }
  return `${secured} of ${elapsed} days secured`;
}

export function consistencyDenominatorLine(joinedLabel: string): string {
  return `Every day since you joined on ${joinedLabel}, not counting today.`;
}

export const HELD_DAY_LINE =
  "A freeze or a Last Stand holds the streak but is not a secured day.";

/** Consecutive secured days ending at the last elapsed day (today excluded unless secured). */
export function streakFromDays(days: readonly DayRecord[]): number {
  const elapsed = days.filter((d) => isElapsedState(d.state) || isSecuredState(d.state));
  let n = 0;
  for (let i = elapsed.length - 1; i >= 0; i -= 1) {
    if (isSecuredState(elapsed[i]!.state)) n += 1;
    else if (isHeldState(elapsed[i]!.state)) continue;
    else break;
  }
  return n;
}

export function monthGridFromDays(
  days: readonly DayRecord[],
  monthKey: string,
): { leadingBlanks: number; cells: DayRecord[]; secured: number; elapsed: number } {
  const cells = days.filter((d) => d.dateKey.startsWith(monthKey));
  const first = cells[0]?.dateKey ?? `${monthKey}-01`;
  const leadingBlanks = mondayFirstIndexForDateKey(first);
  const elapsed = cells.filter((d) => isElapsedState(d.state));
  return {
    leadingBlanks,
    cells,
    secured: elapsed.filter((d) => isSecuredState(d.state)).length,
    elapsed: elapsed.length,
  };
}

export function weekStripFromDays(
  days: readonly DayRecord[],
  tz: string,
  todayKey?: string,
): DayRecord[] {
  const week = getCurrentWeekDateKeys(tz);
  const byKey = new Map(days.map((d) => [d.dateKey, d]));
  const today = todayKey ?? getTodayDateKey(tz);
  return week.map((dateKey) => {
    const existing = byKey.get(dateKey);
    if (existing) return existing;
    return {
      dateKey,
      challengeIds: [],
      state: dateKey < today ? "beforejoin" : dateKey === today ? "today" : "notdue",
    };
  });
}

export function boardRowsFromDays(
  days: readonly DayRecord[],
  enrollments: readonly EnrollmentInput[],
): { challengeId: string; secured: number; elapsed: number }[] {
  return enrollments.map((e) => {
    const slice = days.filter((d) => d.challengeIds.includes(e.challengeId) && isElapsedState(d.state));
    return {
      challengeId: e.challengeId,
      secured: slice.filter((d) => isSecuredState(d.state)).length,
      elapsed: slice.length,
    };
  });
}

export type ProofDay = {
  dateKey: string;
  photoCount: number;
  sharedCount: number;
  hasPrivate: boolean;
};

/** Visitor: shared photos only; a day with none is dropped (R3). */
export function visibleProofDays(days: readonly ProofDay[], isOwner: boolean): ProofDay[] {
  if (isOwner) return [...days];
  return days
    .map((d) => ({ ...d, photoCount: d.sharedCount, hasPrivate: false }))
    .filter((d) => d.photoCount > 0);
}

export function weekStripLegendStates(days: readonly DayRecord[]): DayState[] {
  const present = new Set(days.map((d) => d.state));
  return (["camera", "self", "freeze", "laststand", "missed"] as const).filter((s) => present.has(s));
}

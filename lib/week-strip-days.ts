import { addCalendarDaysToDateKey } from "@/backend/lib/date-utils";

export type WeekStripDayState =
  | "secured"
  | "frozen"
  | "last_stand"
  | "missed"
  | "future"
  | "before"
  | "na";

export const WEEK_STRIP_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Challenge detail strip. Missed is only a past due day. Future stays dotted. Before join is a dot. */
export function enrollmentWeekDayState(input: {
  dateKey: string;
  startDateKey: string;
  todayKey: string;
  lastDateKey: string;
  secured: boolean;
  frozen: boolean;
  lastStand: boolean;
}): WeekStripDayState {
  if (!input.dateKey || input.dateKey < input.startDateKey) return "before";
  if (input.dateKey > input.todayKey || input.dateKey > input.lastDateKey) return "future";
  if (input.secured) return "secured";
  if (input.lastStand) return "last_stand";
  if (input.frozen) return "frozen";
  if (input.dateKey < input.todayKey) return "missed";
  return "missed";
}
export function weekStripDayState(input: {
  secured: boolean;
  frozen: boolean;
  lastStand: boolean;
}): WeekStripDayState {
  if (input.secured) return "secured";
  if (input.lastStand) return "last_stand";
  if (input.frozen) return "frozen";
  return "missed";
}

const WEEK_STRIP_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function weekStripDayStates(
  weekDateKeys: readonly string[],
  input: {
    securedDateKeys: readonly string[];
    frozenDateKeys?: readonly string[];
    lastStandDateKeys?: readonly string[];
    todayKey: string;
    todaySecured: boolean;
  },
): WeekStripDayState[] {
  const secured = new Set(input.securedDateKeys);
  const frozen = new Set(input.frozenDateKeys ?? []);
  const stood = new Set(input.lastStandDateKeys ?? []);
  return weekDateKeys.map((key) => {
    const state = weekStripDayState({
      secured: secured.has(key) || (input.todaySecured && key === input.todayKey),
      frozen: frozen.has(key),
      lastStand: stood.has(key),
    });
    if (state === "missed" && key > input.todayKey) return "future";
    return state;
  });
}

/** Home, Secured, and any week strip: one mark list from the same keys. */
export function buildWeekStripDays(
  weekDateKeys: readonly string[],
  input: {
    securedDateKeys: readonly string[];
    frozenDateKeys?: readonly string[];
    lastStandDateKeys?: readonly string[];
    todayKey: string;
    todaySecured: boolean;
  },
): { letter: string; filled: boolean; state: WeekStripDayState }[] {
  const states = weekStripDayStates(weekDateKeys, input);
  return WEEK_STRIP_LETTERS.map((letter, i) => ({
    letter,
    filled: states[i] === "secured",
    state: states[i] ?? "missed",
  }));
}

/** Days 1–7 from the earliest start. Letters are "1"–"7". Days before that start are a dot. */
export function firstWeekStripDays(
  startKey: string,
  input: {
    securedDateKeys: readonly string[];
    frozenDateKeys?: readonly string[];
    lastStandDateKeys?: readonly string[];
    todayKey: string;
    todaySecured: boolean;
  },
): { letter: string; filled: boolean; state: WeekStripDayState }[] {
  const secured = new Set(input.securedDateKeys);
  const frozen = new Set(input.frozenDateKeys ?? []);
  const stood = new Set(input.lastStandDateKeys ?? []);
  return Array.from({ length: 7 }, (_, i) => {
    const key = addCalendarDaysToDateKey(startKey, i);
    let state: WeekStripDayState;
    if (key < startKey) state = "before";
    else if (key > input.todayKey) state = "future";
    else {
      state = weekStripDayState({
        secured: secured.has(key) || (input.todaySecured && key === input.todayKey),
        frozen: frozen.has(key),
        lastStand: stood.has(key),
      });
    }
    return {
      letter: String(i + 1),
      filled: state === "secured" || state === "frozen",
      state,
    };
  });
}

export function weekStripAccessibilityLabel(
  weekday: string,
  state: WeekStripDayState,
  isToday: boolean,
): string {
  if (state === "na" || state === "before") return `${weekday}, before you joined`;
  if (state === "future") return `${weekday}, not yet`;
  if (state === "last_stand") return `${weekday}, last stand`;
  if (state === "missed" && isToday) return `${weekday}, open`;
  return `${weekday}, ${state}`;
}

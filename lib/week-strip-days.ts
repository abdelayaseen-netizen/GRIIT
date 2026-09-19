export type WeekStripDayState = "secured" | "frozen" | "last_stand" | "missed";

export const WEEK_STRIP_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Home week squares. Secured wins over frozen when both exist for a key. */
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
  return weekDateKeys.map((key) =>
    weekStripDayState({
      secured: secured.has(key) || (input.todaySecured && key === input.todayKey),
      frozen: frozen.has(key),
      lastStand: stood.has(key),
    }),
  );
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

export function weekStripAccessibilityLabel(
  weekday: string,
  state: WeekStripDayState,
  isToday: boolean,
): string {
  if (state === "last_stand") return `${weekday}, last stand`;
  if (state === "missed" && isToday) return `${weekday}, open`;
  return `${weekday}, ${state}`;
}

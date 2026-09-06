/**
 * Profile v2 record — one derived payload from due days + verified days + streaks.
 *
 * Due day (Q7): a calendar day in `profiles.timezone` that sits inside an
 * `active_challenges` row date range (`start_at` → `end_at`, half-open),
 * `status = 'active'`, from the join date (`start_at`). Paused / completed /
 * abandoned excluded. A date in two runs is one due day.
 *
 * Verified: `day_secures.date_key`.
 * Streak: `streaks.active_streak_count` / `longest_streak_count` — same read as Home.
 * Verdict: display only. Not persisted.
 */
import { addCalendarDaysToDateKey, mondayFirstIndexForDateKey } from "@/lib/date-utils";
import {
  badgeRowsFromProgress,
  formatDayMonthYear,
  type ProfileV2BadgeNeed,
} from "@/lib/profile-v2-badges";

export const DAY_STATE = {
  VERIFIED: "verified",
  MISSED: "missed",
  TODAY: "today",
  FUTURE: "future",
} as const;

export type DayState = (typeof DAY_STATE)[keyof typeof DAY_STATE];

export function cellWidth(
  count: number,
  innerWidth = 298,
  gap = 4,
  max = 24,
  min = 6
): number {
  if (!count) return 0;
  return Math.max(min, Math.min(max, Math.floor((innerWidth - (count - 1) * gap) / count)));
}

export function runStates(length: number, elapsed: number, misses: number[] = []): DayState[] {
  return Array.from({ length }, (_, i) => {
    if (i < elapsed) return misses.includes(i) ? DAY_STATE.MISSED : DAY_STATE.VERIFIED;
    if (i === elapsed) return DAY_STATE.TODAY;
    return DAY_STATE.FUTURE;
  });
}

/** No word under 7 closed due days. Display only — no push, tier, or persist. */
export function verdictFor(rate: number, closedDueDays: number): string {
  if (closedDueDays < 7) return "";
  if (rate >= 0.9) return "Locked in";
  if (rate >= 0.75) return "Solid";
  if (rate >= 0.5) return "Slipping";
  return "Rebuilding";
}

export function weeklyAverage(weeks: Array<number | null>): number {
  const live = weeks.filter((w): w is number => w !== null);
  return live.length ? live.reduce((a, b) => a + b, 0) / live.length : 0;
}

export function badgeRows(input: {
  bestStreak: number;
  verifiedDays: number;
  badgeDates?: Partial<Record<ProfileV2BadgeNeed, string>>;
}): ReturnType<typeof badgeRowsFromProgress> {
  const unlocks: Record<string, string> = {};
  const dates = input.badgeDates ?? {};
  if (dates[3]) unlocks["3day"] = dates[3];
  if (dates[7]) unlocks["7day"] = dates[7];
  if (dates[14]) unlocks["14day"] = dates[14];
  if (dates[30]) unlocks["30day"] = dates[30];
  if (dates[100]) unlocks["total_days_100"] = dates[100];
  return badgeRowsFromProgress({
    bestStreak: input.bestStreak,
    verifiedDays: input.verifiedDays,
    unlocks,
  });
}

export type ChallengeRangeInput = {
  id: string;
  challengeId: string;
  name: string;
  /** `active_challenges.status` — only `active` generates due days. */
  status: string;
  /** Join calendar day in the user's timezone (`start_at`). */
  startDateKey: string;
  /** Exclusive end calendar day (`end_at` in timezone). */
  endDateKey: string;
  durationDays: number;
  tasksPerDay: number;
  completedAtKey?: string | null;
};

export type ProfileRecordInput = {
  todayKey: string;
  /** `streaks.active_streak_count` — same column Home reads. */
  currentStreak: number;
  /** `streaks.longest_streak_count`. */
  bestStreak: number;
  lastCompletedDateKey: string | null;
  ranges: ChallengeRangeInput[];
  /** `day_secures.date_key` values. */
  securedDateKeys: string[];
  badgeUnlocks?: Record<string, string>;
};

export type ProfileRecord = {
  streak: {
    current: number;
    best: number;
    lastCompletedDateKey: string | null;
    since: string;
    note: string;
  };
  consistency: {
    rate: string;
    verdict: string;
    line: string;
    strip: DayState[];
    weeks: Array<number | null>;
    weeklyAverage: number;
    dueDayKeys: string[];
    closedDueDays: number;
    verifiedClosed: number;
    dueToday: boolean;
    showWindowControl: boolean;
  };
  runs: {
    id: string;
    challengeId: string;
    name: string;
    day: number;
    length: number;
    dayLabel: string;
    meta: string;
    verified: number;
    missed: number;
    tasksPerDay: number;
    days: DayState[];
  }[];
  completed: {
    id: string;
    challengeId: string;
    name: string;
    verified: number;
    length: number;
    value: string;
  }[];
  proofs: { dateKey: string; day: number; imageUrl?: string | null }[];
  badges: ReturnType<typeof badgeRowsFromProgress>;
  detail: {
    totalVerified: number;
    completion: string;
    firstProof: string;
    longestStreak: number;
    months: { label: string; value: string; pct: number }[];
    byChallenge: { label: string; value: string }[];
  };
};

function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Half-open [startDateKey, endDateKey) clipped to today, from the join date. */
export function dueKeysForRange(
  range: Pick<ChallengeRangeInput, "status" | "startDateKey" | "endDateKey">,
  todayKey: string
): string[] {
  if (range.status !== "active") return [];
  const start = range.startDateKey;
  const end = range.endDateKey;
  if (!start || start > todayKey) return [];
  const keys: string[] = [];
  if (end <= start) {
    if (start <= todayKey) keys.push(start);
    return keys;
  }
  let cursor = start;
  while (cursor < end && cursor <= todayKey) {
    keys.push(cursor);
    cursor = addCalendarDaysToDateKey(cursor, 1);
  }
  return keys;
}

export function unionDueDateKeys(ranges: ChallengeRangeInput[], todayKey: string): string[] {
  const set = new Set<string>();
  for (const range of ranges) {
    for (const key of dueKeysForRange(range, todayKey)) set.add(key);
  }
  return [...set].sort(compareKeys);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function formatDayMonth(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) return "";
  const mon = MONTHS[m - 1];
  if (!mon) return "";
  return `${d} ${mon}`;
}

function monthLabel(dateKey: string): string {
  const [y, m] = dateKey.split("-").map(Number);
  if (y === undefined || m === undefined) return dateKey;
  const mon = MONTHS[m - 1];
  if (!mon) return dateKey;
  return `${mon} ${y}`;
}

function mondayOf(dateKey: string): string {
  return addCalendarDaysToDateKey(dateKey, -mondayFirstIndexForDateKey(dateKey));
}

export function isoWeeksEndingToday(todayKey: string, count = 26): string[] {
  const thisMonday = mondayOf(todayKey);
  return Array.from({ length: count }, (_, i) =>
    addCalendarDaysToDateKey(thisMonday, -7 * (count - 1 - i))
  );
}

function stripState(dateKey: string, todayKey: string, secured: Set<string>): DayState {
  if (dateKey === todayKey) return DAY_STATE.TODAY;
  if (secured.has(dateKey)) return DAY_STATE.VERIFIED;
  return DAY_STATE.MISSED;
}

function consistencyLine(input: {
  dueCount: number;
  closedDueDays: number;
  verifiedClosed: number;
  dueToday: boolean;
  primaryDay: number | null;
  primaryLength: number | null;
}): string {
  if (input.dueCount === 0) return "Join a challenge and the strip starts filling.";
  if (input.dueCount < 7 && input.primaryDay != null && input.primaryLength != null) {
    return input.dueToday
      ? `Day ${input.primaryDay} of ${input.primaryLength}. Today's proof is due.`
      : `Day ${input.primaryDay} of ${input.primaryLength}.`;
  }
  const todayBit = input.dueToday ? " 1 due today." : "";
  return `${input.verifiedClosed} of ${input.closedDueDays} due days verified.${todayBit}`;
}

function rateLabel(dueCount: number, closedDueDays: number, verifiedClosed: number, rate: number): string {
  if (dueCount === 0) return "No due days";
  if (dueCount < 7) return `${verifiedClosed} of ${closedDueDays}`;
  return `${Math.round(rate * 100)}%`;
}

function streakSince(current: number, lastCompletedDateKey: string | null): string {
  if (current <= 0 || !lastCompletedDateKey) return "";
  const start = addCalendarDaysToDateKey(lastCompletedDateKey, -(current - 1));
  return formatDayMonth(start);
}

export function buildProfileRecord(input: ProfileRecordInput): ProfileRecord {
  const secured = new Set(input.securedDateKeys);
  const activeRanges = input.ranges.filter((r) => r.status === "active");
  const completedRanges = input.ranges.filter((r) => r.status === "completed");
  const dueDayKeys = unionDueDateKeys(activeRanges, input.todayKey);
  const closedDueKeys = dueDayKeys.filter((k) => k < input.todayKey);
  const verifiedClosedKeys = closedDueKeys.filter((k) => secured.has(k));
  const dueToday = dueDayKeys.includes(input.todayKey);
  const closedDueDays = closedDueKeys.length;
  const verifiedClosed = verifiedClosedKeys.length;
  const rate = closedDueDays === 0 ? 0 : verifiedClosed / closedDueDays;
  const dueCount = dueDayKeys.length;

  const windowDue = dueDayKeys.slice(-30);
  const strip = windowDue.map((k) => stripState(k, input.todayKey, secured));

  const weekStarts = isoWeeksEndingToday(input.todayKey, 26);
  const weeks = weekStarts.map((monday) => {
    const sunday = addCalendarDaysToDateKey(monday, 6);
    const weekDue = dueDayKeys.filter((k) => k >= monday && k <= sunday && k < input.todayKey);
    if (weekDue.length === 0) return null;
    const weekVerified = weekDue.filter((k) => secured.has(k)).length;
    return weekVerified / weekDue.length;
  });

  const runs = activeRanges
    .slice()
    .sort((a, b) => compareKeys(a.startDateKey, b.startDateKey))
    .map((range) => {
      const rangeDue = dueKeysForRange(range, input.todayKey);
      const elapsed = rangeDue.filter((k) => k < input.todayKey).length;
      const day = rangeDue.length === 0 ? 1 : rangeDue.includes(input.todayKey) ? elapsed + 1 : elapsed;
      const misses = rangeDue
        .map((k, i) => (k < input.todayKey && !secured.has(k) ? i : -1))
        .filter((i) => i >= 0);
      const verified = rangeDue.filter((k) => k < input.todayKey && secured.has(k)).length;
      const missed = misses.length;
      return {
        id: range.id,
        challengeId: range.challengeId,
        name: range.name,
        day,
        length: range.durationDays,
        dayLabel: `Day ${day} of ${range.durationDays}`,
        meta: `${verified} verified · ${missed} missed · ${range.tasksPerDay} tasks daily`,
        verified,
        missed,
        tasksPerDay: range.tasksPerDay,
        days: runStates(range.durationDays, Math.min(elapsed, range.durationDays), misses),
      };
    });

  const completed = completedRanges.map((range) => {
    const lastKey = addCalendarDaysToDateKey(range.endDateKey, -1);
    const keys: string[] = [];
    let cursor = range.startDateKey;
    while (cursor <= lastKey && cursor < range.endDateKey) {
      keys.push(cursor);
      cursor = addCalendarDaysToDateKey(cursor, 1);
    }
    const verified = keys.filter((k) => secured.has(k)).length;
    return {
      id: range.id,
      challengeId: range.challengeId,
      name: range.name,
      verified,
      length: range.durationDays,
      value: `${verified} of ${range.durationDays}`,
    };
  });

  const primary = runs[0] ?? null;
  const line = consistencyLine({
    dueCount,
    closedDueDays,
    verifiedClosed,
    dueToday,
    primaryDay: primary?.day ?? null,
    primaryLength: primary?.length ?? null,
  });

  const firstDue = dueDayKeys[0] ?? null;
  const proofs = dueDayKeys
    .filter((k) => k < input.todayKey && secured.has(k))
    .map((dateKey) => ({
      dateKey,
      day: firstDue
        ? Math.round(
            (Date.parse(`${dateKey}T00:00:00.000Z`) - Date.parse(`${firstDue}T00:00:00.000Z`)) /
              86400000
          ) + 1
        : 1,
    }))
    .reverse();

  const monthMap = new Map<string, { verified: number; due: number }>();
  for (const key of closedDueKeys) {
    const label = monthLabel(key);
    const row = monthMap.get(label) ?? { verified: 0, due: 0 };
    row.due += 1;
    if (secured.has(key)) row.verified += 1;
    monthMap.set(label, row);
  }
  const months = [...monthMap.entries()]
    .map(([label, v]) => ({
      label,
      value: `${v.verified} of ${v.due}`,
      pct: v.due === 0 ? 0 : v.verified / v.due,
    }))
    .reverse();

  const byChallenge = [
    ...runs.map((r) => ({ label: r.name, value: `${r.verified} of ${r.verified + r.missed}` })),
    ...completed.map((c) => ({ label: c.name, value: c.value })),
  ];

  const totalVerified = dueDayKeys.filter((k) => k < input.todayKey && secured.has(k)).length;
  const since = streakSince(input.currentStreak, input.lastCompletedDateKey);

  return {
    streak: {
      current: input.currentStreak,
      best: input.bestStreak,
      lastCompletedDateKey: input.lastCompletedDateKey,
      since,
      note: input.currentStreak > 0 && since ? `Unbroken since ${since}.` : "Post today to start.",
    },
    consistency: {
      rate: rateLabel(dueCount, closedDueDays, verifiedClosed, rate),
      verdict: verdictFor(rate, closedDueDays),
      line,
      strip,
      weeks,
      weeklyAverage: weeklyAverage(weeks),
      dueDayKeys,
      closedDueDays,
      verifiedClosed,
      dueToday,
      showWindowControl: dueCount >= 7,
    },
    runs,
    completed,
    proofs,
    badges: badgeRowsFromProgress({
      bestStreak: input.bestStreak,
      verifiedDays: totalVerified,
      unlocks: input.badgeUnlocks,
    }),
    detail: {
      totalVerified,
      completion: closedDueDays === 0 ? "—" : `${verifiedClosed} of ${closedDueDays} due days`,
      firstProof: verifiedClosedKeys[0] ? formatDayMonthYear(verifiedClosedKeys[0]) : "—",
      longestStreak: input.bestStreak,
      months,
      byChallenge,
    },
  };
}

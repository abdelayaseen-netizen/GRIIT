import { addCalendarDaysToDateKey, dateKeyInTimeZone } from "./date-utils";

/** Hard cap for group (participation_type team) seats. Not per-challenge. */
export const GROUP_MAX_MEMBERS = 10;

export const GROUP_FULL_MESSAGE = "This group is full.";

/**
 * Individual streaks. evaluate_team_day is not invoked for participation_type "team".
 */
export function shouldEvaluateTeamDay(
  participationType: string | null | undefined
): boolean {
  return participationType !== "team";
}

export function dateKeyFromJoinedAt(
  joinedAt: string,
  timezone?: string | null
): string {
  const instant = new Date(joinedAt);
  if (Number.isNaN(instant.getTime())) return joinedAt.slice(0, 10);
  return dateKeyInTimeZone(instant, timezone);
}

/**
 * Consecutive days ending today or yesterday on which every member enrolled
 * that day secured. A member joined mid-run is counted only from their join day.
 */
export function computeGroupStreak(input: {
  todayKey: string;
  members: { userId: string; joinedDateKey: string }[];
  securedKeysByUser: Map<string, Set<string>>;
}): number {
  const { todayKey, members, securedKeysByUser } = input;
  if (members.length === 0) return 0;

  const qualifies = (dateKey: string): boolean => {
    const enrolled = members.filter((m) => m.joinedDateKey <= dateKey);
    if (enrolled.length === 0) return false;
    return enrolled.every((m) => securedKeysByUser.get(m.userId)?.has(dateKey) === true);
  };

  const yesterdayKey = addCalendarDaysToDateKey(todayKey, -1);
  let cursor: string | null = null;
  if (qualifies(todayKey)) cursor = todayKey;
  else if (qualifies(yesterdayKey)) cursor = yesterdayKey;
  if (!cursor) return 0;

  let streak = 0;
  while (qualifies(cursor)) {
    streak += 1;
    cursor = addCalendarDaysToDateKey(cursor, -1);
  }
  return streak;
}

export function memberYesterdayState(
  securedKeys: Set<string> | undefined,
  yesterdayKey: string,
): "secured" | "missed" {
  return securedKeys?.has(yesterdayKey) === true ? "secured" : "missed";
}

/**
 * Name of the first enrolled member who missed yesterday after a qualifying
 * day-before. Null when the group streak is still live or never existed.
 */
export function groupStreakBrokeBy(input: {
  todayKey: string;
  members: { userId: string; joinedDateKey: string; displayName: string }[];
  securedKeysByUser: Map<string, Set<string>>;
}): string | null {
  const { todayKey, members, securedKeysByUser } = input;
  if (members.length === 0) return null;

  const qualifies = (dateKey: string): boolean => {
    const enrolled = members.filter((m) => m.joinedDateKey <= dateKey);
    if (enrolled.length === 0) return false;
    return enrolled.every((m) => securedKeysByUser.get(m.userId)?.has(dateKey) === true);
  };

  const yesterdayKey = addCalendarDaysToDateKey(todayKey, -1);
  const dayBeforeKey = addCalendarDaysToDateKey(todayKey, -2);
  if (qualifies(todayKey) || qualifies(yesterdayKey)) return null;
  if (!qualifies(dayBeforeKey)) return null;

  const misser = members.find(
    (m) =>
      m.joinedDateKey <= yesterdayKey && securedKeysByUser.get(m.userId)?.has(yesterdayKey) !== true,
  );
  return misser?.displayName ?? null;
}

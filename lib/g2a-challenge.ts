/**
 * v43.1 frames 157 + 161 — challenge week, freeze row, people / board copy.
 */

import { dueKeysForRange } from "@/backend/lib/due-keys";
import { enrollmentSecuredDateKeys } from "@/backend/lib/secured-elapsed";
import { addCalendarDaysToDateKey, mondayFirstIndexForDateKey } from "@/lib/date-utils";
import { FREEZE_REFILL_DAYS, freezeRefillDateLabel } from "@/lib/freeze-sheet";
import { countNoun } from "@/lib/onboarding-v2-suggest";

export const THIS_WEEK = "This week";
export const A_BOARD_NEEDS_TWO = "A board needs two.";
export const JUST_YOU_SO_FAR = "Just you so far";
export const PRIVATE_ONLY_YOU = "Private. Only you.";
export const NO_FREEZES = "No freezes";
export const NO_DAYS_OFF_CAPTION = "A missed day resets your streak to 0. No freezes.";
export const FREEZE_COVERS_YESTERDAY =
  "A freeze covers yesterday only. Use it from the morning-after card.";
export const ANYONE_WITH_THE_LINK =
  "Anyone with the link can join. They start at Day 1 the day they join, with their own streak.";

/**
 * Monday–Sunday containing `todayKey`.
 * `todayKey` is the profile-timezone calendar date, so this is the same Monday the challenge board uses.
 */
export function enrollmentWeekDateKeys(todayKey: string): string[] {
  const today = todayKey.trim();
  if (!today) return [];
  const monday = addCalendarDaysToDateKey(today, -mondayFirstIndexForDateKey(today));
  return Array.from({ length: 7 }, (_, i) => addCalendarDaysToDateKey(monday, i));
}

/** Days before the enrollment start are not part of this challenge's week. */
export function weekDayBeforeEnrollment(dateKey: string, startDateKey: string): boolean {
  return Boolean(dateKey) && Boolean(startDateKey) && dateKey < startDateKey;
}

export function weekSecuredOfDue(args: {
  weekKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
  startDateKey: string;
  durationDays: number;
  todaySecured: boolean;
}): { secured: number; due: number; line: string } {
  const last = addCalendarDaysToDateKey(args.startDateKey, Math.max(0, args.durationDays - 1));
  const exclusiveEnd = addCalendarDaysToDateKey(args.startDateKey, Math.max(0, args.durationDays));
  const dueKeys = dueKeysForRange(
    { status: "active", startDateKey: args.startDateKey, endDateKey: exclusiveEnd },
    args.todayKey,
  );
  const secured = new Set(
    enrollmentSecuredDateKeys({
      securedDateKeys: args.securedDateKeys,
      dueDateKeys: dueKeys,
    }),
  );
  if (args.todaySecured && dueKeys.includes(args.todayKey)) secured.add(args.todayKey);
  let due = 0;
  let n = 0;
  for (const key of args.weekKeys) {
    if (key < args.startDateKey || key > last) continue;
    if (key > args.todayKey) continue;
    due += 1;
    if (secured.has(key)) n += 1;
  }
  return { secured: n, due, line: `${n} of ${due} days` };
}

export function freezeDetailCopy(args: {
  remaining: number;
  lastFreezeUsedAt?: string | null;
  hardMode: boolean;
  timeZone: string;
  now?: Date;
}): { title: string; caption: string; icon: "snowflake" | "shield-off" } {
  if (args.hardMode) {
    return { title: NO_FREEZES, caption: NO_DAYS_OFF_CAPTION, icon: "shield-off" };
  }
  const remaining = Math.max(0, Math.floor(args.remaining));
  if (remaining > 0) {
    return {
      title: `${countNoun(remaining, "freeze", "freezes")} left`,
      caption: FREEZE_COVERS_YESTERDAY,
      icon: "snowflake",
    };
  }
  const next = args.lastFreezeUsedAt
    ? freezeRefillDateLabel(args.lastFreezeUsedAt, args.timeZone, args.now)
    : "";
  // used date is last used, next is +FREEZE_REFILL_DAYS — freezeRefillDateLabel already adds the refill.
  // Show last-used as the used date by formatting without the +30 offset:
  const usedLabel = formatUsedDate(args.lastFreezeUsedAt, args.timeZone, args.now);
  return {
    title: "0 freezes left",
    caption:
      usedLabel && next
        ? `You used one on ${usedLabel}. Next one on ${next}.`
        : `Next one in ${FREEZE_REFILL_DAYS} days.`,
    icon: "snowflake",
  };
}

function formatUsedDate(
  lastUsedIso: string | null | undefined,
  timeZone: string,
  now = new Date(),
): string {
  const tz = timeZone.trim() || "UTC";
  const d = lastUsedIso ? new Date(lastUsedIso) : now;
  if (Number.isNaN(d.getTime())) return "";
  try {
    const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "long" }).format(d);
    return `${day} ${month}`;
  } catch {
    return "";
  }
}

export function peopleCardCopy(args: {
  memberCount: number;
  privateOrSolo: boolean;
  challengeTitle: string;
}): {
  heading: string;
  body: string;
  showInvite: boolean;
  inviteLabel: string;
} {
  if (args.privateOrSolo) {
    return {
      heading: PRIVATE_ONLY_YOU,
      body: "",
      showInvite: false,
      inviteLabel: "",
    };
  }
  if (args.memberCount <= 1) {
    return {
      heading: JUST_YOU_SO_FAR,
      body: ANYONE_WITH_THE_LINK,
      showInvite: true,
      inviteLabel: `Invite to ${args.challengeTitle}`,
    };
  }
  return {
    heading: `${args.memberCount} in this challenge`,
    body: ANYONE_WITH_THE_LINK,
    showInvite: true,
    inviteLabel: `Invite to ${args.challengeTitle}`,
  };
}

export function soloBoardCopy(challengeTitle: string): {
  heading: string;
  body: string;
  cta: string;
  picker: string;
} {
  const name = challengeTitle.trim() || "this challenge";
  return {
    heading: A_BOARD_NEEDS_TWO,
    body: `Invite someone to ${name}. Their days count here from the day they join.`,
    cta: `Invite to ${name}`,
    picker: "Just you",
  };
}


const WEEKDAY_LETTER: Record<string, string> = {
  Sun: "S",
  Mon: "M",
  Tue: "T",
  Wed: "W",
  Thu: "T",
  Fri: "F",
  Sat: "S",
};

/** Weekday letter of a civil date in the profile timezone. Noon UTC stays on that date from UTC−12 to UTC+12. */
export function weekdayLetterForDateKey(dateKey: string, timeZone?: string | null): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return "";
  const tz = timeZone?.trim() || "UTC";
  const instant = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  try {
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(instant);
    return WEEKDAY_LETTER[wd] ?? "";
  } catch {
    return "";
  }
}

/**
 * v43.1 frames 157 + 161 — challenge week, freeze row, people / board copy.
 */

import { addCalendarDaysToDateKey } from "@/lib/date-utils";
import { FREEZE_REFILL_DAYS, freezeRefillDateLabel } from "@/lib/freeze-sheet";
import { countNoun } from "@/lib/onboarding-v2-suggest";

export const THIS_WEEK = "This week";
export const A_BOARD_NEEDS_TWO = "A board needs two.";
export const JUST_YOU_SO_FAR = "Just you so far";
export const PRIVATE_ONLY_YOU = "Private. Only you.";
export const NO_FREEZES = "No freezes";
export const NO_DAYS_OFF_CAPTION = "No Days Off. A missed day goes back to Day 1.";
export const FREEZE_COVERS_YESTERDAY =
  "A freeze covers yesterday only. Use it from the morning-after card.";
export const ANYONE_WITH_THE_LINK =
  "Anyone with the link can join. They start at Day 1 the day they join, with their own streak.";

export function enrollmentWeekDateKeys(startDateKey: string, todayKey: string): string[] {
  const start = startDateKey.trim();
  const today = todayKey.trim();
  if (!start || !today) return [];
  let offset = 0;
  if (today >= start) {
    const [ys, ms, ds] = start.split("-").map(Number);
    const [yt, mt, dt] = today.split("-").map(Number);
    const a = Date.UTC(ys ?? 0, (ms ?? 1) - 1, ds ?? 1);
    const b = Date.UTC(yt ?? 0, (mt ?? 1) - 1, dt ?? 1);
    offset = Math.max(0, Math.round((b - a) / 86400000));
  }
  const week = Math.floor(offset / 7);
  const weekStart = addCalendarDaysToDateKey(start, week * 7);
  return Array.from({ length: 7 }, (_, i) => addCalendarDaysToDateKey(weekStart, i));
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
  const secured = new Set(args.securedDateKeys);
  if (args.todaySecured) secured.add(args.todayKey);
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


export function weekdayLetterForDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return "";
  return ["S", "M", "T", "W", "T", "F", "S"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? "";
}

import type { ProofsHeader } from "@/backend/lib/proofs-days";
import { consistencyHeadline, type Consistency } from "@/lib/consistency";

export type { ProofsHeader };

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const EMPTY_SECURED_HEADER: ProofsHeader = {
  secured: 0,
  days: 0,
  firstDueDate: null,
  dueToday: false,
};

/** First due day as "Sep 16". */
export function formatSinceDate(iso: string): string {
  const parts = iso.slice(0, 10).split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day || month < 1 || month > 12) return iso;
  return `${MONTHS[month - 1]} ${day}`;
}

export function consistencyFromHeader(header: ProofsHeader): Consistency {
  return {
    secured: header.secured,
    due: header.days,
    dueToday: header.dueToday,
    firstDueDate: header.firstDueDate,
  };
}

/** Home hero line. Same `header` as Profile secured and the calendar. */
export function securedSinceLine(header: ProofsHeader): string {
  if (header.days === 0) {
    return header.dueToday ? "First day is today." : "No days yet.";
  }
  const since = header.firstDueDate ? ` since ${formatSinceDate(header.firstDueDate)}` : "";
  return `${header.secured} of ${header.days} days secured${since}`;
}

export function calendarHeaderLine(header: ProofsHeader): string {
  if (header.days === 0) return header.dueToday ? "First day is today." : "No days yet.";
  return `of ${header.days === 1 ? "1 day" : `${header.days} days`} secured`;
}

/** The three surfaces that must print the same `header.secured`. */
export function securedSurfaces(header: ProofsHeader): {
  home: string;
  profileSecured: number;
  profileHeadline: string;
  calendarSecured: number;
  calendarLine: string;
} {
  return {
    home: securedSinceLine(header),
    profileSecured: header.secured,
    profileHeadline: consistencyHeadline(consistencyFromHeader(header)),
    calendarSecured: header.secured,
    calendarLine: calendarHeaderLine(header),
  };
}

export function showHomeFreezeChip(remaining: number, hardMode: boolean): boolean {
  return remaining > 0 && !hardMode;
}

export function freezeChipCaption(remaining: number): string {
  return remaining === 1 ? "1 freeze" : `${remaining} freezes`;
}

export function activeChallengesAreHard(
  rows: readonly {
    challenges?: {
      is_hard_mode?: boolean | null;
      difficulty?: string | null;
      title?: string | null;
    } | null;
  }[],
): boolean {
  if (rows.length === 0) return false;
  return rows.every((row) => {
    const ch = row.challenges;
    if (!ch) return false;
    return (
      ch.is_hard_mode === true ||
      String(ch.difficulty ?? "").toLowerCase() === "hard" ||
      ch.title === "No Days Off"
    );
  });
}

export const SEE_ALL_IN_ACTIVITY = "See all in Activity";
export const FOLLOWING_LABEL = "Following";

export function homeFollowingLine(post: {
  eventType: string;
  isCompleted: boolean;
  taskName?: string | null;
  challengeName: string;
  currentDay: number;
  totalDays: number;
}): string {
  if (post.eventType === "joined_challenge" || post.eventType === "challenge_created") {
    return `started ${post.challengeName}`;
  }
  if (post.eventType === "completed_challenge") {
    return `finished ${post.challengeName}`;
  }
  if (post.eventType === "secured_day") {
    return "";
  }
  const task = (post.taskName ?? "").trim() || "a task";
  return `completed ${task} · Day ${post.currentDay} of ${post.totalDays}`;
}

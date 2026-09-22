/**
 * Chunk T end-screen copy and day-sheet mapping.
 * Source: design/handoff/src/components/ChallengeEnd.tsx + CONFLICT 2 ruling.
 */
import { addCalendarDaysToDateKey } from "@/lib/date-utils";
import { formatDayMonthYear } from "@/lib/profile-v2-badges";

export type DayState = "camera" | "self" | "missed" | "frozen" | "last_stand";

export type EndedStatus = "completed" | "abandoned" | "failed";

export type EndedChallenge = {
  id: string;
  challengeId: string;
  title: string;
  duration_days: number;
  status: EndedStatus;
  ended_on_day: number;
  days: DayState[];
  longest_streak: number;
  started_at: string;
  ended_at: string;
};

const SECURED: DayState[] = ["camera", "self"];

export function securedCount(days: DayState[]): number {
  return days.filter((d) => SECURED.includes(d)).length;
}

export function longestSecuredStreak(days: DayState[]): number {
  let best = 0;
  let run = 0;
  for (const d of days) {
    if (SECURED.includes(d)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

export function factLine(c: Pick<EndedChallenge, "status" | "days">): string {
  const secured = securedCount(c.days);
  const cam = c.days.filter((d) => d === "camera").length;
  const self = c.days.filter((d) => d === "self").length;
  const frozen = c.days.filter((d) => d === "frozen").length;
  const stand = c.days.filter((d) => d === "last_stand").length;
  const unsecured = c.days.length - secured;

  if (c.status === "failed") return "Hard mode has no freezes, so one unsecured day ends the run.";
  if (c.days.length === 1) {
    return secured ? `One day, secured. ${cam ? "Camera proof." : "Self-reported."}` : "One day, not secured.";
  }
  if (unsecured === 0) {
    return `${c.days.length} days, none missed. ${cam} camera proof, ${self} self-reported.`;
  }

  const held = frozen + stand;
  const base = `${unsecured} day${unsecured === 1 ? "" : "s"} went unsecured.`;
  if (!held) return `${base} ${cam} camera proof, ${self} self-reported.`;
  const parts = [
    frozen ? (frozen === 1 ? "a freeze" : `${frozen} freezes`) : null,
    stand ? (stand === 1 ? "a Last Stand" : `${stand} Last Stands`) : null,
  ].filter(Boolean);
  return `${base} ${held} of them ${held === 1 ? "was" : "were"} held, by ${parts.join(" and ")}.`;
}

export function combinedTitle(n: number): string {
  if (n === 2) return "Two challenges ended.";
  return `${n} challenges ended.`;
}

export function combinedDateLine(n: number, date: string): string {
  if (n === 2) return `Both finished today, ${date}.`;
  return `All finished today, ${date}.`;
}

/** CONFLICT 2: n>=3 footer names the count. n=2 stays the spec pair line. */
export function combinedFooter(n: number): string {
  if (n === 2) return "Both are in Profile, Finished. Start either again from there.";
  return `All ${n} are in Profile, Finished. Start any again from there.`;
}

export function capCaption(activeCount: number, challengeLimit: number): string {
  return `You are running ${activeCount} of ${challengeLimit}. Starting this again means leaving one.`;
}

export function dateKeyFromIso(iso: string, timeZone: string): string {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return iso.slice(0, 10);
  const tz = timeZone.trim() || "UTC";
  try {
    const s = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(instant);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : instant.toISOString().slice(0, 10);
  } catch {
    return instant.toISOString().slice(0, 10);
  }
}

export function formatEndedDate(iso: string, timeZone: string): string {
  return formatDayMonthYear(dateKeyFromIso(iso, timeZone));
}

export function enrollmentDateKeys(startKey: string, durationDays: number): string[] {
  const n =
    Number.isFinite(durationDays) && durationDays > 0 ? Math.floor(durationDays) : 1;
  return Array.from({ length: n }, (_, i) => addCalendarDaysToDateKey(startKey, i));
}

export function dayStateForKey(
  key: string,
  sets: {
    secured: ReadonlySet<string>;
    frozen: ReadonlySet<string>;
    lastStand: ReadonlySet<string>;
    camera: ReadonlySet<string>;
  },
): DayState {
  if (sets.secured.has(key)) return sets.camera.has(key) ? "camera" : "self";
  if (sets.lastStand.has(key)) return "last_stand";
  if (sets.frozen.has(key)) return "frozen";
  return "missed";
}

export function unwrapChallengeTitle(ch: unknown): { title: string; duration_days: number } {
  const row = Array.isArray(ch) ? ch[0] : ch;
  const r = row as { title?: string | null; duration_days?: number | null } | null;
  return {
    title: r?.title?.trim() || "Challenge",
    duration_days:
      r?.duration_days != null && Number.isFinite(r.duration_days) && r.duration_days > 0
        ? Math.floor(r.duration_days)
        : 1,
  };
}

export function endedStatusOf(status: string): EndedStatus {
  if (status === "failed") return "failed";
  if (status === "abandoned") return "abandoned";
  return "completed";
}

export type UnseenEndingRow = {
  id: string;
  challenge_id: string;
  status: string;
  start_at?: string | null;
  end_at?: string | null;
  ended_at?: string | null;
  current_day?: number | null;
  challenges?: unknown;
};

export function endedChallengeFromUnseen(
  row: UnseenEndingRow,
  input: {
    timeZone: string;
    securedDateKeys: readonly string[];
    frozenDateKeys?: readonly string[];
    lastStandDateKeys?: readonly string[];
    cameraDateKeys?: readonly string[];
  },
): EndedChallenge {
  const ch = unwrapChallengeTitle(row.challenges);
  const startIso = row.start_at ?? row.ended_at ?? new Date().toISOString();
  const endIso = row.ended_at ?? row.end_at ?? startIso;
  const startKey = dateKeyFromIso(startIso, input.timeZone);
  const keys = enrollmentDateKeys(startKey, ch.duration_days);
  const sets = {
    secured: new Set(input.securedDateKeys),
    frozen: new Set(input.frozenDateKeys ?? []),
    lastStand: new Set(input.lastStandDateKeys ?? []),
    camera: new Set(input.cameraDateKeys ?? []),
  };
  const days = keys.map((k) => dayStateForKey(k, sets));
  const status = endedStatusOf(row.status);
  return {
    id: row.id,
    challengeId: row.challenge_id,
    title: ch.title,
    duration_days: ch.duration_days,
    status,
    ended_on_day: row.current_day ?? keys.length,
    days,
    longest_streak: longestSecuredStreak(days),
    started_at: startIso,
    ended_at: endIso,
  };
}

export function shouldPresentEndScreen(pathname: string): boolean {
  if (pathname.includes("/onboarding")) return false;
  if (pathname.includes("/auth")) return false;
  if (pathname.includes("/create-profile")) return false;
  if (pathname.includes("/challenge/end")) return false;
  return true;
}

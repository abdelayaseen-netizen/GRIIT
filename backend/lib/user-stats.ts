/**
 * Build 92 chunk 06: one source for every number.
 *
 * Every user-facing count (Streak, Best, Days secured, Verified, Proofs) is computed here, once,
 * from the day records (`day_secures`, `freeze_uses`) and the completed check-ins. Routes attach the
 * result as `user_stats`; screens read the fields and compute nothing.
 *
 * Definitions (Part 2 README, "The numbers"):
 * - current_streak: secured days in the unbroken chain of secured-or-held days that ends today (once
 *   secured) or yesterday. If yesterday was neither secured nor held, 0.
 * - best_streak: the longest such chain's secured count, with the chain's first and last dates.
 * - secured_days: all secured days up to today.
 * - verified_days: secured days where every completed task had camera or Strava proof.
 * - proofs_count: completed tasks with proof (a photo or a Strava activity).
 * A held day keeps the chain and never adds to a count.
 */
import { addCalendarDaysToDateKey, inclusiveDayCount } from "./date-utils";
import { calendarDay, homeDayTotal } from "./calendar-day";
import { freezeHoldCap } from "./freeze-grant";

export type UserStatsCheckIn = {
  date_key: string;
  status?: string | null;
  task_id?: string | null;
  proof_source?: string | null;
  has_photo: boolean;
};

export type UserStatsInput = {
  todayKey: string;
  securedKeys: readonly string[];
  heldKeys: readonly string[];
  checkIns: readonly UserStatsCheckIn[];
};

export type UserStatsFields = {
  current_streak: number;
  best_streak: number;
  best_streak_start: string | null;
  best_streak_end: string | null;
  secured_days: number;
  verified_days: number;
  proofs_count: number;
  held_days: number;
  today_key: string;
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function cleanKeys(keys: readonly string[], todayKey: string): Set<string> {
  return new Set(keys.filter((k) => typeof k === "string" && DATE_KEY.test(k) && k <= todayKey));
}

/** Camera or Strava proof on one completed check-in. */
export function checkInHasProof(row: Pick<UserStatsCheckIn, "proof_source" | "has_photo">): boolean {
  if (row.has_photo) return true;
  const source = (row.proof_source ?? "").toLowerCase();
  return source === "strava" || source === "camera" || source === "photo";
}

type Chain = { start: string; end: string; secured: number };

/** Unbroken runs of secured-or-held days, oldest first. */
function chains(secured: Set<string>, held: Set<string>): Chain[] {
  const keys = [...new Set([...secured, ...held])].sort();
  const out: Chain[] = [];
  let current: Chain | null = null;
  for (const key of keys) {
    if (current && key === addCalendarDaysToDateKey(current.end, 1)) {
      current.end = key;
      if (secured.has(key)) current.secured += 1;
    } else {
      current = { start: key, end: key, secured: secured.has(key) ? 1 : 0 };
      out.push(current);
    }
  }
  return out;
}

export function computeUserStats(input: UserStatsInput): UserStatsFields {
  const todayKey = input.todayKey;
  const secured = cleanKeys(input.securedKeys, todayKey);
  const held = new Set([...cleanKeys(input.heldKeys, todayKey)].filter((k) => !secured.has(k)));
  const runs = chains(secured, held);

  const yesterdayKey = addCalendarDaysToDateKey(todayKey, -1);
  const live = runs.find((run) => run.end === todayKey || run.end === yesterdayKey) ?? null;
  const current_streak = live ? live.secured : 0;

  let best: Chain | null = null;
  for (const run of runs) {
    if (!best || run.secured > best.secured) best = run;
  }
  if (best && inclusiveDayCount(best.start, best.end) < best.secured) {
    throw new Error("Best streak dates do not cover the count.");
  }

  const completed = input.checkIns.filter(
    (row) => DATE_KEY.test(row.date_key) && row.date_key <= todayKey && (row.status ?? "completed") === "completed",
  );
  const byDay = new Map<string, UserStatsCheckIn[]>();
  for (const row of completed) {
    const list = byDay.get(row.date_key) ?? [];
    list.push(row);
    byDay.set(row.date_key, list);
  }
  let verified_days = 0;
  for (const key of secured) {
    const rows = byDay.get(key) ?? [];
    if (rows.length > 0 && rows.every(checkInHasProof)) verified_days += 1;
  }
  const proofs_count = completed.filter(checkInHasProof).length;

  return {
    current_streak,
    best_streak: best?.secured ?? 0,
    best_streak_start: best && best.secured > 0 ? best.start : null,
    best_streak_end: best && best.secured > 0 ? best.end : null,
    secured_days: secured.size,
    verified_days,
    proofs_count,
    held_days: held.size,
    today_key: todayKey,
  };
}

/** Freezes in hand: what was earned, capped at 2 (4 with GRIIT Pro). Never refilled by the calendar. */
export function freezesHeld(stored: number | null | undefined, isPro: boolean): number {
  const cap = freezeHoldCap(isPro);
  const value = typeof stored === "number" && Number.isFinite(stored) ? Math.floor(stored) : 0;
  return Math.min(cap, Math.max(0, value));
}

export type ProgressDayState = "before_join" | "secured" | "held" | "missed" | "today" | "future";

export type EnrollmentProgress = {
  day_number: number;
  total_days: number;
  days_secured: number;
  elapsed_days: number;
  days: { date_key: string; state: ProgressDayState }[];
};

/**
 * Per-challenge numbers from the same day records as the dots. "Day {n} of {N}" and
 * "{n} days secured" (held days hold the streak but don't add to secured). A left or finished
 * enrollment stops at the day it ended.
 */
export function enrollmentProgress(input: {
  startDateKey: string;
  durationDays?: number | null;
  todayKey: string;
  endedDateKey?: string | null;
  securedKeys: readonly string[];
  heldKeys: readonly string[];
}): EnrollmentProgress {
  const total = homeDayTotal(input.durationDays ?? null) ?? 1;
  const todayKey = input.todayKey;
  const secured = cleanKeys(input.securedKeys, todayKey);
  const held = cleanKeys(input.heldKeys, todayKey);
  const start = DATE_KEY.test(input.startDateKey) ? input.startDateKey : todayKey;
  const plannedLast = addCalendarDaysToDateKey(start, Math.max(0, total - 1));
  const ended = input.endedDateKey && DATE_KEY.test(input.endedDateKey) ? input.endedDateKey : null;
  const last = ended && ended < plannedLast ? ended : plannedLast;
  const through = last < todayKey ? last : todayKey;
  const days: EnrollmentProgress["days"] = [];
  let days_secured = 0;
  let elapsed_days = 0;
  if (start <= through) {
    let cursor = start;
    for (let guard = 0; guard < total + 2 && cursor <= through; guard += 1) {
      let state: ProgressDayState;
      if (secured.has(cursor)) state = "secured";
      else if (held.has(cursor)) state = "held";
      else if (cursor === todayKey) state = "today";
      else state = "missed";
      days.push({ date_key: cursor, state });
      if (cursor < todayKey || state === "secured") {
        elapsed_days += 1;
        if (state === "secured") days_secured += 1;
      }
      if (cursor === through) break;
      cursor = addCalendarDaysToDateKey(cursor, 1);
    }
  }
  if (!ended) {
    let cursor = addCalendarDaysToDateKey(through, 1);
    while (cursor <= plannedLast && days.length < total) {
      days.push({ date_key: cursor, state: "future" });
      cursor = addCalendarDaysToDateKey(cursor, 1);
    }
  }
  const dayNumber = start > todayKey ? 0 : Math.min(total, calendarDay(start, through, total));
  return { day_number: dayNumber, total_days: total, days_secured, elapsed_days, days };
}

/**
 * Frame 160 — the only per-day reminder pair.
 * Max two identifiers per calendar day. Empty when that day is secured.
 */

import { countNoun } from "@/lib/onboarding-v2-suggest";

export const G2A_PUSH_A = "g2a-day-a";
export const G2A_PUSH_B = "g2a-day-b";
export const G2A_NEXT_A = "g2a-next-a";
export const G2A_NEXT_B = "g2a-next-b";
export const G2A_TODAY_IDS = [G2A_PUSH_A, G2A_PUSH_B] as const;
export const G2A_TOMORROW_IDS = [G2A_NEXT_A, G2A_NEXT_B] as const;

export type G2aPushCandidate = {
  at: Date;
  title: string;
  body: string;
};

export type G2aTimedTask = {
  name: string;
  closeHHMM?: string | null;
};

export type G2aCloseSource = {
  gateTime?: { mode?: string | null; start?: string | null; end?: string | null } | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
  anchorTimeLocal?: string | null;
  anchor_time_local?: string | null;
  config?: { anchorTimeLocal?: unknown } | null;
  windowStartOffsetMin?: number | null;
  window_start_offset_min?: number | null;
};

function firstHHMM(...values: Array<string | null | undefined>): string | null {
  for (const raw of values) {
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

/**
 * Close time for By and Between. `anchorTimeLocal` is the close in both modes;
 * `windowStartOffsetMin` is minutes from that close to the open (usually ≤ 0).
 */
export function taskCloseHHMM(task: G2aCloseSource): string | null {
  const mode = (task.gateTime?.mode ?? task.gate_time_mode ?? "").trim();
  const anchor = firstHHMM(
    task.anchorTimeLocal,
    task.anchor_time_local,
    typeof task.config?.anchorTimeLocal === "string" ? task.config.anchorTimeLocal : null,
  );
  if (mode === "by") {
    return firstHHMM(task.gateTime?.start, task.gate_time_start, task.gateTime?.end, task.gate_time_end, anchor);
  }
  if (mode === "between") {
    return firstHHMM(task.gateTime?.end, task.gate_time_end, anchor);
  }
  return anchor;
}

/** Open clock from close + windowStartOffsetMin. */
export function taskOpenHHMM(closeHHMM: string, windowStartOffsetMin: number | null | undefined): string | null {
  const at = hmOnDay(new Date(2026, 0, 1), closeHHMM);
  if (!at) return null;
  at.setMinutes(at.getMinutes() + (windowStartOffsetMin ?? 0));
  const h = String(at.getHours()).padStart(2, "0");
  const m = String(at.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function calendarDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addLocalDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function hmOnDay(day: Date, hhmm: string): Date | null {
  const parts = hhmm.split(":");
  const hRaw = Number(parts[0]);
  const mRaw = Number(parts[1]);
  if (!Number.isFinite(hRaw) || !Number.isFinite(mRaw)) return null;
  const at = new Date(day);
  at.setHours(hRaw, mRaw, 0, 0);
  return at;
}

export function earliestWindowClose(
  tasks: readonly G2aTimedTask[],
  day: Date,
  now: Date,
): { at: Date; name: string; hhmm: string } | null {
  let best: { at: Date; name: string; hhmm: string } | null = null;
  for (const t of tasks) {
    const hhmm = t.closeHHMM?.trim();
    if (!hhmm) continue;
    const at = hmOnDay(day, hhmm);
    if (!at || at.getTime() <= now.getTime()) continue;
    if (!best || at.getTime() < best.at.getTime()) {
      best = { at, name: t.name.trim() || "task", hhmm };
    }
  }
  return best;
}

export function g2aPushCandidates(args: {
  now: Date;
  day?: Date;
  securedToday: boolean;
  morningHour?: number;
  eveningTime?: string;
  windowCloseAt?: Date | null;
  challengeLine: string;
  windowBody?: string | null;
  eveningBody: string;
  morningBody: string;
}): G2aPushCandidate[] {
  if (args.securedToday) return [];
  const day = args.day ?? args.now;
  const evening = parseHm(args.eveningTime ?? "20:00");
  const morningHour = args.morningHour ?? 7;
  const list: G2aPushCandidate[] = [];
  if (args.windowCloseAt) {
    const at = new Date(args.windowCloseAt.getTime() - 45 * 60 * 1000);
    if (at.getTime() > args.now.getTime() && args.windowBody) {
      list.push({ at, title: args.challengeLine, body: args.windowBody });
    }
  }
  const eveningAt = onDay(day, evening.h, evening.m);
  if (eveningAt.getTime() > args.now.getTime()) {
    list.push({ at: eveningAt, title: args.challengeLine, body: args.eveningBody });
  }
  const morningAt = onDay(day, morningHour, 0);
  if (morningAt.getTime() > args.now.getTime()) {
    list.push({ at: morningAt, title: args.challengeLine, body: args.morningBody });
  }
  list.sort((a, b) => a.at.getTime() - b.at.getTime());
  return list.slice(0, 2);
}

/** Today's remaining G2a pair for a user with timed tasks. Never more than two. */
export function planG2aDay(args: {
  now: Date;
  securedToday: boolean;
  tasks: readonly G2aTimedTask[];
  challengeLine: string;
  windowBody: (close: { name: string; hhmm: string; at: Date }) => string;
  eveningBody: string;
  morningBody: string;
}): G2aPushCandidate[] {
  const close = earliestWindowClose(args.tasks, args.now, args.now);
  return g2aPushCandidates({
    now: args.now,
    day: args.now,
    securedToday: args.securedToday,
    windowCloseAt: close?.at ?? null,
    windowBody: close ? args.windowBody(close) : null,
    challengeLine: args.challengeLine,
    eveningBody: args.eveningBody,
    morningBody: args.morningBody,
  });
}

export type G2aDayCopy = {
  challengeLine: string;
  windowBody: (close: { name: string; hhmm: string; at: Date }) => string;
  eveningBody: string;
  morningBody: string;
};

/** Today’s remaining pair plus tomorrow’s two. Tomorrow is always unsecured. */
export function planG2aAhead(args: {
  now: Date;
  securedToday: boolean;
  tasks: readonly G2aTimedTask[];
  today: G2aDayCopy;
  tomorrow: G2aDayCopy;
}): { today: G2aPushCandidate[]; tomorrow: G2aPushCandidate[] } {
  const today = planG2aDay({
    now: args.now,
    securedToday: args.securedToday,
    tasks: args.tasks,
    ...args.today,
  });
  const tomorrowDay = addLocalDays(args.now, 1);
  const close = earliestWindowClose(args.tasks, tomorrowDay, args.now);
  const tomorrow = g2aPushCandidates({
    now: args.now,
    day: tomorrowDay,
    securedToday: false,
    windowCloseAt: close?.at ?? null,
    windowBody: close ? args.tomorrow.windowBody(close) : null,
    challengeLine: args.tomorrow.challengeLine,
    eveningBody: args.tomorrow.eveningBody,
    morningBody: args.tomorrow.morningBody,
  });
  return { today, tomorrow };
}

export function countByCalendarDay(items: readonly { at: Date }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = calendarDateKey(item.at);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export const LAPSED_OFFSETS = [3, 7, 14] as const;

export function lapsedOffsetDateKeys(now: Date, offsets: readonly number[] = LAPSED_OFFSETS): string[] {
  return offsets.map((n) => calendarDateKey(addLocalDays(now, n)));
}

/** Keep lapsed offsets that do not land on a day that already has a G2a reminder. */
export function lapsedOffsetsAvoidingG2a(
  now: Date,
  g2aDateKeys: readonly string[],
  offsets: readonly number[] = LAPSED_OFFSETS,
): number[] {
  const blocked = new Set(g2aDateKeys);
  return offsets.filter((n) => !blocked.has(calendarDateKey(addLocalDays(now, n))));
}

function parseHm(hhmm: string): { h: number; m: number } {
  const parts = hhmm.split(":");
  const hRaw = Number(parts[0]);
  const mRaw = Number(parts[1]);
  return {
    h: Number.isFinite(hRaw) ? hRaw : 20,
    m: Number.isFinite(mRaw) ? mRaw : 0,
  };
}

function onDay(now: Date, h: number, m: number): Date {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

export function streakClause(streak: number): string {
  if (streak <= 0) return "";
  return ` Your streak is ${countNoun(streak, "day", "days")}.`;
}

export function g2aWindowBody(
  taskName: string,
  closeLabel: string,
  streak: number,
  opts?: { includeStreak?: boolean },
): string {
  const clause = opts?.includeStreak === false ? "" : streakClause(streak);
  return `${taskName.trim() || "task"} window closes at ${closeLabel}.${clause}`;
}

export function g2aEveningBody(
  remaining: number,
  streak: number,
  opts?: { includeStreak?: boolean },
): string {
  const clause = opts?.includeStreak === false ? "" : streakClause(streak);
  return `${countNoun(Math.max(0, Math.floor(remaining)), "task", "tasks")} left today.${clause}`;
}

export function g2aChallengeLine(title: string, day: number, durationDays: number): string {
  return `${title.trim() || "GRIIT"} · Day ${Math.max(1, Math.floor(day))} of ${Math.max(1, Math.floor(durationDays))}`;
}

export function g2aMorningBody(args: {
  streak: number;
  taskName: string;
  day: number;
  forTomorrow?: boolean;
}): string {
  const task = args.taskName.trim() || "task";
  if (args.forTomorrow) return `Finish ${task} to secure today.`;
  const day = Math.max(1, Math.floor(args.day));
  if (args.streak <= 0) {
    return `Day ${day} is today. Finish ${task} to secure it.`;
  }
  return `Secure today and it's ${args.streak + 1}.`;
}

/**
 * v44 frames 166 + 170 — challenge detail order and the streak-chip sheet.
 */
import { formatOfDays } from "@/lib/format-days";
import { MODE_HARD_TITLE, MODE_STANDARD_TITLE } from "@/lib/create-mode-copy";

export function detailMetaLine(args: {
  day: number;
  total: number;
  group: boolean;
  hard: boolean;
}): string {
  const who = args.group ? "Group" : "Solo";
  const mode = args.hard ? MODE_HARD_TITLE : MODE_STANDARD_TITLE;
  return `Day ${Math.max(0, Math.floor(args.day))} of ${Math.max(1, Math.floor(args.total))} · ${who} · ${mode}`;
}

export const NO_SHARED_PROOFS_IN_CHALLENGE = "No shared proofs in this challenge yet.";
export const FULL_RECORD = "Full record";
export const BOARD_LINK = "Board";
export const INVITE_TO = (name: string) => `Invite to ${name.trim() || "this challenge"}`;
export const INVITE_MEMBERS = (n: number) =>
  `${Math.max(0, Math.floor(n))} of 10. They start at Day 1.`;
export const COPY_LINK = "Copy link";
export const PEOPLE_SOLO = "Just you so far · 1 of 10";

export function recordOfDue(secured: number, due: number): string {
  return `${formatOfDays(Math.max(0, Math.floor(secured)), Math.max(0, Math.floor(due)))} secured`;
}

export function streakSheetMissBody(args: {
  done: number;
  total: number;
  missed: string;
  weekday: string;
  streak: number;
}): string {
  const next = Math.max(0, Math.floor(args.streak)) + 1;
  const missed = args.missed.trim() || "A task was missed";
  return `${args.done} of ${args.total} tasks. ${missed}. A freeze counts ${args.weekday} as held, so your streak stays at ${args.streak} and today makes it ${next}.`;
}

export function streakSheetFreezeLeft(n: number, refill: string): string {
  const count = Math.max(0, Math.floor(n));
  const noun = count === 1 ? "freeze" : "freezes";
  return `${count} ${noun} left. Next one on ${refill}. Available until midnight tonight.`;
}

export function useFreezeForWeekday(weekday: string): string {
  return `Use a freeze for ${weekday.trim() || "yesterday"}`;
}

export function weekdayHeldTitle(weekday: string): string {
  return `${weekday.trim() || "Yesterday"} is held.`;
}

export function weekdayHeldBody(streak: number, freezesLeft: number, refill: string): string {
  const n = Math.max(0, Math.floor(streak));
  const m = Math.max(0, Math.floor(freezesLeft));
  return `Your streak is ${n} days. Secure today and it's ${n + 1}. ${m} freezes left until ${refill}.`;
}

export const KEPT_PROOFS_BODY = "Kept proofs show only to you, with a lock.";
export const NOT_NOW = "Not now";
export const HELD_DONE = "Done";

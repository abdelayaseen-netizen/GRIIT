/**
 * Time-gate picker helpers. Store HH:MM 24h; display 12-hour with am/pm.
 */

import { format12h, formatWindowRange } from "@/lib/task-ui";

export const DEFAULT_BY_HHMM = "07:00";
export const DEFAULT_BETWEEN_START_HHMM = "05:00";
export const DEFAULT_BETWEEN_END_HHMM = "06:30";

export const BETWEEN_END_BEFORE_START = "End must be after start.";

const HHMM = /^(\d{1,2}):(\d{2})$/;

export function parseHhmm(value: string | null | undefined): { h: number; m: number } | null {
  if (typeof value !== "string") return null;
  const match = HHMM.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

export function minutesFromMidnight(value: string | null | undefined): number | null {
  const parsed = parseHhmm(value);
  if (!parsed) return null;
  return parsed.h * 60 + parsed.m;
}

export function formatHhmm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToDate(hhmm: string): Date {
  const parsed = parseHhmm(hhmm) ?? { h: 7, m: 0 };
  const d = new Date(2000, 0, 1, parsed.h, parsed.m, 0, 0);
  return d;
}

export function dateToHhmm(d: Date): string {
  return formatHhmm(d.getHours(), d.getMinutes());
}

export function betweenEndAfterStart(start: string, end: string): boolean {
  const a = minutesFromMidnight(start);
  const b = minutesFromMidnight(end);
  if (a == null || b == null) return false;
  return b > a;
}

export function formatByDisplay(hhmm: string): string {
  return format12h(hhmm);
}

export function formatBetweenDisplay(start: string, end: string): string {
  return formatWindowRange({ mode: "between", start, end });
}

export { format12h, formatWindowRange };

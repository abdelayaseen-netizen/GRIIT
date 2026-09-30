/**
 * Time-gate picker (115). Store HH:MM 24h; display 12-hour with am/pm.
 */

export const DEFAULT_BY_HHMM = "07:00";
export const DEFAULT_BETWEEN_START_HHMM = "05:00";
export const DEFAULT_BETWEEN_END_HHMM = "06:30";

export const TIME_WINDOW_NOT_SET = "Camera · Time window not set";
export const PICKER_LIVE_CAPTION =
  "The row above updates as you scroll.";

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
  return new Date(2000, 0, 1, parsed.h, parsed.m, 0, 0);
}

export function dateToHhmm(d: Date): string {
  return formatHhmm(d.getHours(), d.getMinutes());
}

/** "07:00" → "7:00 am", "18:30" → "6:30 pm". */
export function fmt12(hhmm: string): string {
  const parsed = parseHhmm(hhmm);
  if (!parsed) return "";
  const ap = parsed.h < 12 ? "am" : "pm";
  const hh = parsed.h % 12 === 0 ? 12 : parsed.h % 12;
  return `${hh}:${String(parsed.m).padStart(2, "0")} ${ap}`;
}

/** "5:00–6:30 am" when both share am/pm, else "11:00 am–1:00 pm". */
export function fmtWindow(a: string, b: string): string {
  const A = fmt12(a);
  const B = fmt12(b);
  if (!A || !B) return "";
  return A.slice(-2) === B.slice(-2) ? `${A.slice(0, -3)}–${B}` : `${A}–${B}`;
}

export function betweenEndAfterStart(start: string, end: string): boolean {
  const a = minutesFromMidnight(start);
  const b = minutesFromMidnight(end);
  if (a == null || b == null) return false;
  return b > a;
}

export function validate(start: string, end: string): string | null {
  if (betweenEndAfterStart(start, end)) return null;
  const shown = fmt12(start);
  return shown
    ? `End has to be after ${shown}. The window can't cross midnight.`
    : "End has to be after the start. The window can't cross midnight.";
}

export function byHelper(hhmm: string): string {
  return `Counts from midnight until ${fmt12(hhmm)}, your time.`;
}

export function betweenHelper(start: string, end: string): string {
  const d = (minutesFromMidnight(end) ?? 0) - (minutesFromMidnight(start) ?? 0);
  const h = Math.floor(Math.max(0, d) / 60);
  const m = Math.max(0, d) % 60;
  const parts = [
    h ? `${h} ${h === 1 ? "hour" : "hours"}` : "",
    m ? `${m} ${m === 1 ? "minute" : "minutes"}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `Today, ${fmt12(start)} to ${fmt12(end)}, your time.${parts ? ` ${parts}.` : ""}`;
}

export function pickerWindowCaption(a: string, b: string): string {
  return `Window: ${fmtWindow(a, b)}. ${PICKER_LIVE_CAPTION}`;
}

export const ADD_TASK_PLACE_LIVE = "Place · Only counts at this place.";

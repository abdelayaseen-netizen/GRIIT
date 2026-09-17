/**
 * Time gate: by = 00:00–start inclusive; between = start–end inclusive.
 * Timezone is the member's profile TZ (getProfileTimeZoneForUser) — same
 * source day-key logic already uses — never schedule_timezone.
 */
import { TRPCError } from "@trpc/server";
import { gatesFor, type TaskModelRow } from "./task-model";

export type WindowState = "open" | "closing" | "closed" | null;

const CLOSING_MINUTES = 15;

function parseHHMM(value: string | null | undefined): number | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function currentMinutesInTimeZone(now: Date, timeZone: string): number {
  const tz = timeZone.trim() || "UTC";
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).formatToParts(now);
  let h = parts.find((p) => p.type === "hour")?.value ?? "00";
  if (h === "24") h = "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function windowBounds(row: TaskModelRow): { start: number; end: number } | null {
  const mode =
    typeof row.gate_time_mode === "string" ? row.gate_time_mode.trim() : "";
  if (mode === "by") {
    const end = parseHHMM(row.gate_time_start);
    if (end == null) return null;
    return { start: 0, end };
  }
  if (mode === "between") {
    const start = parseHHMM(row.gate_time_start);
    const end = parseHHMM(row.gate_time_end);
    if (start == null || end == null) return null;
    return { start, end };
  }
  return null;
}

export function windowStateFor(
  row: TaskModelRow,
  timeZone: string,
  now: Date = new Date()
): WindowState {
  if (!gatesFor(row).includes("time")) return null;
  const bounds = windowBounds(row);
  if (!bounds) return null;
  const current = currentMinutesInTimeZone(now, timeZone);
  const inWindow = current >= bounds.start && current <= bounds.end;
  if (!inWindow) return "closed";
  const remaining = bounds.end - current;
  if (remaining < CLOSING_MINUTES) return "closing";
  return "open";
}

export function withWindowState<T extends TaskModelRow>(
  row: T,
  timeZone: string,
  now: Date = new Date()
): T & { windowState: WindowState; minutesLeft: number | null } {
  const windowState = windowStateFor(row, timeZone, now);
  return {
    ...row,
    windowState,
    minutesLeft: windowState === "closing" ? minutesLeftFor(row, timeZone, now) : null,
  };
}

/** Minutes remaining in the window. Null when there is no open window. */
export function minutesLeftFor(
  row: TaskModelRow,
  timeZone: string,
  now: Date = new Date()
): number | null {
  if (!gatesFor(row).includes("time")) return null;
  const bounds = windowBounds(row);
  if (!bounds) return null;
  const current = currentMinutesInTimeZone(now, timeZone);
  const remaining = bounds.end - current;
  if (remaining < 0) return null;
  return remaining;
}

/** Reject a check-in outside the window. Server-side, before any write. */
export function assertTimeGate(
  row: TaskModelRow,
  timeZone: string,
  now: Date = new Date()
): void {
  if (windowStateFor(row, timeZone, now) === "closed") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Window closed." });
  }
}

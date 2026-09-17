/**
 * Task model display — frames 42–45. Formats backend gates + gateTime.
 * No timezone math. No type mapping beyond this file.
 */

import type { GateTime, TaskGate, TaskModelType } from "@/backend/lib/task-model";

export type { GateTime, TaskGate, TaskModelType };

export const SELF_REPORTED = "Self-reported";

export const TYPE_CAPTION: Record<TaskModelType, string> = {
  check_off: "Tap it when it is done.",
  timer: "Runs in the app. It has to reach the time.",
  counter: "Hit a number each day.",
  text: "Write a number of words. Counted, not read.",
  run: "Distance and time come from GPS.",
};

const GATE_CAMERA = "Camera";
const GATE_LOCATION = "Location";

function parseHHMM(value: string | null | undefined): { h: number; m: number } | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function meridiem(h: number): "am" | "pm" {
  return h < 12 ? "am" : "pm";
}

function clock12(h: number, m: number): string {
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")}`;
}

/** 12h with am/pm. "7:00 am", "9:30 am", "12:00 pm". */
export function format12h(hhmm: string | null | undefined): string {
  const parsed = parseHHMM(hhmm);
  if (!parsed) return "";
  return `${clock12(parsed.h, parsed.m)} ${meridiem(parsed.h)}`;
}

export function formatGateTime(gateTime: GateTime | null | undefined): string {
  if (!gateTime?.mode) return "";
  if (gateTime.mode === "by") {
    const t = format12h(gateTime.start);
    return t ? `By ${t}` : "";
  }
  const start = parseHHMM(gateTime.start);
  const end = parseHHMM(gateTime.end);
  if (!start || !end) return "";
  const endLabel = format12h(gateTime.end);
  if (meridiem(start.h) === meridiem(end.h)) {
    return `Between ${clock12(start.h, start.m)} and ${endLabel}`;
  }
  return `Between ${format12h(gateTime.start)} and ${endLabel}`;
}

/** Compact {from}–{to} for closed windows: "6:00–9:00 am". */
export function formatWindowRange(gateTime: GateTime | null | undefined): string {
  if (!gateTime?.mode) return "";
  if (gateTime.mode === "by") {
    const end = parseHHMM(gateTime.start);
    if (!end) return "";
    return `${clock12(0, 0)}–${format12h(gateTime.start)}`;
  }
  const start = parseHHMM(gateTime.start);
  const end = parseHHMM(gateTime.end);
  if (!start || !end) return "";
  if (meridiem(start.h) === meridiem(end.h)) {
    return `${clock12(start.h, start.m)}–${format12h(gateTime.end)}`;
  }
  return `${format12h(gateTime.start)}–${format12h(gateTime.end)}`;
}

export function closedWindowCaption(gateTime: GateTime | null | undefined): string {
  const range = formatWindowRange(gateTime);
  return range ? `Window closed · ${range}` : "Window closed";
}

/**
 * Camera · time · location. Empty gates → "Self-reported".
 */
export function gateLine(
  gates: readonly TaskGate[] | null | undefined,
  gateTime?: GateTime | null,
): string {
  if (!gates || gates.length === 0) return SELF_REPORTED;
  const parts: string[] = [];
  if (gates.includes("camera")) parts.push(GATE_CAMERA);
  if (gates.includes("time")) {
    const time = formatGateTime(gateTime);
    if (time) parts.push(time);
  }
  if (gates.includes("location")) parts.push(GATE_LOCATION);
  return parts.length > 0 ? parts.join(" · ") : SELF_REPORTED;
}

export function typeCaption(type: TaskModelType | string): string {
  if (type === "check_off" || type === "timer" || type === "counter" || type === "text" || type === "run") {
    return TYPE_CAPTION[type];
  }
  return TYPE_CAPTION.check_off;
}

export function minutesLeftCaption(minutes: number): string {
  return `${minutes} minutes left in the window.`;
}

export function windowClosedAtLine(time: string): string {
  return `Window closed at ${time}. Today is not secured.`;
}

export const WINDOW_CLOSED_TOMORROW =
  "The window is set by the challenge. Tomorrow opens at midnight.";

export const WINDOW_CLOSED_FORBIDDEN = "Window closed.";

export function closedWindowTime(gateTime: GateTime | null | undefined): string {
  if (gateTime?.mode === "between") return format12h(gateTime.end);
  return format12h(gateTime?.start);
}

export function flowHeaderTitle(
  day: number,
  gateTime: GateTime | null | undefined,
  fallback: string,
): string {
  const time = formatGateTime(gateTime);
  if (time) return `Day ${day} · ${time}`;
  return `Day ${day} · ${fallback}`;
}

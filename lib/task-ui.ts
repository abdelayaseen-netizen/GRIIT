/**
 * Task model display — frames 42–45. Formats backend gates + gateTime.
 * No timezone math. No type mapping beyond this file.
 */

import type { GateTime, TaskGate, TaskModelType } from "@/backend/lib/task-model";

export type { GateTime, TaskGate, TaskModelType };

export const SELF_REPORTED = "Self-reported";

export const TYPE_CAPTION: Record<TaskModelType, string> = {
  check_off: "Tap when it is done.",
  timer: "Run a timer in the app.",
  counter: "Hit a number, like 8 glasses.",
  text: "Write a set number of words.",
  run: "Log distance and time.",
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

export function taskQuantityLine(task: {
  type?: string;
  targetValue?: number;
  unit?: string;
  durationMinutes?: number;
  minWords?: number;
  config?: Record<string, unknown>;
}): string {
  const cfg = task.config ?? {};
  const type = task.type;
  if (type === "counter") {
    const n =
      task.targetValue ?? (typeof cfg.targetValue === "number" ? cfg.targetValue : undefined);
    const unit = (task.unit ?? (typeof cfg.unit === "string" ? cfg.unit : "")).trim();
    if (n != null && n > 0) return unit ? `${n} ${unit}` : String(n);
  }
  if (type === "timer") {
    const n =
      task.durationMinutes ??
      (typeof cfg.durationMinutes === "number" ? cfg.durationMinutes : undefined);
    if (n != null && n > 0) return `${n} min`;
  }
  if (type === "text") {
    const n = task.minWords ?? (typeof cfg.minWords === "number" ? cfg.minWords : undefined);
    if (n != null && n > 0) return `${n} words`;
  }
  if (type === "run") {
    const n =
      typeof cfg.distance === "number"
        ? cfg.distance
        : task.targetValue;
    const unit = (task.unit ?? (typeof cfg.unit === "string" ? cfg.unit : "km")).trim() || "km";
    if (n != null && n > 0) return `${n} ${unit}`;
  }
  return "";
}

function photoPreviewPart(task: {
  gates?: readonly TaskGate[] | null;
  requirePhoto?: boolean;
  photoMode?: string;
  config?: Record<string, unknown>;
}): string {
  const raw = String(task.photoMode ?? task.config?.photo_mode ?? "").toLowerCase();
  if (raw === "optional") return "Photo optional";
  if (raw === "none") return SELF_REPORTED;
  if (raw === "required" || task.requirePhoto || task.gates?.includes("camera")) return GATE_CAMERA;
  return SELF_REPORTED;
}

function placePreviewPart(task: {
  gates?: readonly TaskGate[] | null;
  locationName?: string;
  config?: Record<string, unknown>;
}): string {
  if (!task.gates?.includes("location")) return "";
  const name = (
    task.locationName ??
    (typeof task.config?.location_name === "string" ? task.config.location_name : "")
  ).trim();
  return name || "Place";
}

/** Wizard / pack rows: quantity · photo · time · place name. */
export function wizardGateLine(task: {
  type?: string;
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
  requirePhoto?: boolean;
  photoMode?: string;
  targetValue?: number;
  unit?: string;
  durationMinutes?: number;
  minWords?: number;
  locationName?: string;
  config?: Record<string, unknown>;
}): string {
  const parts: string[] = [];
  const qty = taskQuantityLine(task);
  if (qty) parts.push(qty);
  parts.push(photoPreviewPart(task));
  if (task.gates?.includes("time")) {
    const time = formatGateTime(task.gateTime);
    if (time) parts.push(time);
  }
  const place = placePreviewPart(task);
  if (place) parts.push(place);
  return parts.join(" · ");
}

const COUNTER_TYPES = new Set(["counter", "water", "reading", "count"]);

/** Home gate line for a counter that also requires a photo. */
export function counterCameraGateLine(
  type: string | null | undefined,
  gates: readonly TaskGate[] | null | undefined,
): string | null {
  if (!type || !COUNTER_TYPES.has(type)) return null;
  if (!gates?.includes("camera")) return null;
  return "Counter · Camera";
}

/** Home / detail compact proof line: camera · time · location. */
export function gateLabel(task: {
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
  requirePhoto?: boolean;
}): string {
  if (task.gates && task.gates.length > 0) return gateLine(task.gates, task.gateTime);
  if (task.requirePhoto) return gateLine(["camera"], task.gateTime);
  return gateLine(task.gates ?? [], task.gateTime);
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
  if (gateTime?.mode === "by") return format12h(gateTime.start) || format12h(gateTime?.end);
  return format12h(gateTime?.start) || format12h(gateTime?.end);
}

export function flowHeaderTitle(
  challenge: string,
  day: number,
  durationDays: number,
): string {
  const name = challenge.trim() || "Challenge";
  const n = Math.max(1, Math.floor(day));
  const total = Math.max(n, Math.floor(durationDays) || n);
  return `${name} · Day ${n} of ${total}`;
}

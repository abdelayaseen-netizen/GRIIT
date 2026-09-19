/**
 * Counter, Timer and Run — frame 49 copy and chrome.
 * No display face. Header names the gate when there is one.
 */
import type { TaskGate } from "@/backend/lib/task-model";
import type { DistanceUnit } from "@/lib/distance-unit";
import { SIMPLE_ASK_CAPTION } from "@/lib/simple-log";
import { fmtMmSs, type TaskFlowStep } from "@/lib/task-flow-state";

export const WORK_SECURED_CAPTION = SIMPLE_ASK_CAPTION;

export const COUNT_HONESTY = "Self-entered count. Nothing is checked.";
export const COUNT_ADD = "Add one";
export const COUNT_REMOVE = "Remove one";
export const COUNT_TYPE = "Type it";
export const COUNT_POST = "Post";

export const TIMER_HONESTY = "Runs on the clock. Lock the phone if you want.";
export const TIMER_MUST_ZERO = "It has to reach zero.";
export const TIMER_LEAVING = "Leaving the app does not stop it.";
export const TIMER_LABEL = "Timer";
export const TIMER_SOUND = "Sound when it ends";
export const TIMER_POST_CAPTION = "Post opens when the timer reaches zero.";
export const TIMER_PHOTO_AFTER = "The photo comes after the timer";
export const TIMER_PAUSE = "Pause";
export const TIMER_RESET = "Reset";

export const RUN_HONESTY_TYPED =
  "You type the distance and time. The photo is what is checked.";
export const RUN_HONESTY_GPS = "Distance and time from GPS. The photo is still required.";
export const RUN_HONESTY_TYPED_NO_CAMERA =
  "You type the distance and time. Nothing is checked.";
export const RUN_HONESTY = RUN_HONESTY_GPS;
export const RUN_PHOTO_AFTER = "The photo comes after the numbers";
export const RUN_TAKE_PHOTO = "Take photo";
export const RUN_GPS_WAITING = "Waiting for GPS";
export const RUN_GPS_LOCKED = "GPS locked";
export const RUN_START = "Start";
export const RUN_STOP = "Stop";
export const RUN_POST = "Post";
export const WORKOUT_HONESTY =
  "Duration is self-entered unless the in-app timer ran. The photo is still required.";
export const WORKOUT_NEXT_PHOTO = "Next: photo proof";
export const WORKOUT_USE_TIMER = "Use the timer instead";

export const SESSION_HONESTY =
  "Stopping fills in the duration. The photo is still required.";

export const WORK_POST = "Post";

export function workTypeLabel(type: string): string {
  if (type === "counter" || type === "water" || type === "reading") return "Counter";
  if (type === "timer") return "Timer";
  if (type === "run") return "Run";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Gate outranks type. Camera outranks a time-window string. */
export function workStepHeader(day: number, gates: readonly TaskGate[], type: string): string {
  if (gates.includes("camera")) return `Day ${day} · Camera`;
  if (gates.includes("location")) return `Day ${day} · Location`;
  return `Day ${day} · ${workTypeLabel(type)}`;
}

export function workThenCamera(type: string, gates: readonly TaskGate[]): boolean {
  return (
    (type === "counter" ||
      type === "water" ||
      type === "reading" ||
      type === "timer" ||
      type === "run") &&
    gates.includes("camera")
  );
}

export function workStepOwnsChrome(step: TaskFlowStep, type: string): boolean {
  if (step === "count" || step === "running" || step === "session") return true;
  if (step === "entry" && type === "timer") return true;
  if (step === "log") return true;
  return false;
}

export function countOfLine(n: number, target: number, unit: string): { n: string; rest: string } {
  const u = unit.trim();
  return { n: String(n), rest: ` of ${target}${u ? ` ${u}` : ""}` };
}

export function countCtaLabel(n: number, target: number): string {
  if (n >= target) return COUNT_POST;
  return `Log ${n} of ${target}`;
}

export function countCtaEnabled(n: number, target: number): boolean {
  return n >= target;
}

export function timerStartLabel(requiredSeconds: number): string {
  return `Start ${fmtMmSs(requiredSeconds)}`;
}

export function timerEndsLabel(clock: string): string {
  return `Ends ${clock}`;
}

export function timerPostEnabled(remainingSeconds: number): boolean {
  return remainingSeconds <= 0;
}

export function workDoneLine(duration: string): string {
  return `${duration} done`;
}

/** Frame 61 — typed + camera / GPS / typed with no Camera gate. */
export function runHonestyLine(fromGps: boolean, hasCamera = true): string {
  if (fromGps) return RUN_HONESTY_GPS;
  if (!hasCamera) return RUN_HONESTY_TYPED_NO_CAMERA;
  return RUN_HONESTY_TYPED;
}

export function formatRunPace(durationSec: number, distance: number): string {
  const per = durationSec / distance;
  let m = Math.floor(per / 60);
  let s = Math.round(per % 60);
  if (s === 60) {
    m += 1;
    s = 0;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatShortDistance(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}

/** "{pace} per {unit}. Target met." / "{pace} per {unit}. {n} {unit} short." */
export function runPaceLine(
  distance: number | null,
  durationSec: number | null,
  unit: DistanceUnit,
  target: number | null,
): string | null {
  if (distance == null || durationSec == null || distance <= 0 || durationSec <= 0) return null;
  const head = `${formatRunPace(durationSec, distance)} per ${unit}.`;
  if (target != null) {
    const short = Math.round((target - distance) * 100) / 100;
    if (short > 0) return `${head} ${formatShortDistance(short)} ${unit} short.`;
  }
  return `${head} Target met.`;
}

export function runPrimaryLabel(hasCamera: boolean): string {
  return hasCamera ? RUN_TAKE_PHOTO : RUN_POST;
}

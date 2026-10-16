/**
 * TaskFlowV2 step machine. Pure — no I/O.
 * Characterises the branches in components/task-v2/TaskFlowV2.tsx.
 */

import { countJournalWords } from "@/backend/lib/journal-verification";
import type { TaskGate } from "@/backend/lib/task-model";
import type { DistanceUnit } from "@/lib/distance-unit";
import type { VerificationKind } from "@/lib/task-completion-result";

export type TaskFlowStep =
  | "entry"
  | "log"
  | "session"
  | "capture"
  | "review"
  | "running"
  | "write"
  | "count"
  | "ask"
  | "finish"
  | "confirmation"
  | "challenge_done"
  | "day_open"
  | "blocked"
  | "failed"
  | "window_closed";

export function chromeTitle(type: string, gates: readonly TaskGate[] = []): string {
  if (type === "counter" || type === "water" || type === "reading") return "Counter";
  if (type === "timer") return "Timer";
  if (type === "run") return "Run";
  if (type === "photo") return "Photo proof";
  if (gates.includes("camera")) return "Camera";
  if (gates.includes("location")) return "Location";
  if (type === "simple" || type === "manual" || type === "check_off") return "Self-report";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Home sends the normalized type `text`. Challenge detail still sends raw `journal`. */
function isWriteType(type: string): boolean {
  return type === "journal" || type === "text";
}

export function initialStep(type: string, gates: readonly TaskGate[] = []): TaskFlowStep {
  let step: TaskFlowStep;
  if (type === "photo") step = "capture";
  else if (type === "timer" || type === "checkin") step = "entry";
  else if (type === "run" || type === "workout") step = "log";
  else if (isWriteType(type)) step = "write";
  else if (type === "counter" || type === "water" || type === "reading") step = "count";
  else step = "ask";
  if (step === "ask" && gates.includes("camera")) return "capture";
  return step;
}

/** Camera gate on the backend's normalized `gates` array. Nothing else. */
export function flowOpensCamera(gates: readonly TaskGate[]): boolean {
  return gates.includes("camera");
}

export function fmtMmSs(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Remaining seconds from the exact end timestamp. Never exceeds duration. */
export function timerRemainingSec(input: {
  nowMs: number;
  requiredSeconds: number;
  startedAtIso: string | null;
  pausedRemaining?: number | null;
}): number {
  const cap = Math.max(0, input.requiredSeconds);
  if (input.pausedRemaining != null) {
    return Math.min(cap, Math.max(0, input.pausedRemaining));
  }
  if (!input.startedAtIso) return cap;
  const start = Date.parse(input.startedAtIso);
  if (!Number.isFinite(start)) return cap;
  const endMs = start + cap * 1000;
  return Math.min(cap, Math.max(0, (endMs - input.nowMs) / 1000));
}

export function clockLabel(isoOrMs: string | number): string {
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Same rule as the server: 2+ letters per word, the same word at most 3 times. */
export function wordCount(text: string): number {
  return countJournalWords(text);
}

export type LogKind = "run" | "workout";

const RUN_NAME_RE = /\b(run|jog|running|5k|10k|mile|miles|sprint)\b/i;
const WORKOUT_NAME_RE = /\b(workout|gym|lift|hiit|yoga|strength|exercise|training|calisthenics|swim|cycling|basketball)\b/i;

/**
 * Workouts are stored as DB `run` with `tracking_mode: "time"` (challenge-tasks.ts).
 * Distance targets are runs. Timed rows and rows with no mode fall back to the title.
 */
export function resolveLogKind(args: {
  taskType: string;
  taskName: string;
  trackingMode: string | null | undefined;
  unit: string | null | undefined;
  targetValue: number | null | undefined;
}): LogKind {
  if (args.taskType === "workout") return "workout";
  if (args.taskType !== "run") return "workout";
  const name = args.taskName ?? "";
  const looksRun = RUN_NAME_RE.test(name);
  const looksWorkout = WORKOUT_NAME_RE.test(name);
  if (args.trackingMode === "distance") return "run";
  if (typeof args.targetValue === "number" && args.targetValue > 0 && args.trackingMode !== "time") return "run";
  if (args.trackingMode === "time" || args.unit === "minutes") {
    return looksRun && !looksWorkout ? "run" : "workout";
  }
  if (looksWorkout && !looksRun) return "workout";
  return "run";
}

export const WORKOUT_TYPES = ["Strength", "Basketball", "Swim", "Cycling", "Yoga", "Sports", "Other"] as const;

/** Distance is optional for Cycling and Swim and absent for everything else. */
export function workoutDistanceField(kind: string): "optional" | "none" {
  return kind === "Cycling" || kind === "Swim" ? "optional" : "none";
}

export function workoutMinimumLine(minDurationMinutes: number): string | null {
  const n = Math.floor(minDurationMinutes);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n} min minimum`;
}

const MILES_PER_KM = 0.621371;
/** 4:30 per mile. */
export const RUN_PACE_FAST_SEC_PER_MI = 270;
/** 30:00 per mile. */
export const RUN_PACE_SLOW_SEC_PER_MI = 1800;
export const CYCLING_MAX_MPH = 35;

export const LOG_SANITY_TITLE = "That pace looks off.";
export const LOG_SANITY_MESSAGE = "Check your distance and time.";
export const LOG_SANITY_EDIT = "Edit";
export const LOG_SANITY_SAVE_ANYWAY = "Save anyway";

export type LogSanity = { ok: true } | { ok: false; title: string; message: string };

function toMiles(distance: number, unit: DistanceUnit): number {
  return unit === "km" ? distance * MILES_PER_KM : distance;
}

const LOOKS_OFF: LogSanity = { ok: false, title: LOG_SANITY_TITLE, message: LOG_SANITY_MESSAGE };

/** Faster than 4:30 per mile or slower than 30:00 per mile looks off. Missing numbers pass. */
export function runPaceCheck(distance: number | null, durationSec: number | null, unit: DistanceUnit): LogSanity {
  if (distance == null || durationSec == null || distance <= 0 || durationSec <= 0) return { ok: true };
  const secPerMile = durationSec / toMiles(distance, unit);
  if (secPerMile < RUN_PACE_FAST_SEC_PER_MI || secPerMile > RUN_PACE_SLOW_SEC_PER_MI) return LOOKS_OFF;
  return { ok: true };
}

/** Faster than 35 mph average looks off. Missing numbers pass. */
export function cyclingSpeedCheck(distance: number | null, durationSec: number | null, unit: DistanceUnit): LogSanity {
  if (distance == null || durationSec == null || distance <= 0 || durationSec <= 0) return { ok: true };
  const mph = toMiles(distance, unit) / (durationSec / 3600);
  if (mph > CYCLING_MAX_MPH) return LOOKS_OFF;
  return { ok: true };
}

/** Runs check pace; Cycling checks speed. Other workouts have nothing to check. */
export function logSanityCheck(args: {
  logKind: LogKind;
  kind: string;
  distance: number | null;
  durationSec: number | null;
  unit: DistanceUnit;
}): LogSanity {
  if (args.logKind === "run") return runPaceCheck(args.distance, args.durationSec, args.unit);
  if (args.kind === "Cycling") return cyclingSpeedCheck(args.distance, args.durationSec, args.unit);
  return { ok: true };
}

export function isHonest(type: string, hasPhoto: boolean): boolean {
  if (type === "manual" || type === "simple" || type === "counter" || type === "water") return false;
  if (type === "reading") return hasPhoto;
  return true;
}

export function verificationKindFor(type: string, hasPhoto: boolean): VerificationKind {
  if (type === "photo" || (type === "reading" && hasPhoto) || type === "run" || type === "workout") return "live_photo";
  if (type === "timer") return "timer";
  if (type === "checkin") return "gps";
  if (isWriteType(type)) return "word_count";
  return "self_report";
}

export function chromeFlags(step: TaskFlowStep): { dark: boolean; hideChrome: boolean } {
  return {
    dark: step === "capture" || step === "review",
    hideChrome:
      step === "confirmation" ||
      step === "challenge_done" ||
      step === "day_open" ||
      step === "finish" ||
      step === "capture" ||
      step === "write" ||
      step === "window_closed",
  };
}

export function shouldBlockOnWindow(args: {
  windowStatus: string;
  taskType: string;
  step: TaskFlowStep;
}): boolean {
  return args.windowStatus === "out_of_window" && (args.taskType === "photo" || args.step === "capture");
}

export function checkinGpsNextStep(
  meters: number,
  radius: number,
  taskType: string,
): TaskFlowStep | null {
  if (meters > radius) return "blocked";
  if (taskType === "checkin") return "entry";
  return null;
}

export function timerResumeStep(_remainingSeconds: number): "running" {
  return "running";
}

export function timerShouldAutoSubmit(_step: TaskFlowStep, _remainingSeconds: number, _hasStart: boolean): boolean {
  return false;
}

export type GoBackDecision =
  | { action: "exit" }
  | { action: "stay" }
  | { action: "discard_ask" }
  | { action: "set_step"; step: TaskFlowStep; clearPhoto?: boolean };

export function resolveGoBack(args: {
  step: TaskFlowStep;
  caption: string;
  taskType: string;
  gates?: readonly TaskGate[];
}): GoBackDecision {
  if (args.step === "review") {
    if (args.caption.trim()) return { action: "discard_ask" };
    return {
      action: "set_step",
      step: args.taskType === "run" || args.taskType === "workout" ? "log" : "capture",
      clearPhoto: true,
    };
  }
  if (args.step === "running") return { action: "stay" };
  if (args.step === "session") return { action: "set_step", step: "log" };
  if (args.step === "capture") {
    if (args.taskType === "run" || args.taskType === "workout") return { action: "set_step", step: "log" };
    if (isWriteType(args.taskType)) return { action: "set_step", step: "write" };
    if (args.taskType === "counter" || args.taskType === "water" || args.taskType === "reading") {
      return { action: "set_step", step: "count" };
    }
    if (args.taskType === "checkin") return { action: "set_step", step: "entry" };
    if (args.taskType === "simple" || args.taskType === "manual" || args.taskType === "check_off") {
      if (args.gates?.includes("camera")) return { action: "exit" };
      return { action: "set_step", step: "ask" };
    }
  }
  return { action: "exit" };
}

export function resolveGoBackFromFailure(args: {
  requirePhoto: boolean;
  hasPhoto: boolean;
  taskType: string;
  gates?: readonly TaskGate[];
}): TaskFlowStep {
  if (args.requirePhoto && !args.hasPhoto) return "capture";
  if (args.hasPhoto) return "review";
  if (args.taskType === "timer" || args.taskType === "checkin") return "entry";
  if (isWriteType(args.taskType)) return "write";
  if (args.taskType === "counter" || args.taskType === "water" || args.taskType === "reading") return "count";
  if (args.taskType === "run" || args.taskType === "workout") return "log";
  return initialStep(args.taskType, args.gates);
}

export type RetryFailedDecision =
  | "submit_photo"
  | "start_timer"
  | "capture"
  | "submit_timer"
  | "submit_journal"
  | "submit_count"
  | "submit_checkin"
  | "log"
  | "submit_self";

export function resolveRetryFailedSubmit(args: {
  hasPhoto: boolean;
  taskType: string;
  requirePhoto: boolean;
  timerReadyToSubmit: boolean;
}): RetryFailedDecision {
  if (args.hasPhoto) return "submit_photo";
  if (args.taskType === "timer" && !args.timerReadyToSubmit) return "start_timer";
  if (args.requirePhoto) return "capture";
  if (args.taskType === "timer") return "submit_timer";
  if (isWriteType(args.taskType)) return "submit_journal";
  if (args.taskType === "counter" || args.taskType === "water" || args.taskType === "reading") {
    return "submit_count";
  }
  if (args.taskType === "checkin") return "submit_checkin";
  if (args.taskType === "run" || args.taskType === "workout") return "log";
  return "submit_self";
}

export function submitWithoutPhotoNext(requirePhoto: boolean): "capture" | "submit" {
  return requirePhoto ? "capture" : "submit";
}

export function discardPhotoStep(taskType: string): "log" | "capture" {
  return taskType === "run" || taskType === "workout" ? "log" : "capture";
}

export function verifyingLine(taskType: string): string {
  if (taskType === "timer") return "Recording the session…";
  if (taskType === "manual" || taskType === "simple" || taskType === "counter" || taskType === "water") {
    return "Saving…";
  }
  return "Posting your proof…";
}

export function journalReady(text: string, minWords: number): boolean {
  return wordCount(text) >= minWords;
}

export function countReady(count: number, counterGoal: number): boolean {
  return count >= counterGoal;
}

export function checkinReady(gpsMeters: number | null, radius: number): boolean {
  return gpsMeters != null && gpsMeters <= radius;
}

/** Run: distance and duration. Workout: an activity type and minutes at or above the floor. */
export function logReady(args: {
  taskType: string;
  distance: number | null;
  durationSec: number | null;
  workoutMin: number | null;
  minDurationMinutes: number;
  kind?: string;
}): boolean {
  if (args.taskType === "run") return args.distance != null && args.durationSec != null;
  if (!(args.kind ?? "").trim()) return false;
  return args.workoutMin != null && args.workoutMin >= args.minDurationMinutes;
}

export type FinishSubmitOutcome = "failed" | "day_open" | "secured_nav";

/** Branch on the server's secured_today after the check-in resolves. Never a client row count. */
export function finishSubmitOutcome(args: {
  complete: unknown | null | undefined;
  securedToday: boolean;
}): FinishSubmitOutcome {
  if (!args.complete) return "failed";
  if (args.securedToday) return "secured_nav";
  return "day_open";
}

export function blockedEyebrow(windowStatus: string): "NOT OPEN YET" | "OUT OF RANGE" {
  return windowStatus === "out_of_window" ? "NOT OPEN YET" : "OUT OF RANGE";
}

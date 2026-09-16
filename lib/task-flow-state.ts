/**
 * TaskFlowV2 step machine. Pure — no I/O.
 * Characterises the branches in components/task-v2/TaskFlowV2.tsx.
 */

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
  | "verifying"
  | "confirmation"
  | "challenge_done"
  | "blocked"
  | "failed";

export function chromeTitle(type: string): string {
  if (type === "photo") return "Photo proof";
  if (type === "water") return "Water";
  if (type === "reading") return "Pages";
  if (type === "simple" || type === "manual") return "Self-report";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function initialStep(type: string): TaskFlowStep {
  if (type === "photo") return "capture";
  if (type === "timer" || type === "checkin") return "entry";
  if (type === "run" || type === "workout") return "log";
  if (type === "journal") return "write";
  if (type === "counter" || type === "water" || type === "reading") return "count";
  return "ask";
}

/** Same camera predicate TaskFlowV2 uses: capture-first type or config.require_photo. */
export function flowOpensCamera(taskType: string, requirePhoto: boolean): boolean {
  const t = (taskType ?? "").trim().toLowerCase();
  return initialStep(t) === "capture" || requirePhoto === true;
}

export function fmtMmSs(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function clockLabel(isoOrMs: string | number): string {
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
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
  if (type === "journal") return "word_count";
  return "self_report";
}

export function chromeFlags(step: TaskFlowStep): { dark: boolean; hideChrome: boolean } {
  return {
    dark: step === "capture" || step === "review",
    hideChrome:
      step === "confirmation" ||
      step === "challenge_done" ||
      step === "verifying" ||
      step === "capture",
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

export function timerResumeStep(remainingSeconds: number): "verifying" | "running" {
  return remainingSeconds <= 0 ? "verifying" : "running";
}

export function timerShouldAutoSubmit(step: TaskFlowStep, remainingSeconds: number, hasStart: boolean): boolean {
  return step === "running" && hasStart && remainingSeconds <= 0;
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
    if (args.taskType === "journal") return { action: "set_step", step: "write" };
    if (args.taskType === "counter" || args.taskType === "water" || args.taskType === "reading") {
      return { action: "set_step", step: "count" };
    }
    if (args.taskType === "checkin") return { action: "set_step", step: "entry" };
    if (args.taskType === "simple" || args.taskType === "manual") return { action: "set_step", step: "ask" };
  }
  return { action: "exit" };
}

export function resolveGoBackFromFailure(args: {
  requirePhoto: boolean;
  hasPhoto: boolean;
  taskType: string;
}): TaskFlowStep {
  if (args.requirePhoto && !args.hasPhoto) return "capture";
  if (args.hasPhoto) return "review";
  if (args.taskType === "timer" || args.taskType === "checkin") return "entry";
  if (args.taskType === "journal") return "write";
  if (args.taskType === "counter" || args.taskType === "water" || args.taskType === "reading") return "count";
  if (args.taskType === "run" || args.taskType === "workout") return "log";
  return initialStep(args.taskType);
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
  if (args.taskType === "journal") return "submit_journal";
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

export function logReady(args: {
  taskType: string;
  distance: number | null;
  durationSec: number | null;
  workoutMin: number | null;
  minDurationMinutes: number;
}): boolean {
  if (args.taskType === "run") return args.distance != null && args.durationSec != null;
  return args.workoutMin != null && args.workoutMin >= args.minDurationMinutes;
}

export type FinishSubmitOutcome = "failed" | "challenge_done" | "secured_nav";

/** Success never lands on the in-flow `confirmation` step — it navigates to secured. */
export function finishSubmitOutcome(args: {
  complete: unknown | null | undefined;
  afterUiKind?: string;
}): FinishSubmitOutcome {
  if (!args.complete) return "failed";
  if (args.afterUiKind === "challenge_done") return "challenge_done";
  return "secured_nav";
}

export function blockedEyebrow(windowStatus: string): "NOT OPEN YET" | "OUT OF RANGE" {
  return windowStatus === "out_of_window" ? "NOT OPEN YET" : "OUT OF RANGE";
}

import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";
import { securedElapsed } from "@/lib/consistency";
import { homeWindowClosed } from "@/lib/home-proof-card";
import { flowOpensCamera } from "@/lib/task-flow-state";
import { closedWindowCaption, gateLabel } from "@/lib/task-ui";

/**
 * Active challenge (frame 28) binding. Server fields only.
 * Header "Day secured" reduces over THIS enrollment's tasks for today.
 * Week strip uses getSecuredDateKeys through securedElapsed, gated at start_at.
 * Stamp keys off verified / proof_photo_url, never require_photo.
 * reset_notice is always false until the backend exposes a reset event.
 */

export const RESET_NOTICE = false;

export type ActiveTaskType =
  | "timer"
  | "reading"
  | "water"
  | "counter"
  | "photo"
  | "checkin"
  | "journal"
  | "workout"
  | "simple";

export type ActiveChallengeTask = {
  id: string;
  title: string;
  task_type: ActiveTaskType;
  duration_minutes?: number;
  target_value?: number;
  unit?: string;
  require_photo: boolean;
  completed_today: boolean;
  verified?: boolean;
  proof_photo_url?: string | null;
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
  windowState?: WindowState | null;
};

export const TASK_VERB: Record<ActiveTaskType, string> = {
  timer: "Start timer",
  reading: "Log pages",
  water: "Log water",
  counter: "Log count",
  photo: "Take photo",
  checkin: "Check in",
  journal: "Write entry",
  workout: "Log workout",
  simple: "Check off",
};

const KNOWN_TYPES = new Set<string>(Object.keys(TASK_VERB));

export function mapTaskType(raw: string | null | undefined): ActiveTaskType {
  const t = (raw ?? "").trim().toLowerCase();
  if (KNOWN_TYPES.has(t)) return t as ActiveTaskType;
  if (t === "manual" || t === "check_off" || t === "checklist") return "simple";
  if (t === "text") return "journal";
  if (t === "gps" || t === "location") return "checkin";
  if (t === "run") return "workout";
  return "simple";
}

export function taskVerb(taskType: ActiveTaskType): string {
  return TASK_VERB[taskType];
}

/** Camera proof on the completion row. require_photo does not earn a stamp. */
export function hasCameraProof(task: Pick<ActiveChallengeTask, "verified" | "proof_photo_url">): boolean {
  return task.verified === true || Boolean(task.proof_photo_url);
}

function sizePart(t: ActiveChallengeTask): string {
  if (t.task_type === "timer" || t.task_type === "workout") {
    return t.duration_minutes ? `${t.duration_minutes} min timer` : "";
  }
  if (t.task_type === "reading" || t.task_type === "water" || t.task_type === "counter") {
    if (t.target_value == null) return "";
    return t.unit ? `${t.target_value} ${t.unit}` : `${t.target_value}`;
  }
  return "";
}

/** Pending row caption: size · gateLabel(task). Closed windows match Home. */
export function pendingGate(t: ActiveChallengeTask): string {
  if (homeWindowClosed({ windowState: t.windowState, done: t.completed_today })) {
    return closedWindowCaption(t.gateTime);
  }
  return [
    sizePart(t),
    gateLabel({
      gates: t.gates,
      gateTime: t.gateTime,
      requirePhoto: t.require_photo,
    }),
  ].filter(Boolean).join(" · ");
}

/** Done row caption: size only. Trailing Stamp / Self-reported carries the proof. */
export function doneGate(t: ActiveChallengeTask): string {
  return sizePart(t);
}

export type StatusLine =
  | { kind: "secured"; allDone: string }
  | { kind: "progress"; text: string };

export function taskWord(n: number): string {
  return n === 1 ? "task" : "tasks";
}

/** This enrollment's tasks due today — not the account-level day_secures set. */
export function enrollmentTodayProgress(tasks: readonly { completed_today: boolean }[]): {
  done: number;
  total: number;
  securedToday: boolean;
} {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed_today).length;
  return { done, total, securedToday: total > 0 && done === total };
}

export function statusLine(args: {
  securedToday: boolean;
  done: number;
  total: number;
}): StatusLine {
  if (args.securedToday) {
    return { kind: "secured", allDone: `All ${args.total} done.` };
  }
  const left = Math.max(0, args.total - args.done);
  if (args.done === 0) {
    return { kind: "progress", text: `Nothing done today. ${left} ${taskWord(left)} left.` };
  }
  if (left === 0) {
    return { kind: "progress", text: `All ${args.total} done.` };
  }
  return {
    kind: "progress",
    text: `${args.done} of ${args.total} done. ${left} ${taskWord(left)} left.`,
  };
}

export function weekSecuredFromKeys(securedDateKeys: string[], weekDateKeys: string[]): boolean[] {
  const set = new Set(securedDateKeys);
  return weekDateKeys.map((k) => set.has(k));
}

/** Per-enrollment strip: #94 securedElapsed, days before start_at never filled. */
export function weekStripFilledForEnrollment(args: {
  securedDateKeys: readonly string[];
  weekDateKeys: readonly string[];
  startDateKey: string;
  todayKey: string;
}): boolean[] {
  const due = args.weekDateKeys.filter((k) => k >= args.startDateKey);
  const window = securedElapsed({
    dueDayKeys: due,
    securedDateKeys: args.securedDateKeys,
    todayKey: args.todayKey,
  });
  const filled = new Set(
    window.elapsedKeys.filter((k) => args.securedDateKeys.includes(k)),
  );
  return args.weekDateKeys.map((k) => filled.has(k));
}

/** Server set only. Never tasks.every(completed_today). */
export function securedTodayFromKeys(securedDateKeys: string[], todayKey: string): boolean {
  return securedDateKeys.includes(todayKey);
}

/** Active screen: any loaded non-active enrollment goes to catalog detail. */
export function activeEnrollmentNeedsRedirect(status: string | null | undefined): boolean {
  return typeof status === "string" && status.length > 0 && status !== "active";
}

export type FooterAction =
  | { kind: "share" }
  | { kind: "next"; task: ActiveChallengeTask }
  | { kind: "none" };

/**
 * Secured days share. Incomplete days name the next task.
 * All rows done but server unsecured: keep the primary on the last task.
 */
export function footerAction(args: {
  securedToday: boolean;
  tasks: ActiveChallengeTask[];
}): FooterAction {
  if (args.securedToday) return { kind: "share" };
  const next = args.tasks.find(
    (t) =>
      !t.completed_today &&
      !homeWindowClosed({ windowState: t.windowState, done: t.completed_today }),
  );
  if (next) return { kind: "next", task: next };
  const last = args.tasks[args.tasks.length - 1];
  if (last?.completed_today) return { kind: "next", task: last };
  return { kind: "none" };
}

export function difficultyLine(difficulty: "standard" | "hard"): string {
  return difficulty === "hard"
    ? "No freezes. Miss a day, restart from day 1."
    : "Freezes on. Use one to cover a missed day.";
}

export function streakCaption(streakDays: number): string {
  return streakDays > 0 ? "day streak" : "No streak yet";
}

export function participantsLine(count: number, participationType?: string): string {
  if (participationType === "team") return `${count} of 10 in this group`;
  return `${count} in this challenge`;
}

/** Home Today's proof caption. Photo only when TaskFlowV2 will open the camera. */
export function homeProofGate(
  taskType: string,
  durationMinutes?: number,
  requirePhoto = false,
): string {
  const raw = (taskType ?? "").trim().toLowerCase();
  if (raw === "timer" || raw === "workout" || raw === "run") {
    return durationMinutes && durationMinutes > 0 ? `Timer ${durationMinutes} min` : "Timer";
  }
  if (flowOpensCamera(requirePhoto ? ["camera"] : raw === "photo" ? ["camera"] : [])) return "Photo";
  return "Self-reported";
}

export function resetBody(durationDays: number): string {
  return `A day went unsecured. Hard mode has no freezes, so the count went back to Day 1 of ${durationDays}.`;
}

export function mapDifficulty(args: {
  isHardMode?: boolean | null;
  difficulty?: string | null;
}): "standard" | "hard" {
  if (args.isHardMode === true) return "hard";
  const d = (args.difficulty ?? "").trim().toLowerCase();
  if (d === "hard" || d === "extreme") return "hard";
  return "standard";
}

export function requirePhotoAsked(args: {
  taskType: ActiveTaskType;
  requirePhoto?: boolean | null;
  config?: Record<string, unknown> | null;
}): boolean {
  if (args.taskType === "photo") return true;
  if (args.requirePhoto === true) return true;
  const c = args.config ?? {};
  return c.require_photo_proof === true || c.photo_required === true || c.require_photo === true;
}

export function unitForTask(
  taskType: ActiveTaskType,
  config?: Record<string, unknown> | null
): string | undefined {
  const c = config ?? {};
  if (typeof c.unit === "string" && c.unit.trim()) return c.unit.trim();
  if (taskType === "reading") return "pages";
  return undefined;
}

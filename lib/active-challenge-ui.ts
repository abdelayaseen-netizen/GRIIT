/**
 * Active challenge (frame 28) binding. Server fields only.
 * secured_today / week_secured come from getSecuredDateKeys, never from task rows.
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
  | "workout";

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
};

const KNOWN_TYPES = new Set<string>(Object.keys(TASK_VERB));

export function mapTaskType(raw: string | null | undefined): ActiveTaskType {
  const t = (raw ?? "").trim().toLowerCase();
  if (KNOWN_TYPES.has(t)) return t as ActiveTaskType;
  if (t === "manual") return "photo";
  if (t === "text") return "journal";
  if (t === "gps" || t === "location") return "checkin";
  if (t === "run") return "workout";
  return "photo";
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

function proofPart(t: ActiveChallengeTask): string {
  return t.require_photo ? "Photo required" : "Self-reported";
}

/** Pending row caption: size · proof. Built from fields, never typed. */
export function pendingGate(t: ActiveChallengeTask): string {
  return [sizePart(t), proofPart(t)].filter(Boolean).join(" · ");
}

/** Done row caption: size only. Trailing Stamp / Self-reported carries the proof. */
export function doneGate(t: ActiveChallengeTask): string {
  return sizePart(t);
}

export type StatusLine =
  | { kind: "secured"; allDone: string }
  | { kind: "progress"; text: string };

export function statusLine(args: {
  securedToday: boolean;
  done: number;
  total: number;
}): StatusLine {
  if (args.securedToday) {
    return { kind: "secured", allDone: `All ${args.total} done.` };
  }
  const left = Math.max(0, args.total - args.done);
  const taskWord = left === 1 ? "task" : "tasks";
  if (args.done === 0) {
    return { kind: "progress", text: `Nothing done today. ${left} ${taskWord} left.` };
  }
  if (left === 0) {
    return { kind: "progress", text: `${args.done} of ${args.total} done.` };
  }
  return {
    kind: "progress",
    text: `${args.done} of ${args.total} done. ${left} ${taskWord} left.`,
  };
}

export function weekSecuredFromKeys(securedDateKeys: string[], weekDateKeys: string[]): boolean[] {
  const set = new Set(securedDateKeys);
  return weekDateKeys.map((k) => set.has(k));
}

/** Server set only. Never tasks.every(completed_today). */
export function securedTodayFromKeys(securedDateKeys: string[], todayKey: string): boolean {
  return securedDateKeys.includes(todayKey);
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
  const next = args.tasks.find((t) => !t.completed_today);
  if (next) return { kind: "next", task: next };
  const last = args.tasks[args.tasks.length - 1];
  if (last) return { kind: "next", task: last };
  return { kind: "none" };
}

export function difficultyLine(difficulty: "standard" | "hard"): string {
  return difficulty === "hard" ? "Hard mode. No freezes." : "Standard mode";
}

export function streakCaption(streakDays: number): string {
  return streakDays > 0 ? "day streak" : "No streak yet";
}

export function participantsLine(count: number): string {
  return `${count} in this challenge`;
}

/** Home Today's proof caption. Never a constant "Photo". */
export function homeProofGate(taskType: string, durationMinutes?: number): string {
  const t = mapTaskType(taskType);
  if (t === "timer" || t === "workout") {
    return durationMinutes && durationMinutes > 0 ? `Timer ${durationMinutes} min` : "Timer";
  }
  if (t === "photo") return "Photo";
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

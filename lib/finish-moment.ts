/**
 * Frame 114 finish-moment state. Pure — no I/O.
 * save follows the completion mutation. shared flips only after save succeeds.
 */
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { dateKeyFromIso } from "@/lib/home-day-total";
import { taskWord } from "@/lib/format-days";
import { finishSubmitOutcome } from "@/lib/task-flow-state";
import { gateLine } from "@/lib/task-ui";

export type SaveState = "saving" | "slow" | "saved" | "failed";
export type ShareIntent = "none" | "feed_held";
export type FinishAfter = "failed" | "saved" | "secured_nav";
export type HeldShareAction = "call_share" | "drop" | "keep_held";

export const FINISH_SLOW_MS = 3000;

export const FINISH_STATUS: Record<SaveState, string> = {
  saving: "Saving…",
  slow: "Still saving. It keeps going if you leave.",
  saved: "Task saved.",
  failed: "Didn't save. Try again.",
};

export const FINISH_SHARE = "Share to the feed";
export const FINISH_SHARE_HELD = "Shares when saved";
export const FINISH_STORY = "Story";
export const FINISH_DONE = "Done";
export const FINISH_TRY_AGAIN = "Try again";
export const FINISH_NEXT = "Next task";
export const FINISH_KEEP = "Keep it to the record";
export const FINISH_LEAVE_SAVING = "Leave it saving";
export const FINISH_BACK_TODAY = "Back to today";
export const FINISH_FAILED_BODY =
  "Nothing was saved and nothing was shared. The photo stays on this screen until it saves.";

export type AlsoTodayRow = { id: string; title: string; gate_line: string };

/** Same skip as Home: enrollments that start after today are not on Today. */
export function enrollmentDueToday(args: {
  startAt?: string | null;
  timeZone: string;
  todayKey: string;
}): boolean {
  if (!args.startAt) return true;
  return dateKeyFromIso(String(args.startAt), args.timeZone) <= args.todayKey;
}

export function alsoTodayFromTasks(
  tasks: readonly {
    id?: string | null;
    name: string;
    done?: boolean;
    gates?: readonly TaskGate[] | null;
    gateTime?: GateTime | null;
  }[],
  excludeTaskId: string,
): AlsoTodayRow[] {
  return tasks
    .filter((t) => Boolean(t.id) && t.id !== excludeTaskId && t.done !== true)
    .map((t) => ({
      id: String(t.id),
      title: t.name,
      gate_line: gateLine(t.gates, t.gateTime),
    }));
}

export function finishAlsoTodayLabel(n: number): string {
  const count = Math.max(0, Math.floor(n));
  return `Also today · ${count} ${taskWord(count)}`;
}

export function finishNextLabel(title?: string | null): string {
  const t = title?.trim();
  return t ? `Next task · ${t}` : FINISH_NEXT;
}

export function finishShareLabel(share: ShareIntent): string {
  return share === "feed_held" ? FINISH_SHARE_HELD : FINISH_SHARE;
}

/** Pending save. After 3 s the status becomes slow. */
export function finishSaveFromElapsed(elapsedMs: number): SaveState {
  return elapsedMs >= FINISH_SLOW_MS ? "slow" : "saving";
}

/**
 * Branch after the mutation. securedToday is the server flag, never a client count.
 */
export function finishAfterMutation(args: {
  complete: unknown | null | undefined;
  securedToday: boolean;
  error?: boolean;
}): FinishAfter {
  if (args.error === true) return "failed";
  const outcome = finishSubmitOutcome({
    complete: args.complete,
    securedToday: args.securedToday,
  });
  if (outcome === "failed") return "failed";
  if (outcome === "secured_nav") return "secured_nav";
  return "saved";
}

/**
 * Held "Share to the feed" while the save is still pending.
 * call_share only after the save lands. Failure drops it.
 * Leave while held still posts once the save succeeds.
 */
export function resolveHeldShare(args: {
  held: boolean;
  after: FinishAfter | "pending";
}): HeldShareAction {
  if (!args.held) return "keep_held";
  if (args.after === "failed") return "drop";
  if (args.after === "saved" || args.after === "secured_nav") return "call_share";
  return "keep_held";
}

export type FinishLetter = "A" | "B" | "C" | "D" | "E" | "F";

/** A camera saving · B self-report saving held · C saved day open · D failed · E slow · F secured. */
export function finishLetter(args: {
  save: SaveState;
  share: ShareIntent;
  camera: boolean;
  after?: FinishAfter;
}): FinishLetter {
  if (args.after === "secured_nav") return "F";
  if (args.save === "failed") return "D";
  if (args.save === "slow") return "E";
  if (args.save === "saved") return "C";
  if (args.share === "feed_held" && !args.camera) return "B";
  return "A";
}

/**
 * Build 92 chunk 02 · the one finish flow (Part 1, P1-01 … P1-11, P1-34).
 * Done → post sheet → Challenge complete, Day secured, or Home with a toast.
 * The Proof screen is never a destination. Pure: copy, routing and the per-user teaching flag.
 */
import type { PostAudience } from "@/lib/post-audience";

export const FINISH_COPY = {
  postTitle: "Post your proof",
  captionPlaceholder: "Add a caption (optional)",
  captionMax: 120,
  whoSees: "Who sees this",
  posting: "Posting",
  tryAgain: "Try again",
  offline: "No connection. Your task is saved and counts. Post again when you're back online.",
  closedPrivate: "Saved privately.",
  secured: "Every task today is done.",
  securedFirst: "A day is secured when every task in all your challenges is done.",
  share: "Share",
  done: "Done",
  next: "Next",
  finished: "finished",
  longestStreak: "Longest streak",
  dates: "Dates",
} as const;

export const AUDIENCE_COPY: Record<PostAudience, { label: string; line: string; button: string }> = {
  friends: { label: "Friends", line: "Your friends see it in their feed.", button: "Post to friends" },
  everyone: { label: "Everyone", line: "Anyone on GRIIT can see it.", button: "Post to everyone" },
  only_me: { label: "Only me", line: "Only you can see it. It still counts for today.", button: "Save privately" },
};

/** Build 92 12b.2: the "{count} / {max}" counter shows once a caption is within 20 characters of the limit. */
export function captionCounterFrom(max: number): number {
  return Math.max(0, max - 20);
}

/** The sheet's order: Friends (default), Everyone, Only me. */
export const POST_SHEET_AUDIENCES: readonly PostAudience[] = ["friends", "everyone", "only_me"];

/** "Your 4 friends see it in their feed." when the count is known. */
export function audienceLine(audience: PostAudience, friendCount?: number | null): string {
  if (audience === "friends" && typeof friendCount === "number" && friendCount > 0) {
    return `Your ${friendCount} friends see it in their feed.`;
  }
  return AUDIENCE_COPY[audience].line;
}

export function postSheetSubtitle(task: string, challenge: string, day: number, total: number): string {
  return `${task} · ${challenge} · Day ${day} of ${total}`;
}

export function postButton(args: { audience: PostAudience; busy: boolean; error: boolean }): string {
  if (args.busy) return FINISH_COPY.posting;
  if (args.error) return FINISH_COPY.tryAgain;
  return AUDIENCE_COPY[args.audience].button;
}

export function remainingToast(task: string, left: number): string {
  return `${task} done. ${Math.max(0, left)} left today.`;
}

export function otherOpenLine(challenge: string): string {
  return `Today isn't secured yet. ${challenge} still needs today.`;
}

export function inARow(n: number): string {
  return n === 1 ? "day in a row" : "days in a row";
}

export function freezesUsedLabel(n: number): string {
  return n === 1 ? "Freeze used" : "Freezes used";
}

export function securedOfDays(secured: number, total: number): string {
  return `${secured} of ${total} days secured`;
}

export type FinishResult = {
  /** This save secured the last day of the enrollment. */
  challengeFinished: boolean;
  /** Today flipped to secured on this save (server flag). */
  daySecuredNow: boolean;
  /** Open tasks across all active challenges after this one. */
  remainingToday: number;
  nextTaskId?: string | null;
};

export type FinishRoute =
  | { to: "ChallengeComplete"; otherChallengesOpen: boolean }
  | { to: "DaySecured" }
  | { to: "Home"; toast: string; highlightTaskId: string | null };

/** Challenge complete beats Day secured ("never both"); otherwise Home with the toast. */
export function routeAfterFinish(r: FinishResult, taskTitle: string): FinishRoute {
  if (r.challengeFinished) return { to: "ChallengeComplete", otherChallengesOpen: !r.daySecuredNow };
  if (r.daySecuredNow) return { to: "DaySecured" };
  return { to: "Home", toast: remainingToast(taskTitle, r.remainingToday), highlightTaskId: r.nextTaskId ?? null };
}

/** Open tasks across every active challenge, minus the one just saved. */
export function remainingAfter(openTaskIds: readonly string[], savedTaskId: string): number {
  return openTaskIds.filter((id) => id !== savedTaskId).length;
}

/** Network failures read as offline; the task is saved locally and counts. */
export function isOfflineError(message: string | null | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  return (
    m.includes("network request failed") ||
    m.includes("failed to fetch") ||
    m.includes("no connection") ||
    m.includes("offline") ||
    m.includes("timed out") ||
    m.includes("timeout")
  );
}

/** Per-task verification label on Day secured and posts. */
export function verifyLabel(task: { hasCameraProof?: boolean | null; verifiedBy?: string | null }): string {
  if (task.verifiedBy === "strava") return "Verified by Strava";
  if (task.hasCameraProof === true) return "Verified";
  return "Self-reported";
}

/** "Oct 1 – Oct 30" from the enrollment start and its length. */
export function finishDates(startIso: string | null | undefined, durationDays: number, locale = "en-US"): string | null {
  if (!startIso) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
  const f = (d: Date) => d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${f(start)} – ${f(end)}`;
}

// ---- the teaching line, once per user ------------------------------------------------

export const SECURED_TEACHING_KEY = "griit.secured.teaching.v1";

export function parseTeachingSeen(raw: string | null | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

/** True when this user has not seen the teaching line yet. */
export function teachingShows(raw: string | null | undefined, userId: string): boolean {
  if (!userId) return false;
  return !parseTeachingSeen(raw).has(userId);
}

/** The stored value after this user has seen it. */
export function markTeachingSeen(raw: string | null | undefined, userId: string): string {
  const seen = parseTeachingSeen(raw);
  if (userId) seen.add(userId);
  return JSON.stringify([...seen]);
}

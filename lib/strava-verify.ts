/**
 * Build 90 chunk 09: Strava auto-detect copy and small rules, shared by the app and the server.
 * No React Native imports: the backend loads this file for the notification text.
 */

export const VERIFIED_BY_STRAVA = "Verified by Strava";
export const VERIFY_WITH_STRAVA = "Verify with Strava";
export const STRAVA_VERIFY_LABEL = "How it's verified";
export const STRAVA_VERIFY_SEGMENTS = ["Self-reported", "Verify with Strava"] as const;
export const STRAVA_VERIFY_CAPTION = {
  self: "Mark it done. Posts as self-reported.",
  strava: "A run or ride logged in Strava finishes this task for you. Then you choose whether to post it.",
} as const;
export const STRAVA_SPORTS = ["Run", "Ride"] as const;
export type StravaSport = (typeof STRAVA_SPORTS)[number];

/** Push and in-app notifications open this screen: the chunk 04 post-or-private choice. */
export const STRAVA_CHOICE_ROUTE = "/task/strava";
/** Push `data.type` for the notification handler. */
export const STRAVA_PUSH_TYPE = "strava_verified";

export type TaskVerify = "self" | "strava";

/** The option is a product flag, needs a connected Strava account, and only runs and rides. */
export function showStravaVerifyOption(args: { flag: boolean; connected: boolean; type: string }): boolean {
  return args.flag && args.connected && args.type === "run";
}

/** "Strava run logged." / "Morning run is done for Day 2." */
export function stravaLoggedNotification(args: { taskName: string; day: number; sport?: string | null }): {
  title: string;
  body: string;
} {
  const sport = (args.sport ?? "").toLowerCase();
  const noun = sport === "run" ? "run" : sport === "ride" ? "ride" : "activity";
  const name = args.taskName.trim() || "Task";
  const day = Math.max(1, Math.floor(args.day) || 1);
  return { title: `Strava ${noun} logged.`, body: `${name} is done for Day ${day}.` };
}

export function stravaChoiceRoute(args: {
  eventId: string | null;
  taskName: string;
  day: number;
  challengeName: string;
  daySecured: boolean;
  streak: number;
}): string {
  const q = new URLSearchParams({
    eventId: args.eventId ?? "",
    taskName: args.taskName,
    day: String(Math.max(1, Math.floor(args.day) || 1)),
    challengeName: args.challengeName,
    secured: args.daySecured ? "1" : "0",
    streak: String(Math.max(0, Math.floor(args.streak) || 0)),
  });
  return `${STRAVA_CHOICE_ROUTE}?${q.toString()}`;
}

export type VerifiedBy = "strava";

/** A check-in row's verifier, from `proof_source`. */
export function stravaVerifiedBy(row: { proof_source?: string | null } | null | undefined): VerifiedBy | null {
  return row?.proof_source === "strava" ? "strava" : null;
}

/** The line that replaces "Self-reported" on a verified completion. */
export function verifiedLine(verifiedBy: string | null | undefined): string | null {
  return verifiedBy === "strava" ? VERIFIED_BY_STRAVA : null;
}

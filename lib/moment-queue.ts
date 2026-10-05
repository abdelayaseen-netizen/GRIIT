/**
 * One queue for full-screen moments.
 *
 * Away recap (challenge/end) shows once, on Home, at first open.
 * Completing a task is Finish → Secured → (final day) Challenge complete → Home.
 * Those never stack with the away recap.
 *
 * 5:20 am stack: Drink Water Today is a 1-day. Completing it secures the day and
 * ends the enrollment in the same mutation. finalizeEnded then listed it as unseen
 * while pathname was /task/secured, so "Drink Water Today is over" pushed on Secured.
 */
import { enrollmentFinished } from "@/lib/route-after-save";
export type MomentSurface =
  | "home"
  | "task_flow"
  | "secured"
  | "challenge_complete"
  | "challenge_end"
  | "blocked";

export function momentSurfaceFromPathname(pathname: string): MomentSurface {
  const p = pathname.toLowerCase();
  if (p.includes("/challenge/end")) return "challenge_end";
  if (p.includes("/challenge/complete")) return "challenge_complete";
  if (p.includes("/task/secured")) return "secured";
  if (p.includes("/task/")) return "task_flow";
  if (p.includes("/onboarding") || p.includes("/auth") || p.includes("/create-profile")) return "blocked";
  if (p.includes("/(tabs)") || p === "/" || p.endsWith("/index")) return "home";
  return "blocked";
}

/** Away recap only on Home. Never during a task flow or on Finish/Secured/complete. */
export function shouldPresentAwayRecap(pathname: string): boolean {
  return momentSurfaceFromPathname(pathname) === "home";
}

export function afterSecuredNext(args: {
  challengeDone?: boolean;
  challengeDay: number;
  challengeLength: number;
  counterReachedTarget?: boolean;
}): "challenge_complete" | "home" {
  const finished = enrollmentFinished({
    challengeDone: args.challengeDone === true,
    dayIndex: args.challengeDay,
    durationDays: args.challengeLength,
    counterReachedTarget: args.counterReachedTarget,
  });
  return finished ? "challenge_complete" : "home";
}

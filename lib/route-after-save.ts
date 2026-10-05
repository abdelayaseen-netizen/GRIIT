/**
 * v48.1 · the one rule for the screen after a save.
 * Precedence: challenge finished, then day just secured, then a Home toast.
 * A counter meeting its target is not a finished challenge.
 */
export type SaveResult = {
  challengeFinished: boolean;
  daySecuredNow: boolean;
  enrollmentId: string;
};

export type Route =
  | { screen: "FinishMoment"; enrollmentId: string }
  | { screen: "Secured" }
  | { screen: "Toast" };

export function routeAfterSave(r: SaveResult): Route {
  if (r.challengeFinished) return { screen: "FinishMoment", enrollmentId: r.enrollmentId };
  if (r.daySecuredNow) return { screen: "Secured" };
  return { screen: "Toast" };
}

/**
 * Finish only when this save secured the last day of the enrollment.
 * A counter at its target, or a day index on its own, is not enough.
 */
export function enrollmentFinished(args: {
  challengeDone: boolean;
  dayIndex: number;
  durationDays: number;
  counterReachedTarget?: boolean;
}): boolean {
  if (args.counterReachedTarget === true) return false;
  if (args.challengeDone !== true) return false;
  return args.durationDays > 0 && args.dayIndex === args.durationDays;
}

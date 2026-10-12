// v48.1 · the one rule for the screen after a save. Precedence 1 > 2 > 3; one screen per save.
export type SaveResult = {
  challengeFinished: boolean; // this save secured the last day of an enrollment (day_index === duration_days)
  daySecuredNow: boolean;     // secured_today flipped false -> true on this save
  enrollmentId: string;
};
export type Route = { screen: 'FinishMoment'; enrollmentId: string } | { screen: 'Secured' } | { screen: 'Toast' };
export function routeAfterSave(r: SaveResult): Route {
  if (r.challengeFinished) return { screen: 'FinishMoment', enrollmentId: r.enrollmentId };
  if (r.daySecuredNow) return { screen: 'Secured' };
  return { screen: 'Toast' };
}
// A counter reaching its target is NOT challengeFinished. Never derive finish from count === target
// or from day_index alone. FinishMoment and its card read enrollment.secured_days and
// enrollment.longest_streak from the server.

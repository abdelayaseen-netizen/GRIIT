// Part 1.1 · one finish flow. One screen per save.
export type SaveResult = {
  taskMetGoal: boolean;        // false when short of the goal (logged, doesn't count)
  daySecuredNow: boolean;      // secured_today flipped false -> true on this save
  challengeFinished: boolean;  // this save secured the final day of an enrollment
  remainingToday: number;      // open tasks across all active challenges
  nextTaskId?: string;
};
export type Route =
  | { to: 'ChallengeComplete'; otherChallengesOpen: boolean }
  | { to: 'DaySecured' }
  | { to: 'Home'; toast: string; highlightTaskId?: string };

export function routeAfterSave(r: SaveResult, taskTitle: string, short?: { doneLabel: string; shortLabel: string }): Route {
  if (!r.taskMetGoal && short) return { to: 'Home', toast: 'Run saved. ' + short.shortLabel + ', so today isn’t secured yet.', highlightTaskId: r.nextTaskId };
  if (r.challengeFinished) return { to: 'ChallengeComplete', otherChallengesOpen: !r.daySecuredNow };
  if (r.daySecuredNow) return { to: 'DaySecured' };
  return { to: 'Home', toast: `${taskTitle} done. ${r.remainingToday} left today.`, highlightTaskId: r.nextTaskId };
}
// The Proof screen is never a destination here. Proof opens only from the feed or the profile.

// Frame 120. Replaces "Server Error: Failed to join challenge."
// Mapped from the join/startAgain mutation error code. Nothing is joined until the server confirms.

export type JoinError =
  | { code: 'ALREADY_RUNNING'; day_n: number; duration_days: number; title: string; enrollment_id: string }
  | { code: 'FREE_LIMIT'; active_count: number; free_limit: number; pro_limit: number }   // lib/free-challenge-limit.ts
  | { code: 'PRIVATE' }
  | { code: 'UNKNOWN' };

export function joinErrorCopy(e: JoinError): { title: string; body: string; primary: string; secondary: 'Close' } {
  switch (e.code) {
    case 'ALREADY_RUNNING':
      return { title: "You're already in this one.", body: `${e.title} is on Day ${e.day_n} of ${e.duration_days}. Finish or leave that run before starting another.`, primary: 'Open your run', secondary: 'Close' };
    case 'FREE_LIMIT':
      return { title: `You have ${e.active_count} running.`, body: `The free plan runs ${e.free_limit} ${e.free_limit === 1 ? 'challenge' : 'challenges'} at a time. Leave one, or go Pro for up to ${e.pro_limit}.`, primary: 'See plans', secondary: 'Close' };
    case 'PRIVATE':
      return { title: 'This challenge is private.', body: 'Only the person who made it can join. It may have been made private after you opened it.', primary: 'Back to Discover', secondary: 'Close' };
    default:
      return { title: "Couldn't join.", body: 'Nothing changed on your account. Check the connection and try again.', primary: 'Try again', secondary: 'Close' };
  }
}

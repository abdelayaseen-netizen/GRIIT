/**
 * When to ask a guest to save the account.
 * First time: after the first task.
 * Again: on the second secured day, and whenever a post would go public.
 */
export function shouldShowSaveStreak(input: {
  isAnonymous: boolean;
  firstTaskDone: boolean;
  securedDays: number;
  aboutToPostPublic: boolean;
  dismissedAfterFirst: boolean;
  dismissedAfterSecond: boolean;
}): boolean {
  if (!input.isAnonymous) return false;
  if (input.aboutToPostPublic) return true;
  if (input.securedDays >= 2 && !input.dismissedAfterSecond) return true;
  if (input.firstTaskDone && !input.dismissedAfterFirst && input.securedDays < 2) return true;
  return false;
}

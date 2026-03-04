/**
 * Last Stand: streak protection (max 2). Earn after 6/7 days; use automatically when 1 missed day.
 */

export const MAX_LAST_STANDS = 2;

/** Returns whether user earns a Last Stand this secure (6+ days in last 7 and available < 2). */
export function shouldEarnLastStand(securedDaysInLast7: number, currentAvailable: number): boolean {
  const available = Math.min(MAX_LAST_STANDS, Math.max(0, currentAvailable));
  return securedDaysInLast7 >= 6 && available < MAX_LAST_STANDS;
}

/** New available count after earning one (capped at MAX_LAST_STANDS). */
export function newAvailableAfterEarn(currentAvailable: number): number {
  return Math.min(MAX_LAST_STANDS, Math.max(0, currentAvailable) + 1);
}

/** New available count after using one (floored at 0). */
export function newAvailableAfterUse(currentAvailable: number): number {
  return Math.max(0, Math.min(MAX_LAST_STANDS, currentAvailable) - 1);
}

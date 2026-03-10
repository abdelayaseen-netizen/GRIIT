/**
 * 24-hour challenge countdown and expiry helpers.
 * Use for display (formatTimeRemaining, formatTimeRemainingHMS) and guards (isChallengeExpired).
 */

export function getChallengeTimeRemaining(endsAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  return { hours, minutes, seconds, isExpired: false };
}

/** "23h 45m" or "Ended" for countdown display. Updates every 60s is enough; use with interval or on render. */
export function formatTimeRemaining(endsAt: string): string {
  const { hours, minutes, isExpired } = getChallengeTimeRemaining(endsAt);
  if (isExpired) return "Ended";
  return `${hours}h ${minutes}m`;
}

/** "HH:MM:SS" or "Expired" for timer display. Update every 1s for live countdown. */
export function formatTimeRemainingHMS(endsAt: string): string {
  const { hours, minutes, seconds, isExpired } = getChallengeTimeRemaining(endsAt);
  if (isExpired) return "Expired";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function isChallengeExpired(endsAt: string | null | undefined): boolean {
  if (!endsAt) return false;
  const end = new Date(endsAt).getTime();
  return Number.isNaN(end) || end <= Date.now();
}

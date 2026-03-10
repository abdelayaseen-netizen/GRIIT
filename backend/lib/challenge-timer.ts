/**
 * Backend: 24h challenge expiry check. Used in checkins.complete and checkins.secureDay.
 */
export function isChallengeExpired(endsAt: string | null | undefined): boolean {
  if (!endsAt) return false;
  const end = new Date(endsAt).getTime();
  return Number.isNaN(end) || end <= Date.now();
}

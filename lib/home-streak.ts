/**
 * Null only while getStats has not settled.
 * A successful read with no streaks row (`activeStreak: null`) is day 0 —
 * getStats intentionally refuses to invent a zero for a missing row
 * (`backend/trpc/routes/profiles-stats.ts`), but Home must not stay on
 * "Updating streak." for a fresh guest.
 *
 * After an account upgrade the query key is user.id. If the uid changes
 * (or the query remounts), isSuccess is false while in-flight. Treat
 * isFetched / existing context stats as ready so we do not flash the
 * loading caption. A settled error with no streak is day 0.
 */
export function resolveHomeStatsReady(input: {
  queryFetched: boolean;
  queryData: unknown;
  contextStats: unknown;
}): boolean {
  return input.queryFetched || input.queryData != null || input.contextStats != null;
}

export function resolveDisplayedStreak(
  statsReady: boolean,
  activeStreak: number | null | undefined
): number | null {
  if (!statsReady) return null;
  return activeStreak ?? 0;
}

/**
 * Home calendar tz: profile IANA if set, else the device zone.
 * `getTodayDateKey(undefined)` is UTC — Friday 10:23pm ET becomes Saturday.
 */
export function resolveHomeTimeZone(
  profileTimezone: string | null | undefined,
  deviceTimeZone: string
): string {
  const fromProfile = profileTimezone?.trim();
  if (fromProfile) return fromProfile;
  return deviceTimeZone;
}

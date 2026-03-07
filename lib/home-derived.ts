/**
 * Derived state for the home screen: retention flags, banners, and stats.
 * Single place so home and any reuse (e.g. widgets) stay consistent.
 */

import { RETENTION_CONFIG } from "./retention-config";

export interface HomeStatsLike {
  activeStreak?: number | null;
  lastCompletedDateKey?: string | null;
  effectiveMissedDays?: number | null;
  tier?: string | null;
  nextTierName?: string | null;
  pointsToNextTier?: number | null;
  canUseFreeze?: boolean | null;
  freezesRemaining?: number | null;
  lastStandsAvailable?: number | null;
  longestStreak?: number | null;
  totalDaysSecured?: number | null;
}

export interface HomeRetentionDerived {
  currentStreak: number;
  lastCompletedDateKey: string | null;
  todayKey: string;
  effectiveMissedDays: number;
  daysSinceLastSecure: number;
  showRecoveryBanner: boolean;
  showComebackMode: boolean;
  showRestartMode: boolean;
  canUseFreeze: boolean;
  freezesRemaining: number;
  lastStandsAvailable: number;
  isDaySecured: boolean;
}

export function getHomeRetentionDerived(
  stats: HomeStatsLike | null,
  todayKey: string,
  hasActiveChallenge: boolean,
  isGuest: boolean
): HomeRetentionDerived {
  const lastCompletedDateKey = stats?.lastCompletedDateKey ?? null;
  const effectiveMissedDays =
    stats?.effectiveMissedDays ??
    (lastCompletedDateKey == null
      ? 0
      : lastCompletedDateKey >= todayKey
        ? 0
        : Math.floor((Date.parse(todayKey) - Date.parse(lastCompletedDateKey)) / 86400000));
  const currentStreak = stats?.activeStreak || 0;

  return {
    currentStreak,
    lastCompletedDateKey,
    todayKey,
    effectiveMissedDays,
    daysSinceLastSecure: effectiveMissedDays,
    showRecoveryBanner:
      !isGuest &&
      hasActiveChallenge &&
      effectiveMissedDays >= RETENTION_CONFIG.missedOneDayThreshold,
    showComebackMode:
      !isGuest &&
      effectiveMissedDays >= RETENTION_CONFIG.comebackModeMinDays &&
      effectiveMissedDays <= RETENTION_CONFIG.comebackModeMaxDays,
    showRestartMode: !isGuest && effectiveMissedDays >= RETENTION_CONFIG.restartThreshold,
    canUseFreeze:
      stats?.canUseFreeze ??
      (effectiveMissedDays === RETENTION_CONFIG.streakFreezeEligibleMissedDays && currentStreak > 0),
    freezesRemaining: stats?.freezesRemaining ?? 1,
    lastStandsAvailable: stats?.lastStandsAvailable ?? 0,
    isDaySecured: (stats?.lastCompletedDateKey ?? null) === todayKey,
  };
}

/**
 * Retention & recovery config. Single place to tune thresholds and streak freeze rules.
 */

export const RETENTION_CONFIG = {
  /** Show "you missed yesterday" banner when days since last secure >= this */
  missedOneDayThreshold: 1,
  /** Show "Comeback Mode" (secure 3 days to restore) when missed days in this range */
  comebackModeMinDays: 2,
  comebackModeMaxDays: 6,
  /** Number of days to secure in a row to "restore momentum" in comeback mode */
  comebackRequiredDays: 3,
  /** Show "Start fresh" / restart when missed days >= this */
  restartThreshold: 7,

  /** Streak freeze: how many free uses per month */
  streakFreezePerMonth: 1,
  /** Freeze can only be used when missed exactly this many days (1 = yesterday only) */
  streakFreezeEligibleMissedDays: 1,
} as const;

export type RetentionConfig = typeof RETENTION_CONFIG;

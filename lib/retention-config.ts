/**
 * Retention thresholds shared between backend procedures and frontend components.
 *
 * These constants are intentionally simple, static values so they can be safely
 * imported on both the React Native client and the Hono/tRPC backend.
 */
export const RETENTION_CONFIG = {
  /**
   * The number of hours remaining in the user's local day at which an active
   * streak is considered "at risk". Used by `feed.getStreakAtRisk` and the
   * `StreakRiskBanner` component to decide when to surface the loss-aversion
   * banner on Discover.
   */
  STREAK_AT_RISK_HOURS: 12,

  /**
   * Minimum number of joins-today required before a Quick wins / featured card
   * shows the live "{N} today" social proof. Below this threshold the UI
   * should fall back to a "Be first today" / "Trending now" empty state to
   * avoid showing tiny counts that hurt social proof.
   */
  SOCIAL_PROOF_MIN_THRESHOLD: 5,
} as const;

export type RetentionConfig = typeof RETENTION_CONFIG;

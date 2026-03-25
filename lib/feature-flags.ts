/**
 * Feature and premium flags for launch and future monetization.
 * Use these to gate premium or experimental features without scattering conditionals.
 *
 * Future premium surfaces:
 * - Challenge packs (discover screen)
 * - Advanced analytics (profile or dedicated screen)
 * - Premium profile customization (profile screen)
 * - Integration verification: Strava, Apple Health, WHOOP (settings)
 */

export const FLAGS = {
  IS_BETA: true,
  /** When false, location check-in task shows "Coming soon" and does not navigate to task/checkin. */
  LOCATION_CHECKIN_ENABLED: false,
  /** When false, challenge chat screen shows "Not available" and is hidden from normal navigation. */
  CHAT_ENABLED: false,
  PREMIUM_ENABLED: true,
  PREMIUM_CHALLENGE_PACKS: true,
  PREMIUM_ANALYTICS: true,
  PREMIUM_PROFILE_FEATURES: true,
  PREMIUM_INTEGRATIONS: false,
} as const;

// ============================================
// FREE TIER LIMITS
// ============================================
export const FREE_LIMITS = {
  MAX_ACTIVE_CHALLENGES: 3,
  MAX_CREATED_CHALLENGES: 1,
  MAX_DAILY_RESPECTS: 5,
  MAX_DAILY_NUDGES: 3,
} as const;

/** @deprecated Use FREE_LIMITS */
export const PREMIUM_LIMITS = {
  FREE_MAX_ACTIVE_CHALLENGES: FREE_LIMITS.MAX_ACTIVE_CHALLENGES,
  FREE_MAX_CREATED_CHALLENGES: FREE_LIMITS.MAX_CREATED_CHALLENGES,
  FREE_MAX_DAILY_RESPECTS: FREE_LIMITS.MAX_DAILY_RESPECTS,
  FREE_MAX_DAILY_NUDGES: FREE_LIMITS.MAX_DAILY_NUDGES,
} as const;

// ============================================
// PREMIUM FEATURE FLAGS
// When premium is enabled, flip individual features here.
// ============================================
export const PREMIUM_FEATURES = {
  UNLIMITED_CHALLENGES: true,
  UNLIMITED_CREATION: true,
  ADVANCED_ANALYTICS: true,
  PREMIUM_PACKS: true,
  CUSTOM_THEMES: true,
  LEADERBOARD_PRIORITY: true,
  UNLIMITED_SOCIAL: true,
  PREMIUM_BADGE: true,
  INTEGRATIONS: false,
  CHAT: false,
} as const;

/** @deprecated Use FLAGS.IS_BETA */
export const IS_BETA_LAUNCH = FLAGS.IS_BETA;

/** @deprecated Use FLAGS.PREMIUM_* */
export const PREMIUM_ENABLED = FLAGS.PREMIUM_ENABLED;

/** @deprecated Use FLAGS.PREMIUM_CHALLENGE_PACKS */
export const PREMIUM_CHALLENGE_PACKS = FLAGS.PREMIUM_CHALLENGE_PACKS;

/** @deprecated Use FLAGS.PREMIUM_ANALYTICS */
export const PREMIUM_ANALYTICS = FLAGS.PREMIUM_ANALYTICS;

/** @deprecated Use FLAGS.PREMIUM_PROFILE_FEATURES */
export const PREMIUM_PROFILE = FLAGS.PREMIUM_PROFILE_FEATURES;

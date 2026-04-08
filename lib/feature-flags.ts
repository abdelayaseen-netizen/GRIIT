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
} as const;

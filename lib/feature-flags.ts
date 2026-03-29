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

// ============================================
// PRO GATES (limits align with FREE_LIMITS)
// ============================================

export const GATES = {
  MAX_FREE_ACTIVE_CHALLENGES: "MAX_FREE_ACTIVE_CHALLENGES",
  GPS_VERIFICATION: "GPS_VERIFICATION",
  LEADERBOARD_ACCESS: "LEADERBOARD_ACCESS",
  TEAMS_ACCESS: "TEAMS_ACCESS",
  HEART_RATE_VERIFICATION: "HEART_RATE_VERIFICATION",
} as const;

export const FREE_TIER = {
  MAX_FREE_ACTIVE_CHALLENGES: FREE_LIMITS.MAX_ACTIVE_CHALLENGES,
  GPS_VERIFICATION: false,
  LEADERBOARD_ACCESS: false,
  TEAMS_ACCESS: false,
  HEART_RATE_VERIFICATION: false,
} as const;

export const PRO_TIER = {
  MAX_FREE_ACTIVE_CHALLENGES: Infinity,
  GPS_VERIFICATION: true,
  LEADERBOARD_ACCESS: true,
  TEAMS_ACCESS: true,
  HEART_RATE_VERIFICATION: true,
} as const;

export type GateKey = keyof typeof GATES;

/** Returns true if the feature is allowed for the given Pro status. */
export function checkGate(gate: GateKey, isPro: boolean): boolean {
  if (isPro) {
    if (gate === "MAX_FREE_ACTIVE_CHALLENGES") return true;
    return PRO_TIER[gate as keyof typeof PRO_TIER] === true;
  }
  if (gate === "MAX_FREE_ACTIVE_CHALLENGES") {
    return true;
  }
  switch (gate) {
    case "GPS_VERIFICATION":
      return FREE_TIER.GPS_VERIFICATION;
    case "LEADERBOARD_ACCESS":
      return FREE_TIER.LEADERBOARD_ACCESS;
    case "TEAMS_ACCESS":
      return FREE_TIER.TEAMS_ACCESS;
    case "HEART_RATE_VERIFICATION":
      return FREE_TIER.HEART_RATE_VERIFICATION;
    default:
      return false;
  }
}

/** Human-readable reason for showing the paywall when a gate blocks the user. */
export function getPaywallTrigger(gate: GateKey): string {
  switch (gate) {
    case "MAX_FREE_ACTIVE_CHALLENGES":
      return "Multiple active challenges are a Pro feature.";
    case "GPS_VERIFICATION":
      return "GPS verification is a Pro feature.";
    case "LEADERBOARD_ACCESS":
      return "Leaderboards are a Pro feature.";
    case "TEAMS_ACCESS":
      return "Teams are a Pro feature.";
    case "HEART_RATE_VERIFICATION":
      return "Heart rate verification is a Pro feature.";
    default:
      return "This feature is available with Pro.";
  }
}

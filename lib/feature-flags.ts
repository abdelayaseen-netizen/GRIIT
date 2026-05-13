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
  /** PR#3: tap a proof photo in feed/profile → opens ImageViewerModal fullscreen. */
  PR3_IMAGE_VIEWER: true,
  /** PR#3: dedupe FeedCardHeader (drop taskName) and remove "Day X of Y" label. */
  PR3_FEED_DEDUPE: true,
  /** PR#3: hide WeekStrip and DailyBonus when streak === 0. */
  PR3_ZERO_STATE_GATES: true,
  /** PR#3: instrument home_state_viewed analytics event. */
  PR3_HOME_STATE_ANALYTICS: true,
  /** PR#5: profile screen redesign — avatar ring + identity meta + tier pill, replaces stats grid header. */
  PR5_PROFILE_HERO: true,
  /** PR#5: replace 4-tile stats grid with counts row + streak hero card. */
  PR5_STREAK_HERO_CARD: true,
  /** PR#5: trophy rail (earned + next-locked badges) above tab strip. */
  PR5_TROPHY_RAIL: true,
  /** PR#5: empty-zone replaces 3-tab strip when user has 0 posts and 0 badges. */
  PR5_EMPTY_ZONE: true,
  /** PR#5: instrument profile_state_viewed analytics event. */
  PR5_PROFILE_STATE_ANALYTICS: true,
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

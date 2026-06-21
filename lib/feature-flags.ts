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
  /**
   * Run goal-type config in the Add-task sheet (goal type, target, tracking
   * mode). Off until the backend goal_type/tracking_mode schema lands —
   * keeping it off avoids letting users set run goals that don't persist.
   */
  RUN_GOAL_CONFIG: false,
  /**
   * New 9-screen onboarding (OnboardingFlowV2). Off until verified on device.
   * When false, app/onboarding/index.tsx renders the existing OnboardingFlow.
   */
  ONBOARDING_V2: false,
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

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
  /**
   * Daylight v3: gates the Home "secured" transition on real server-side
   * verification confirmation. Default false — completeTask() still calls the
   * real server, but the celebration shows immediately on success rather than
   * waiting for an explicit verification ack. Set true when server returns a
   * verified=true field from checkins.complete.
   * See BLOCKERS.md B1.
   */
  REAL_VERIFICATION: false,
  /**
   * Daylight v3: gates the streak-freeze action on server-enforced session
   * confirmation. Default false — useFreeze mutation is called and succeeds or
   * errors; no deceptive local success. Set true when server enforces the freeze
   * within the at-risk session window.
   * See BLOCKERS.md B2.
   */
  FREEZE_SERVER_ENFORCED: false,
  /**
   * When false, app/task/run.tsx (legacy GPS/treadmill screen) shows a redirect.
   * Keep false until device-verified parity with task/complete.tsx is confirmed and
   * old push-notification deep-links are rotated. See BLOCKERS.md B-02.
   */
  LEGACY_RUN_SCREEN: false,
  /**
   * When false, app/task/checkin.tsx (legacy location-session screen) shows a redirect.
   * Keep false — setUserLocation gate is broken in the unified screen (see BLOCKERS.md B-01).
   */
  LEGACY_CHECKIN_SCREEN: false,
  /**
   * Journal tag chips (Mood / Wins / Photo). Not yet functional — gate until implemented.
   * See BLOCKERS.md B-04.
   */
  JOURNAL_TAGS: false,
  /**
   * SHIP_TASK_FLOW: universal Start arming step for every task type (photo, run, workout,
   * journal, counter/reading/water, timer). Simple/manual skip arming.
   * Gated to false during Phase 2 implementation; flip to true when ReadyCard ships.
   */
  TASK_START_ARMING: true,
  /**
   * Workout structured mode (sets-and-reps form). The "Add exercise" tile in
   * TaskWorkoutBody has no onPress when mode="structured". Parent always passes
   * mode="simple" so this is dormant. Gate here for Phase 5 audit transparency.
   */
  WORKOUT_STRUCTURED: false,
  /**
   * Hardcoded completion rewards: points subtitle (`+N points`) and the random
   * variable-reward chip ("2x BONUS", "Streak shield earned", etc.).
   * The storyboard specifies streak-only — no points are shown. These mechanics
   * may become real server-driven rewards later. Keep false until the backend
   * returns real values. See CLEANUP_LOG.md item 1.
   */
  COMPLETION_REWARDS: false,
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

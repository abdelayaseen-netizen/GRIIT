import { FREE_LIMITS, PREMIUM_FEATURES } from "./feature-flags";

/**
 * Premium subscription utilities.
 *
 * CURRENT STATE: Always returns free tier (no payment integration yet).
 *
 * TO ENABLE PREMIUM:
 * 1. Integrate RevenueCat or Stripe
 * 2. Store subscription status in user profile (premiumStatus field)
 * 3. Replace isPremium() with real check against profile.premiumStatus
 * 4. Wire limit checks into UI with PremiumUpgradePrompt where limits are hit
 */

// ---- Core check ----

export function isPremium(): boolean {
  // TODO: Replace with real subscription check
  // Example: return userProfile.premiumStatus === 'premium' || userProfile.premiumStatus === 'trial';
  return false;
}

// ---- Limit checks ----

export function canJoinChallenge(currentActiveCount: number): { allowed: boolean; limit: number } {
  if (isPremium()) return { allowed: true, limit: Infinity };
  return {
    allowed: currentActiveCount < FREE_LIMITS.MAX_ACTIVE_CHALLENGES,
    limit: FREE_LIMITS.MAX_ACTIVE_CHALLENGES,
  };
}

export function canCreateChallenge(currentCreatedCount: number): { allowed: boolean; limit: number } {
  if (isPremium()) return { allowed: true, limit: Infinity };
  return {
    allowed: currentCreatedCount < FREE_LIMITS.MAX_CREATED_CHALLENGES,
    limit: FREE_LIMITS.MAX_CREATED_CHALLENGES,
  };
}

export function canSendRespect(dailySentCount: number): { allowed: boolean; limit: number } {
  if (isPremium()) return { allowed: true, limit: Infinity };
  return {
    allowed: dailySentCount < FREE_LIMITS.MAX_DAILY_RESPECTS,
    limit: FREE_LIMITS.MAX_DAILY_RESPECTS,
  };
}

export function canSendNudge(dailySentCount: number): { allowed: boolean; limit: number } {
  if (isPremium()) return { allowed: true, limit: Infinity };
  return {
    allowed: dailySentCount < FREE_LIMITS.MAX_DAILY_NUDGES,
    limit: FREE_LIMITS.MAX_DAILY_NUDGES,
  };
}

export function isFeatureAvailable(feature: keyof typeof PREMIUM_FEATURES): boolean {
  if (isPremium()) return true;
  return PREMIUM_FEATURES[feature];
}

// ---- Premium surfaces (for future reference) ----
// These are the places in the app where premium gating will plug in:
//
// 1. Join challenge → canJoinChallenge() → show upgrade prompt if at limit
// 2. Create challenge → canCreateChallenge() → show upgrade prompt if at limit
// 3. Respect/nudge → canSendRespect/canSendNudge() → show "Upgrade for unlimited"
// 4. Advanced analytics → isFeatureAvailable('ADVANCED_ANALYTICS') → gate screen
// 5. Premium challenge packs → isFeatureAvailable('PREMIUM_PACKS') → gate in discover
// 6. Integrations (Strava, etc.) → isFeatureAvailable('INTEGRATIONS') → gate in settings
// 7. Chat → isFeatureAvailable('CHAT') → already gated by FLAGS.CHAT_ENABLED
// 8. Profile badge → isFeatureAvailable('PREMIUM_BADGE') → show badge on profile

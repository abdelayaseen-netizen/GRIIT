import { FREE_LIMITS, PREMIUM_FEATURES } from "./feature-flags";

/** In-memory subscription state set by the app when profile is loaded. */
let _subscriptionStatus: string | null = null;
let _subscriptionExpiry: string | null = null;

/**
 * Set subscription state from profile. Call when user profile is loaded (e.g. from getStats or profiles.get).
 */
export function setSubscriptionState(
  status: string | null | undefined,
  expiry: string | null | undefined
): void {
  _subscriptionStatus = status ?? null;
  _subscriptionExpiry = expiry ?? null;
}

// ---- Core check ----

/**
 * Returns true if the user has an active premium or trial subscription.
 * Reads from state set by setSubscriptionState(); when not set, returns false.
 */
export function isPremium(): boolean {
  if (_subscriptionStatus !== "premium" && _subscriptionStatus !== "trial") return false;
  if (!_subscriptionExpiry) return _subscriptionStatus === "premium";
  const expiry = new Date(_subscriptionExpiry);
  return !Number.isNaN(expiry.getTime()) && expiry > new Date();
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

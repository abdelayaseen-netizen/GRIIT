/**
 * Feature gates by subscription level.
 * Maps feature keys to required access level. Easy to extend when adding new premium features.
 */

export type SubscriptionStatus = "free" | "premium" | "trial";

export const FEATURE_GATES: Record<string, SubscriptionStatus> = {
  basic_challenges: "free",
  streaks: "free",
  leaderboard: "free",
  daily_reminder: "free",
  accountability: "free",
  exclusive_challenges: "premium",
  unlimited_freezes: "premium",
  advanced_analytics: "premium",
  premium_packs: "premium",
  premium_badge: "premium",
  chat: "premium",
  integrations: "premium",
  unlimited_challenges: "premium",
  unlimited_social: "premium",
} as const;

export type FeatureKey = keyof typeof FEATURE_GATES;

/**
 * Returns true if the given subscription state has access to the feature.
 * Pass subscription_status and subscription_expiry from the user's profile.
 */
export function canAccess(
  featureKey: FeatureKey,
  subscriptionStatus: SubscriptionStatus | string | null | undefined,
  subscriptionExpiry: string | null | undefined
): boolean {
  const required = FEATURE_GATES[featureKey as keyof typeof FEATURE_GATES];
  if (!required || required === "free") return true;

  if (subscriptionStatus !== "premium" && subscriptionStatus !== "trial") return false;

  if (!subscriptionExpiry) return subscriptionStatus === "premium";

  const expiry = new Date(subscriptionExpiry);
  return !Number.isNaN(expiry.getTime()) && expiry > new Date();
}

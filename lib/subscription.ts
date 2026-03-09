/**
 * Subscription service: RevenueCat integration and backend sync.
 * When RevenueCat is configured, syncs subscription status to the backend profile.
 * Placeholder product IDs: griit_premium_monthly, griit_premium_annual.
 * RevenueCat (react-native-purchases) is not loaded in Expo Go to avoid native module crashes.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { setSubscriptionState } from "./premium";
import { trpcMutate } from "./trpc";

/** Lazy load Purchases so we never load it in Expo Go (avoids ReactFabric crash). */
function getPurchases(): { default: { configure: (opts: unknown) => void; getCustomerInfo: () => Promise<unknown>; addCustomerInfoUpdateListener: (cb: (info: unknown) => void) => () => void; restorePurchases: () => Promise<unknown> } } | null {
  if (Platform.OS === "web") return null;
  if (Constants.appOwnership === "expo") return null; // Expo Go - native modules not available
  try {
    return require("react-native-purchases");
  } catch {
    return null;
  }
}

const REVENUECAT_API_KEY_APPLE = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? "";
const REVENUECAT_API_KEY_GOOGLE = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? "";

export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: "griit_premium_monthly",
  annual: "griit_premium_annual",
} as const;

export type SubscriptionStatus = "free" | "premium" | "trial";

let purchaserInfoListener: (() => void) | null = null;

function mapEntitlementToStatus(expirationDate: string | null): SubscriptionStatus {
  if (!expirationDate) return "free";
  const expiry = new Date(expirationDate);
  if (Number.isNaN(expiry.getTime())) return "free";
  return expiry > new Date() ? "premium" : "free";
}

async function syncSubscriptionToBackend(params: {
  subscription_status: SubscriptionStatus;
  subscription_expiry: string | null;
  subscription_platform: "ios" | "android" | null;
  subscription_product_id: string | null;
}): Promise<void> {
  try {
    await trpcMutate("profiles.update", params);
  } catch {
    // Non-blocking; user can retry or status will sync on next launch
  }
}

/**
 * Initialize RevenueCat and set up listener to sync subscription to backend.
 * Call once when user is authenticated. No-op if API keys are not set.
 */
export async function initSubscription(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const appleKey = REVENUECAT_API_KEY_APPLE.trim();
  const googleKey = REVENUECAT_API_KEY_GOOGLE.trim();
  if (!appleKey && !googleKey) return;

  const purchasesModule = getPurchases();
  if (!purchasesModule?.default) return;

  try {
    const Purchases = purchasesModule.default;
    Purchases.configure({
      apiKey: Platform.OS === "ios" ? appleKey : googleKey,
      appUserID: userId,
    });

    const info = (await Purchases.getCustomerInfo()) as { entitlements?: { active?: Record<string, { expirationDate?: string | null; productIdentifier?: string }> } };
    const entitlement = info.entitlements?.active?.["premium"];
    const status = entitlement ? mapEntitlementToStatus(expirationDate(entitlement)) : "free";
    const expiry = entitlement ? expirationDate(entitlement) : null;
    setSubscriptionState(status, expiry);
    await syncSubscriptionToBackend({
      subscription_status: status,
      subscription_expiry: expiry,
      subscription_platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : null,
      subscription_product_id: entitlement?.productIdentifier ?? null,
    });

    purchaserInfoListener = Purchases.addCustomerInfoUpdateListener(async (infoArg: unknown) => {
      const info = infoArg as { entitlements?: { active?: Record<string, { expirationDate?: string | null; productIdentifier?: string }> } };
      const ent = info.entitlements?.active?.["premium"];
      const st = ent ? mapEntitlementToStatus(expirationDate(ent)) : "free";
      const exp = ent ? expirationDate(ent) : null;
      setSubscriptionState(st, exp);
      await syncSubscriptionToBackend({
        subscription_status: st,
        subscription_expiry: exp,
        subscription_platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : null,
        subscription_product_id: ent?.productIdentifier ?? null,
      });
    });
  } catch {
    // RevenueCat not linked or config error — keep free tier
  }
}

function expirationDate(entitlement: { expirationDate?: string | null }): string | null {
  return entitlement?.expirationDate ?? null;
}

/**
 * Stop listening and clear state. Call on sign out.
 */
export function clearSubscription(): void {
  setSubscriptionState(null, null);
  if (purchaserInfoListener) {
    purchaserInfoListener();
    purchaserInfoListener = null;
  }
}

/**
 * Restore purchases (e.g. after reinstall). Syncs result to backend.
 */
export async function restorePurchases(): Promise<{ success: boolean }> {
  if (Platform.OS === "web") return { success: false };
  const purchasesModule = getPurchases();
  if (!purchasesModule?.default) return { success: false };
  try {
    const Purchases = purchasesModule.default;
    const info = (await Purchases.restorePurchases()) as { entitlements?: { active?: Record<string, { expirationDate?: string | null; productIdentifier?: string }> } };
    const entitlement = info.entitlements?.active?.["premium"];
    const status = entitlement ? mapEntitlementToStatus(expirationDate(entitlement)) : "free";
    const expiry = entitlement ? expirationDate(entitlement) : null;
    setSubscriptionState(status, expiry);
    await syncSubscriptionToBackend({
      subscription_status: status,
      subscription_expiry: expiry,
      subscription_platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : null,
      subscription_product_id: entitlement?.productIdentifier ?? null,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

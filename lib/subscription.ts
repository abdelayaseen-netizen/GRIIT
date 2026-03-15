/**
 * RevenueCat subscription: init, purchase, restore, sync to Supabase.
 * Uses EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.
 * In Expo Go, Purchases is not loaded to avoid native module crashes.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { setSubscriptionState } from "./premium";
import { supabase } from "./supabase";

const ENTITLEMENT_ID = "premium";

/** Remove function for RevenueCat customer info listener; null when RC not available (web/Expo Go). */
let purchaserInfoListener: (() => void) | null = null;

/** Minimal types for RevenueCat (avoid importing full SDK in Expo Go). */
export type CustomerInfo = {
  entitlements: { active: Record<string, { expirationDate?: string | null }> };
};
export type PurchasesPackage = {
  identifier: string;
  packageType: string;
  product: { priceString: string; title?: string };
};
export type PurchasesOffering = {
  identifier: string;
  availablePackages: PurchasesPackage[];
};

function getPurchases(): typeof import("react-native-purchases") | null {
  if (Platform.OS === "web") return null;
  if (Constants.appOwnership === "expo") return null;
  try {
    return require("react-native-purchases");
  } catch {
    return null;
  }
}

/**
 * Initialize RevenueCat. Call once after auth. Pass Supabase user ID as appUserID.
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
  const apiKey =
    Platform.OS === "ios"
      ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "").trim() ||
        (process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? "").trim()
      : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "").trim() ||
        (process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? "").trim();

  if (!apiKey) {
    if (__DEV__) {
      console.warn("[RevenueCat] No API key for platform:", Platform.OS);
    }
    return;
  }

  const Purchases = getPurchases();
  if (!Purchases?.default) return;

  try {
    const RC = Purchases.default;
    const RCAny = RC as typeof RC & { setLogLevel?: (level: number) => void };
    const PurchasesModule = Purchases as typeof Purchases & { LOG_LEVEL?: { DEBUG: number } };
    if (__DEV__ && PurchasesModule.LOG_LEVEL?.DEBUG != null && typeof RCAny.setLogLevel === "function") {
      RCAny.setLogLevel(PurchasesModule.LOG_LEVEL.DEBUG);
    }
    await RC.configure({ apiKey, appUserID: userId });

    const info = (await RC.getCustomerInfo()) as CustomerInfo;
    const premium = info?.entitlements?.active?.[ENTITLEMENT_ID] != null;
    setSubscriptionState(premium ? "premium" : "free", info?.entitlements?.active?.[ENTITLEMENT_ID]?.expirationDate ?? null);
    notifySubscriptionChange(premium);
    await syncSubscriptionToSupabase(userId, info);

    RC.addCustomerInfoUpdateListener((info) => {
      const updatedInfo = info as CustomerInfo;
      const ent = updatedInfo?.entitlements?.active?.[ENTITLEMENT_ID];
      const isPremium = ent != null;
      setSubscriptionState(isPremium ? "premium" : "free", ent?.expirationDate ?? null);
      notifySubscriptionChange(isPremium);
      void syncSubscriptionToSupabase(userId, updatedInfo);
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[RevenueCat] configure failed:", err instanceof Error ? err.message : err);
    }
  }
}

/** Sync RevenueCat status to Supabase profile (user_id). */
export async function syncSubscriptionToSupabase(userId: string, customerInfo: CustomerInfo | null): Promise<void> {
  if (!customerInfo) return;
  const entitlement = customerInfo.entitlements?.active?.[ENTITLEMENT_ID];
  const status = entitlement ? "premium" : "free";
  const expiry = entitlement?.expirationDate ?? null;
  try {
    await supabase
      .from("profiles")
      .update({
        subscription_status: status,
        subscription_expiry: expiry,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch (err) {
    if (__DEV__) {
      console.warn("[RevenueCat] sync to Supabase failed:", err instanceof Error ? err.message : err);
    }
  }
}

/** Check if user has active premium entitlement. */
export async function checkPremiumStatus(): Promise<boolean> {
  const Purchases = getPurchases();
  if (!Purchases?.default) return false;
  try {
    const customerInfo = await Purchases.default.getCustomerInfo();
    return customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] != null;
  } catch {
    return false;
  }
}

/** Get current offerings (pricing packages). */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  const Purchases = getPurchases();
  if (!Purchases?.default) return null;
  try {
    const RC = Purchases.default as { getOfferings?: () => Promise<{ current?: PurchasesOffering | null }> };
    const offerings = await RC.getOfferings?.();
    return offerings?.current ?? null;
  } catch {
    return null;
  }
}

/** Purchase a package. Returns success and optional customerInfo or error. */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  const Purchases = getPurchases();
  if (!Purchases?.default) return { success: false, error: "Purchases not available" };
  try {
    const RC = Purchases.default as { purchasePackage?: (p: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo }> };
    const result = await RC.purchasePackage?.(pkg);
    const customerInfo = result?.customerInfo;
    const isPremium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] != null;
    return { success: isPremium, customerInfo: customerInfo ?? undefined };
  } catch (err: unknown) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { success: false, error: "cancelled" };
    if (__DEV__) console.warn("[RevenueCat] purchase error:", e);
    return { success: false, error: e?.message ?? "Purchase failed" };
  }
}

/** Restore purchases. */
export async function restorePurchases(): Promise<{ success: boolean; isPremium: boolean }> {
  const Purchases = getPurchases();
  if (!Purchases?.default) return { success: false, isPremium: false };
  try {
    const customerInfo = await Purchases.default.restorePurchases();
    const isPremium = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] != null;
    return { success: true, isPremium };
  } catch (err) {
    if (__DEV__) console.warn("[RevenueCat] restore error:", err);
    return { success: false, isPremium: false };
  }
}

/** Get full customer info. */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const Purchases = getPurchases();
  if (!Purchases?.default) return null;
  try {
    return await Purchases.default.getCustomerInfo();
  } catch {
    return null;
  }
}

export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: "griit_premium_monthly",
  annual: "griit_premium_annual",
} as const;

export type SubscriptionStatus = "free" | "premium" | "trial";

type SubscriptionChangeCallback = (isPremium: boolean) => void;
const subscriptionChangeCallbacks = new Set<SubscriptionChangeCallback>();

/** Register a callback when RevenueCat customer info updates (e.g. after purchase). */
export function addSubscriptionChangeListener(cb: SubscriptionChangeCallback): () => void {
  subscriptionChangeCallbacks.add(cb);
  return () => subscriptionChangeCallbacks.delete(cb);
}

function notifySubscriptionChange(isPremium: boolean): void {
  subscriptionChangeCallbacks.forEach((cb) => cb(isPremium));
}

/** Legacy alias for AppContext. */
export async function initSubscription(userId: string): Promise<void> {
  purchaserInfoListener = null;
  await initializeRevenueCat(userId);
}

export function clearSubscription(): void {
  setSubscriptionState(null, null);
  try {
    if (typeof purchaserInfoListener !== "undefined" && purchaserInfoListener) {
      purchaserInfoListener();
      purchaserInfoListener = null;
    }
  } catch {
    // purchaserInfoListener not set or RevenueCat not available (web/Expo Go)
  }
}

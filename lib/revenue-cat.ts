/**
 * RevenueCat integration for GRIIT Pro subscriptions.
 * Initialize with Supabase user ID; use placeholder API keys (Yaseen will replace).
 */
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import type { CustomerInfo } from "react-native-purchases";

function rcIosKey(): string {
  return (
    process.env.EXPO_PUBLIC_RC_IOS_API_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
    ""
  ).trim();
}

function rcAndroidKey(): string {
  return (
    process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
    ""
  ).trim();
}

let configured = false;

/**
 * Initialize RevenueCat with the current app user ID (Supabase user id).
 * Call once on app startup after user is known.
 * Silently fails if API keys are not configured (development mode).
 */
export function configureRevenueCat(appUserId: string | null): void {
  if (configured) return;
  if (!appUserId) return;
  
  const apiKey = Platform.select({
    ios: rcIosKey(),
    android: rcAndroidKey(),
    default: rcIosKey(),
  });
  
  if (!apiKey || apiKey.startsWith("REVENUECAT_") || apiKey.length < 10) {
    if (__DEV__) console.warn("[RevenueCat] Skipping configuration — no valid API key");
    return;
  }
  
  try {
    Purchases.configure({ apiKey, appUserID: appUserId });
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    configured = true;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] Configuration failed:", e);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info;
  } catch (e) {
    // error swallowed — handle in UI
    return null;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    if (__DEV__) {
      console.error("[RevenueCat] Failed to fetch offerings:", error);
    }
    return null;
  }
}

export async function purchasePackage(pkg: Parameters<typeof Purchases.purchasePackage>[0]) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true as const, customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return { success: false as const, cancelled: true as const };
    }
    return { success: false as const, error: err.message ?? String(e) };
  }
}

export async function checkSubscriptionStatus() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    return { isActive, customerInfo };
  } catch (error) {
    if (__DEV__) {
      console.error("[RevenueCat] Failed to check status:", error);
    }
    return { isActive: false, customerInfo: null };
  }
}

export async function purchasePro(): Promise<{ success: boolean; error?: string; price?: string }> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.availablePackages?.find(
        (p: { packageType: string; identifier: string }) =>
          p.packageType === "MONTHLY" || p.identifier.toLowerCase().includes("monthly")
      ) ?? offerings.current?.availablePackages?.[0];
    if (!pkg) {
      return { success: false, error: "No subscription package available." };
    }
    const price =
      (pkg as { product?: { priceString?: string } }).product?.priceString ??
      (pkg as { localizedPriceString?: string }).localizedPriceString;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro = customerInfo?.entitlements?.active?.pro != null;
    return { success: hasPro, price };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message?.toLowerCase?.().includes("cancelled") || (e as { userCancelled?: boolean })?.userCancelled) {
      return { success: false, error: "Purchase cancelled." };
    }
    return { success: false, error: message || "Purchase failed." };
  }
}

export async function restorePurchases(): Promise<{ success: boolean }> {
  try {
    const info = await Purchases.restorePurchases();
    const hasPro = info?.entitlements?.active?.pro != null;
    return { success: hasPro };
  } catch (e) {
    // error swallowed — handle in UI
    return { success: false };
  }
}

export async function isProUser(): Promise<boolean> {
  try {
    const info = await getCustomerInfo();
    return (info?.entitlements?.active?.pro) != null;
  } catch {
    return false;
  }
}

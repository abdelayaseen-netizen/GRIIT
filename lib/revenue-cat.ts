/**
 * RevenueCat integration for GRIIT Pro subscriptions.
 * Initialize with Supabase user ID; use placeholder API keys (Yaseen will replace).
 */
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

const REVENUECAT_IOS_KEY = "REVENUECAT_IOS_KEY";
const REVENUECAT_ANDROID_KEY = "REVENUECAT_ANDROID_KEY";

let configured = false;

/**
 * Initialize RevenueCat with the current app user ID (Supabase user id).
 * Call once on app startup after user is known.
 */
export function configureRevenueCat(appUserId: string | null): void {
  if (!appUserId) return;
  try {
    const apiKey = Platform.select({
      ios: REVENUECAT_IOS_KEY,
      android: REVENUECAT_ANDROID_KEY,
      default: REVENUECAT_IOS_KEY,
    });
    Purchases.configure({ apiKey, appUserID: appUserId });
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    configured = true;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] configure failed:", e);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] getCustomerInfo failed:", e);
    return null;
  }
}

export async function purchasePro(): Promise<{ success: boolean; error?: string }> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.availablePackages?.find(
        (p) => p.packageType === "MONTHLY" || p.identifier.toLowerCase().includes("monthly")
      ) ?? offerings.current?.availablePackages?.[0];
    if (!pkg) {
      return { success: false, error: "No subscription package available." };
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro = customerInfo?.entitlements?.active?.pro != null;
    return { success: hasPro };
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
    if (__DEV__) console.warn("[RevenueCat] restore failed:", e);
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

/**
 * RevenueCat — subscriptions (GRIIT Pro). Keys from EXPO_PUBLIC_* env only.
 */
import Purchases, {
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from "react-native-purchases";
import { Platform } from "react-native";

const IOS_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.trim() ||
  process.env.EXPO_PUBLIC_RC_IOS_API_KEY?.trim() ||
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() ||
  "";
const ANDROID_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.trim() ||
  process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY?.trim() ||
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() ||
  "";

let configured = false;

export function initializePurchases(userId?: string): void {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    if (__DEV__) console.warn("[RevenueCat] No API key set — paywall will not function");
    return;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    if (!configured) {
      Purchases.configure({ apiKey, appUserID: userId ?? null });
      configured = true;
    } else if (userId) {
      void Purchases.logIn(userId).catch((e) => {
        if (__DEV__) console.error("[RevenueCat] logIn failed:", e);
      });
    }
  } catch (e) {
    if (__DEV__) console.error("[RevenueCat] configure failed:", e);
  }
}

/** @deprecated Use initializePurchases */
export const configureRevenueCat = initializePurchases;

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    if (__DEV__) console.error("[RevenueCat] getOfferings failed:", e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  cancelled?: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled) return { success: false, cancelled: true };
    if (__DEV__) console.error("[RevenueCat] purchasePackage failed:", e);
    return { success: false, error: err?.message ?? "Purchase failed. Please try again." };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (__DEV__) console.error("[RevenueCat] restorePurchases failed:", e);
    return { success: false, error: err?.message ?? "No purchases found to restore." };
  }
}

export async function checkEntitlement(entitlementId: string = "pro"): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (e) {
    if (__DEV__) console.error("[RevenueCat] checkEntitlement failed:", e);
    return false;
  }
}

export async function isProUser(): Promise<boolean> {
  return checkEntitlement("pro");
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    if (__DEV__) console.error("[RevenueCat] getCustomerInfo failed:", e);
    return null;
  }
}

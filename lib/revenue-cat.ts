/**
 * RevenueCat — subscriptions (GRIIT Pro). Keys from EXPO_PUBLIC_* env only.
 */
import Purchases, {
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

/** Native store + Purchases are not available inside Expo Go — skip all RC calls. */
export const isExpoGo = Constants.appOwnership === "expo";

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
let skippedConfigLogged = false;
let skippedExpoGoLogged = false;

export function initializePurchases(userId?: string): void {
  if (isExpoGo) {
    if (__DEV__ && !skippedExpoGoLogged) {
      console.warn("[RevenueCat] Skipping — not available in Expo Go");
      skippedExpoGoLogged = true;
    }
    return;
  }
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    if (!skippedConfigLogged) {
      console.warn("[RevenueCat] Skipped — no API key configured");
      skippedConfigLogged = true;
    }
    return;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    if (!configured) {
      Purchases.configure({ apiKey, appUserID: userId ?? null });
      configured = true;
    } else if (userId) {
      void Purchases.logIn(userId).catch((e) => {
        if (__DEV__) console.warn("[RevenueCat] logIn failed:", e);
      });
    }
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] configure failed:", e);
  }
}

/** @deprecated Use initializePurchases */
export const configureRevenueCat = initializePurchases;

export async function getOfferings() {
  if (isExpoGo || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] getOfferings failed:", e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  cancelled?: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (isExpoGo || !configured) {
    return { success: false, error: "Purchases unavailable right now." };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled) return { success: false, cancelled: true };
    if (__DEV__) console.warn("[RevenueCat] purchasePackage failed:", e);
    return { success: false, error: err?.message ?? "Purchase failed. Please try again." };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (isExpoGo || !configured) {
    return { success: false, error: "Purchases unavailable right now." };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (__DEV__) console.warn("[RevenueCat] restorePurchases failed:", e);
    return { success: false, error: err?.message ?? "No purchases found to restore." };
  }
}

export async function checkEntitlement(entitlementId: string = "GRIIT Pro"): Promise<boolean> {
  if (isExpoGo || !configured) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] checkEntitlement failed:", e);
    return false;
  }
}

export async function isProUser(): Promise<boolean> {
  return checkEntitlement("GRIIT Pro");
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (isExpoGo || !configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    if (__DEV__) console.warn("[RevenueCat] getCustomerInfo failed:", e);
    return null;
  }
}

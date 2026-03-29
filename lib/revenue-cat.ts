/**
 * RevenueCat — thin re-export layer.
 * All logic lives in lib/subscription.ts. This file exists for import convenience.
 */
import Constants from "expo-constants";

export {
  initializeRevenueCat as initializePurchases,
  initializeRevenueCat as configureRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus as isProUser,
  getCustomerInfo,
} from "./subscription";

export const isExpoGo = Constants.appOwnership === "expo";

/** Check specific entitlement — delegates to subscription.ts for active premium. */
export async function checkEntitlement(_entitlementId?: string): Promise<boolean> {
  const { checkPremiumStatus } = await import("./subscription");
  return checkPremiumStatus();
}

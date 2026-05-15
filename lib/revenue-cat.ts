/**
 * RevenueCat — thin re-export layer.
 * All logic lives in lib/subscription.ts. This file exists for import convenience.
 */
export {
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus as isProUser,
} from "./subscription";

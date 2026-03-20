/**
 * Augments the real SDK where strict bundler resolution picks this file.
 * Keep in sync with react-native-purchases public API used in lib/revenue-cat.ts.
 */
declare module "react-native-purchases" {
  export interface CustomerInfo {
    entitlements: {
      active: Record<string, { expirationDate: string | null; productIdentifier?: string }>;
    };
  }

  export interface PurchasesPackage {
    packageType: string;
    identifier: string;
  }

  export const LOG_LEVEL: { VERBOSE: number; DEBUG: number; INFO: number; WARN: number; ERROR: number };

  interface PurchasesStatic {
    configure(options: { apiKey: string; appUserID: string }): void;
    setLogLevel(level: number): void;
    getCustomerInfo(): Promise<CustomerInfo>;
    getOfferings(): Promise<{
      current?: { availablePackages: PurchasesPackage[] } | null;
    }>;
    purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo }>;
    addCustomerInfoUpdateListener(
      listener: (info: {
        entitlements?: { active?: Record<string, { expirationDate?: string | null; productIdentifier?: string }> };
      }) => void
    ): () => void;
    restorePurchases(): Promise<{
      entitlements: { active: Record<string, { expirationDate: string | null; productIdentifier?: string }> };
    }>;
  }

  const Purchases: PurchasesStatic;
  export default Purchases;
}

declare module "react-native-purchases" {
  const Purchases: {
    configure(options: { apiKey: string; appUserID: string }): void;
    getCustomerInfo(): Promise<{
      entitlements: { active: Record<string, { expirationDate: string | null; productIdentifier?: string }> };
    }>;
    addCustomerInfoUpdateListener(
      listener: (info: {
        entitlements?: { active?: Record<string, { expirationDate?: string | null; productIdentifier?: string }> };
      }) => void
    ): () => void;
    restorePurchases(): Promise<{
      entitlements: { active: Record<string, { expirationDate: string | null; productIdentifier?: string }> };
    }>;
  };
  export default Purchases;
}

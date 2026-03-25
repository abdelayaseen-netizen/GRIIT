import { useRouter } from "expo-router";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";

/**
 * Subscription state and gate for premium features.
 * Use requirePremium(source) before performing a premium-only action.
 */
export function useSubscription() {
  const { isPremium, refreshPremiumStatus } = useApp();
  const router = useRouter();

  /**
   * If user has premium, returns true. Otherwise navigates to paywall with source and returns false.
   */
  function requirePremium(source: string): boolean {
    if (isPremium) return true;
    router.push({ pathname: ROUTES.PAYWALL as never, params: { source } } as never);
    return false;
  }

  return {
    isPremium,
    requirePremium,
    refreshPremiumStatus,
  };
}

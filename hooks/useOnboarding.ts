import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

/**
 * Guard: redirect to /onboarding when onboarding is not complete and user is not authenticated.
 * Authenticated returning users skip to home.
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const isComplete = useOnboardingStore((s) => s.isComplete);
  const { session } = useAuth();

  useEffect(() => {
    if (isComplete) return;
    if (session) {
      router.replace(ROUTES.TABS as never);
      return;
    }
    router.replace("/onboarding" as never);
  }, [isComplete, session, router]);
}

export function useOnboarding() {
  const isComplete = useOnboardingStore((s) => s.isComplete);
  return { isComplete };
}

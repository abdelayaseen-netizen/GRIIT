/**
 * AuthRedirector routing decision. Pure — no I/O.
 */

import { ROUTES } from "@/lib/routes";
import {
  type SessionKind,
  resolveCompletedLeaveHref,
  resolveOnboardingLaunch,
} from "@/lib/onboarding-v2-routing";

export type AuthRedirectDecision =
  | { action: "wait" }
  | { action: "stay" }
  | { action: "replace"; href: string };

export function resolveAuthRedirect(input: {
  sessionKind: SessionKind;
  onboardingCompleted: boolean | null;
  loading: boolean;
  profileChecked: boolean;
  inOnboarding: boolean;
  inAuth: boolean;
  onCreateProfile: boolean;
  inTabs: boolean;
  exitHref?: string | null;
}): AuthRedirectDecision {
  if (input.loading) return { action: "wait" };
  if (input.sessionKind !== "none" && !input.profileChecked) return { action: "wait" };

  const dest = resolveOnboardingLaunch({
    sessionKind: input.sessionKind,
    dbCompleted: input.onboardingCompleted,
  });

  if (dest === "home") {
    const href = resolveCompletedLeaveHref({
      inOnboarding: input.inOnboarding,
      inAuth: input.inAuth,
      onCreateProfile: input.onCreateProfile,
      inTabs: input.inTabs,
      exitHref: input.exitHref,
    });
    if (href) return { action: "replace", href };
    return { action: "stay" };
  }

  if (!input.inOnboarding && !input.inAuth) {
    return { action: "replace", href: ROUTES.ONBOARDING };
  }
  return { action: "stay" };
}

/** Spinner overlay. Same conditions as AuthRedirector in _layout.tsx. */
export function shouldShowAuthRedirectOverlay(input: {
  loading: boolean;
  hasSession: boolean;
  profileChecked: boolean;
}): boolean {
  return input.loading || (input.hasSession && !input.profileChecked);
}

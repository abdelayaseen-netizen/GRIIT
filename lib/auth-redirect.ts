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
  | { action: "retry" }
  | { action: "replace"; href: string };

export function resolveAuthRedirect(input: {
  sessionKind: SessionKind;
  onboardingCompleted: boolean | null;
  username?: string | null;
  /** Local ONBOARDING_COMPLETED — Home on fetch-null only. Never skips a known-new account. */
  cacheCompleted?: boolean;
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
    username: input.username,
  });

  const destOrCacheHome =
    dest === "retry" && input.cacheCompleted === true ? "home" : dest;

  if (destOrCacheHome === "home") {
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

  if (destOrCacheHome === "retry") {
    return { action: "retry" };
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

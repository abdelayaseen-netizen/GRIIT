import { ensureAnonymousSession } from "@/lib/anon-auth";
import { completeOnboardingV2 } from "@/components/onboarding/v2/completeOnboarding";

export type ExitOnboardingV2Result = { ok: true } | { ok: false; message: string };

/**
 * Every v2 exit: mint/reuse a guest session, then persist completion with
 * the tab we intend to land on so AuthRedirector cannot bounce to Home.
 */
export async function exitOnboardingV2(destination: string): Promise<ExitOnboardingV2Result> {
  const anon = await ensureAnonymousSession();
  if (anon.kind !== "ok") {
    return { ok: false, message: anon.message ?? "Could not start a guest session." };
  }
  await completeOnboardingV2({ destination });
  return { ok: true };
}

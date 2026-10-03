/**
 * AuthRedirector profile fetch: Promise.race + one retry.
 * Same timeout, retry, and field mapping as app/_layout.tsx.
 */

import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";
import { cacheOnboardingCompleted } from "@/lib/onboarding-completed-cache";
import { setKnownOnboardingCompleted } from "@/lib/onboarding-v2-routing";

export const PROFILE_CHECK_TIMEOUT_MS = 2500;

export type ProfileCheckRow = {
  user_id?: string;
  username?: string | null;
  onboarding_completed?: boolean;
  created_at?: string | null;
};

export type ProfileCheckOutcome = {
  hasProfile: boolean;
  onboardingCompleted: boolean | null;
  username: string | null;
  profileCreatedAt: string | null;
  cacheCompleted: boolean;
};

type TimedOut = { timedOut: true };

function fetchProfile(userId: string) {
  return supabase
    .from("profiles")
    .select("user_id, username, onboarding_completed, created_at")
    .eq("user_id", userId)
    .single()
    .then(
      ({
        data,
      }: {
        data: ProfileCheckRow | null;
      }) => data
    );
}

export function interpretProfileCheckResult(
  result: ProfileCheckRow | TimedOut | null
): ProfileCheckOutcome {
  if (result && typeof result === "object" && "timedOut" in result) {
    return {
      hasProfile: false,
      onboardingCompleted: null,
      username: null,
      profileCreatedAt: null,
      cacheCompleted: false,
    };
  }
  if (result === null) {
    return {
      hasProfile: false,
      onboardingCompleted: false,
      username: null,
      profileCreatedAt: null,
      cacheCompleted: false,
    };
  }
  const rawUsername = typeof result.username === "string" ? result.username.trim() : "";
  const hasValidProfile = rawUsername.length > 0;
  const dbDone = result?.onboarding_completed === true;
  return {
    hasProfile: hasValidProfile,
    onboardingCompleted: dbDone,
    username: hasValidProfile ? rawUsername : null,
    profileCreatedAt: result?.created_at ?? null,
    cacheCompleted: dbDone,
  };
}

export async function checkProfile(
  userId: string,
  retry = 0
): Promise<ProfileCheckOutcome> {
  const maxRetries = 1;
  const timedOut: TimedOut = { timedOut: true };
  try {
    const timeoutPromise = new Promise<TimedOut>((resolve) =>
      setTimeout(() => resolve(timedOut), PROFILE_CHECK_TIMEOUT_MS)
    );

    let result: ProfileCheckRow | TimedOut | null = await Promise.race([
      fetchProfile(userId),
      timeoutPromise,
    ]);

    if (result && typeof result === "object" && "timedOut" in result && retry < maxRetries) {
      result = await fetchProfile(userId);
    } else if (result === null && retry < maxRetries) {
      result = await fetchProfile(userId);
    }

    return interpretProfileCheckResult(result);
  } catch (err) {
    captureError(err, "AuthRedirectorCheckProfile");
    if (retry < maxRetries) {
      return checkProfile(userId, retry + 1);
    }
    return interpretProfileCheckResult(timedOut);
  }
}

/**
 * Username already implies onboarded but the flag is false.
 * Fire-and-forget — routing does not wait on this write.
 */
export async function selfHealOnboardingCompleted(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (error) {
      captureError(error, "selfHealOnboardingCompleted");
      return;
    }
    setKnownOnboardingCompleted(userId, true);
    void cacheOnboardingCompleted();
    console.info("[auth] self-healed onboarding_completed", userId);
  } catch (err) {
    captureError(err, "selfHealOnboardingCompleted");
  }
}

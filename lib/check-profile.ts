/**
 * AuthRedirector profile fetch: Promise.race + one retry.
 * Same timeout, retry, and field mapping as app/_layout.tsx.
 */

import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";

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
      profileCreatedAt: null,
      cacheCompleted: false,
    };
  }
  if (result === null) {
    return {
      hasProfile: false,
      onboardingCompleted: false,
      profileCreatedAt: null,
      cacheCompleted: false,
    };
  }
  const hasValidProfile = !!result && typeof result.username === "string" && result.username.trim().length > 0;
  const dbDone = result?.onboarding_completed === true;
  return {
    hasProfile: hasValidProfile,
    onboardingCompleted: dbDone,
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

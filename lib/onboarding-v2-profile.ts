import type { QueryClient } from "@tanstack/react-query";
import { isValidAccountUsername } from "@/lib/onboarding-v2-account-name";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken";

export function shouldRecheckUsername(input: {
  value: string;
  lastCheckedValue: string | null;
}): boolean {
  if (input.value.length < 3) return false;
  return input.lastCheckedValue !== input.value;
}

/** Disable only for taken/invalid, or while checking a value with no result yet. */
export function profileContinueDisabled(input: {
  saving: boolean;
  username: string;
  availability: UsernameAvailability;
  lastResultValue: string | null;
}): boolean {
  if (input.saving) return true;
  if (input.availability === "taken") return true;
  const user = normalizeOnboardingUsername(input.username);
  if (user.length >= 3 && !isValidAccountUsername(user)) return true;
  if (input.availability === "checking" && input.lastResultValue !== input.username) {
    return true;
  }
  return false;
}

/** Live username: lowercase, keep [a-z0-9_.] only. */
export function normalizeOnboardingUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
}

/** Profile tab + Home greeting caches. Prefix match. */
export const ONBOARDING_PROFILE_QUERY_KEYS: readonly (readonly string[])[] = [
  ["profiles", "getRecord"],
  ["profile"],
  ["home", "bootstrap"],
];

/**
 * Advance only after persist succeeds. A thrown write must leave the caller
 * on the same screen with field values intact.
 * After a successful write, invalidate profile caches before onContinue.
 */
export async function persistThenAdvance(
  persist: () => Promise<void>,
  onContinue: () => void,
  opts?: {
    queryClient?: QueryClient;
    afterPersist?: () => Promise<void>;
  }
): Promise<{ status: "advanced" } | { status: "stayed"; error: unknown }> {
  try {
    await persist();
  } catch (error) {
    return { status: "stayed", error };
  }
  if (opts?.queryClient) {
    await Promise.all(
      ONBOARDING_PROFILE_QUERY_KEYS.map((queryKey) =>
        opts.queryClient!.invalidateQueries({ queryKey: [...queryKey] })
      )
    );
  }
  if (opts?.afterPersist) await opts.afterPersist();
  onContinue();
  return { status: "advanced" };
}

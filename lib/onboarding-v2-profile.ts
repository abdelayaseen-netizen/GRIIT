import type { QueryClient } from "@tanstack/react-query";

/** Live username: lowercase, keep [a-z0-9_.] only. */
export function normalizeOnboardingUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
}

/** Profile tab + Home greeting caches. Prefix match. */
export const ONBOARDING_PROFILE_QUERY_KEYS: readonly (readonly string[])[] = [
  ["profiles", "getRecord"],
  ["profile"],
  ["profiles", "getStats"],
  ["profiles", "getFollowCounts"],
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

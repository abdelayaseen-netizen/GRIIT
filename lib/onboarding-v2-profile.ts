/** Live username: lowercase, keep [a-z0-9_.] only. */
export function normalizeOnboardingUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
}

/**
 * Advance only after persist succeeds. A thrown write must leave the caller
 * on the same screen with field values intact.
 */
export async function persistThenAdvance(
  persist: () => Promise<void>,
  onContinue: () => void
): Promise<{ status: "advanced" } | { status: "stayed"; error: unknown }> {
  try {
    await persist();
  } catch (error) {
    return { status: "stayed", error };
  }
  onContinue();
  return { status: "advanced" };
}

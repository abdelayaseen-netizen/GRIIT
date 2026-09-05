/**
 * Account-screen name sub-step. Shown only after Apple / Create account
 * succeeds — never after Skip or guest paths.
 */

export function shouldShowAccountNameStep(
  source: "auth_success" | "skip" | "guest"
): boolean {
  return source === "auth_success";
}

export function normalizeAccountUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function isValidAccountUsername(normalized: string): boolean {
  return normalized.length >= 3 && normalized.length <= 20;
}

export type AccountNameDecision =
  | { persist: false }
  | { persist: true; displayName: string; username: string }
  | { persist: false; error: string };

export function accountNameSkipDecision(): { persist: false } {
  return { persist: false };
}

export function accountNameContinueDecision(input: {
  displayName: string;
  username: string;
}): AccountNameDecision {
  const username = normalizeAccountUsername(input.username);
  if (!isValidAccountUsername(username)) {
    return {
      persist: false,
      error: "Username must be 3–20 characters, lowercase, no spaces",
    };
  }
  return {
    persist: true,
    displayName: input.displayName.trim(),
    username,
  };
}

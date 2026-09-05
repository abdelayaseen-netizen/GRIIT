/**
 * Account-screen name sub-step.
 *
 * Shown only for a newly created account (email Create account or Apple).
 * Never after Skip, guest, or an existing account signing in.
 */

export type AccountAuthPath =
  | "anon_upgrade_email"
  | "anon_upgrade_apple"
  | "signup_email"
  | "signin_email"
  | "apple_id_token";

export type AccountAuthKind = "new_account" | "existing_account";

export type AccountNameDestination = "account_name" | "invite";

/** created_at and last_sign_in_at within this window count as the same first session. */
const FIRST_SESSION_SKEW_MS = 30_000;
/** Account created this recently is treated as new even if last_sign_in_at is missing. */
const BRAND_NEW_MS = 120_000;

/**
 * First Apple `signInWithIdToken` session ≈ new account.
 * Do not use recency on anon upgrade — that user's `created_at` is the guest mint.
 */
export function isLikelyFirstAuthSession(
  createdAt?: string | null,
  lastSignInAt?: string | null,
  nowMs: number = Date.now()
): boolean {
  const created = createdAt ? Date.parse(createdAt) : NaN;
  if (Number.isNaN(created)) return true;
  const lastRaw = lastSignInAt ? Date.parse(lastSignInAt) : created;
  const last = Number.isNaN(lastRaw) ? created : lastRaw;
  if (Math.abs(last - created) < FIRST_SESSION_SKEW_MS) return true;
  if (nowMs - created < BRAND_NEW_MS) return true;
  return false;
}

export function classifyAccountAuth(input: {
  path: AccountAuthPath;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  nowMs?: number;
}): AccountAuthKind {
  switch (input.path) {
    case "anon_upgrade_email":
    case "anon_upgrade_apple":
    case "signup_email":
      return "new_account";
    case "signin_email":
      return "existing_account";
    case "apple_id_token":
      return isLikelyFirstAuthSession(input.createdAt, input.lastSignInAt, input.nowMs)
        ? "new_account"
        : "existing_account";
  }
}

export function shouldShowAccountNameStep(kind: AccountAuthKind): boolean {
  return kind === "new_account";
}

/** Flow branch after AccountScreen auth resolves. */
export function nextAfterAccountAuth(kind: AccountAuthKind): AccountNameDestination {
  return shouldShowAccountNameStep(kind) ? "account_name" : "invite";
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

export function isPlaceholderUsername(u: string | null | undefined): boolean {
  if (!u || typeof u !== "string") return true;
  return /^user_[0-9a-f]{8,12}$/i.test(u.trim());
}

export function suggestUsernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return normalizeAccountUsername(local.replace(/[^a-z0-9]/gi, "_")).slice(0, 20);
}

export function prefillAccountUsername(input: {
  email?: string | null;
  profileUsername?: string | null;
}): string {
  const profile = input.profileUsername?.trim() ?? "";
  if (profile && !isPlaceholderUsername(profile)) {
    return normalizeAccountUsername(profile).slice(0, 20);
  }
  if (input.email) {
    const suggested = suggestUsernameFromEmail(input.email);
    if (suggested.length >= 3) return suggested;
  }
  return "";
}

export type AccountNameDecision =
  | { persist: false }
  | { persist: true; displayName: string; username: string }
  | { persist: false; error: string };

/** Same 150-char cap as old ProfileSetup bio. */
export const ACCOUNT_NAME_BIO_MAX = 150;

export function accountNameBioForPersist(raw: string): string | undefined {
  const trimmed = raw.trim().slice(0, ACCOUNT_NAME_BIO_MAX);
  return trimmed.length > 0 ? trimmed : undefined;
}

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

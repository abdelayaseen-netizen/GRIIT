/**
 * Onboarding v2 launch routing and step resolution.
 * Pure — no I/O. AuthRedirector and OnboardingFlowV2 call these.
 */

export const ONBOARDING_V2_ORDER = [
  "welcome",
  "goals",
  "why_proof",
  "why_circle",
  "commitment",
  "first_challenge",
  "reminders",
  "account",
  "profile",
] as const;

export type OnboardingV2Step = (typeof ONBOARDING_V2_ORDER)[number];

export type SessionKind = "none" | "guest" | "real";

export type OnboardingLaunchDestination = "home" | "resume" | "welcome";

const ORDER_SET = new Set<string>(ONBOARDING_V2_ORDER);

/** Stale keys from the paywall-in-flow era land on FirstChallenge. */
const STEP_ALIASES: Record<string, OnboardingV2Step> = {
  paywall: "first_challenge",
};

export function resolveV2Step(raw: string | null | undefined): OnboardingV2Step {
  if (raw && ORDER_SET.has(raw)) return raw as OnboardingV2Step;
  if (raw && raw in STEP_ALIASES) return STEP_ALIASES[raw] ?? "first_challenge";
  return "first_challenge";
}

export function sessionKindFromUser(user: { is_anonymous?: boolean } | null | undefined): SessionKind {
  if (!user) return "none";
  if (user.is_anonymous === true) return "guest";
  return "real";
}

/**
 * Whether this session has finished onboarding.
 *
 * Real accounts: DB is authoritative once loaded (non-null). A stale local
 * flag from a previous guest on the same device must not skip a new account.
 * `dbCompleted === null` while loading is not completed (caller keeps overlay).
 * `dbCompleted === null` after a fetch error falls back to local || store.
 * Guest / no session: local OR store OR db.
 */
export function resolveOnboardingCompleted(input: {
  sessionKind: SessionKind;
  localCompleted: boolean;
  storeCompleted: boolean;
  dbCompleted: boolean | null;
  dbFetchFailed?: boolean;
}): boolean {
  const { sessionKind, localCompleted, storeCompleted, dbCompleted, dbFetchFailed } = input;
  if (sessionKind === "real") {
    if (dbCompleted !== null) return dbCompleted;
    if (dbFetchFailed) return localCompleted || storeCompleted;
    return false;
  }
  return localCompleted || storeCompleted || dbCompleted === true;
}

export function resolveOnboardingLaunch(input: {
  sessionKind: SessionKind;
  localCompleted: boolean;
  storeCompleted: boolean;
  dbCompleted: boolean | null;
  dbFetchFailed?: boolean;
  inOnboarding: boolean;
}): OnboardingLaunchDestination {
  if (resolveOnboardingCompleted(input)) return "home";
  if (input.sessionKind === "none" && !input.inOnboarding) return "welcome";
  return "resume";
}

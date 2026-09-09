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

/** Dots after welcome. No "of 9." */
export const ONBOARDING_V2_PROGRESS_SEGMENTS = 8;

export type SessionKind = "none" | "guest" | "real";

export type OnboardingLaunchDestination = "home" | "resume" | "welcome";

const ORDER_SET = new Set<string>(ONBOARDING_V2_ORDER);

/** Stale v4 / paywall-era keys resume on the Chunk A step. */
const STEP_ALIASES: Record<string, OnboardingV2Step> = {
  proof: "why_proof",
  circle: "why_circle",
  challenge: "first_challenge",
  reminder: "reminders",
  invite: "account",
  dayone: "profile",
  paywall: "first_challenge",
};

export function resolveV2Step(raw: string | null | undefined): OnboardingV2Step {
  if (raw && ORDER_SET.has(raw)) return raw as OnboardingV2Step;
  if (raw && raw in STEP_ALIASES) return STEP_ALIASES[raw] ?? "welcome";
  return "welcome";
}

export function v2StepIndex(step: OnboardingV2Step): number {
  return ONBOARDING_V2_ORDER.indexOf(step);
}

/** Segment i (1..8) is filled when the current step index is >= i. */
export function v2SegmentFilled(step: OnboardingV2Step, segment: number): boolean {
  return v2StepIndex(step) >= segment;
}

export function v2ProgressLabel(step: OnboardingV2Step): string {
  if (step === "welcome") return "";
  return "";
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
  if (input.sessionKind === "none") return "welcome";
  if (resolveOnboardingCompleted(input)) return "home";
  return "resume";
}

/**
 * After launch dest is "home" (completed), where to send them.
 * `null` = stay put — a completed guest already on Discover must not bounce to Home.
 */
export function resolveCompletedLeaveHref(input: {
  inOnboarding: boolean;
  inAuth: boolean;
  onCreateProfile: boolean;
  inTabs: boolean;
  exitHref?: string | null;
}): string | null {
  if (input.inTabs) return null;
  if (input.inOnboarding || input.inAuth || input.onCreateProfile) {
    return input.exitHref ?? "/(tabs)";
  }
  return null;
}

/** In-memory exit chosen by completeOnboardingV2. Not persisted. */
let pendingExitHref: string | null = null;

export function setOnboardingV2Exit(href: string): void {
  pendingExitHref = href;
}

export function peekOnboardingV2Exit(): string | null {
  return pendingExitHref;
}

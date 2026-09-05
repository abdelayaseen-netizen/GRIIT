/**
 * Onboarding v2 launch routing and step resolution.
 * Pure — no I/O. AuthRedirector and OnboardingFlowV2 call these.
 */

export const ONBOARDING_V2_ORDER = [
  "welcome",
  "goals",
  "proof",
  "circle",
  "challenge",
  "reminder",
  "account",
  "invite",
  "dayone",
] as const;

export type OnboardingV2Step = (typeof ONBOARDING_V2_ORDER)[number];

/** Tracked steps after welcome. Day 1 fills all and labels "Done". */
export const ONBOARDING_V2_PROGRESS_SEGMENTS = 7;

export type SessionKind = "none" | "guest" | "real";

export type OnboardingLaunchDestination = "home" | "resume" | "welcome";

const ORDER_SET = new Set<string>(ONBOARDING_V2_ORDER);

/** Stale Chunk A keys + paywall-era keys resume on the renamed step. */
const STEP_ALIASES: Record<string, OnboardingV2Step> = {
  why_proof: "proof",
  why_circle: "circle",
  commitment: "challenge",
  first_challenge: "challenge",
  reminders: "reminder",
  profile: "dayone",
  paywall: "challenge",
};

export function resolveV2Step(raw: string | null | undefined): OnboardingV2Step {
  if (raw && ORDER_SET.has(raw)) return raw as OnboardingV2Step;
  if (raw && raw in STEP_ALIASES) return STEP_ALIASES[raw] ?? "challenge";
  return "challenge";
}

export function v2StepIndex(step: OnboardingV2Step): number {
  return ONBOARDING_V2_ORDER.indexOf(step);
}

/** Segment i (1..7) is filled when the current step index is >= i. */
export function v2SegmentFilled(step: OnboardingV2Step, segment: number): boolean {
  return v2StepIndex(step) >= segment;
}

export function v2ProgressLabel(step: OnboardingV2Step): string {
  if (step === "welcome") return "";
  if (step === "dayone") return "Done";
  return `Step ${v2StepIndex(step)}/${ONBOARDING_V2_PROGRESS_SEGMENTS}`;
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

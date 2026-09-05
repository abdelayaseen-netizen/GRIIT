import type { OnboardingGoal } from "@/store/onboardingStore";
import {
  suggestChallengesForGoals,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-suggest";

export type { SuggestableChallenge };

/**
 * Browse all stays inside /onboarding. It must not complete the flow,
 * mint a guest session, or route to Discover/Home.
 */
export function browseAllExitPolicy(): {
  completeOnboarding: false;
  mintSession: false;
  leaveOnboarding: false;
} {
  return {
    completeOnboarding: false,
    mintSession: false,
    leaveOnboarding: false,
  };
}

/** Same starter-pack catalog as the three cards, ranked, without the take-3. */
export function catalogueForBrowseAll(
  goals: readonly OnboardingGoal[],
  catalog: readonly SuggestableChallenge[]
): SuggestableChallenge[] {
  return suggestChallengesForGoals(goals, catalog, catalog.length);
}

/**
 * Challenge step keeps a catalogue pick selected even when it is not
 * in the take-3. Prepends the picked row so the radio stays on.
 */
export function mergePickedIntoSuggestions(
  suggestions: readonly SuggestableChallenge[],
  catalog: readonly SuggestableChallenge[],
  pickedId: string | null
): SuggestableChallenge[] {
  if (!pickedId) return [...suggestions];
  if (suggestions.some((c) => c.id === pickedId)) return [...suggestions];
  const extra = catalog.find((c) => c.id === pickedId);
  if (!extra) return [...suggestions];
  return [extra, ...suggestions];
}

export type BrowsePickerPhase = "closed" | "open";

export type BrowsePickerSnapshot = {
  phase: BrowsePickerPhase;
  selectedChallengeId: string | null;
};

/** Selecting a catalogue row returns to step 4 with that id selected. */
export function applyBrowsePick(
  challengeId: string
): BrowsePickerSnapshot {
  return { phase: "closed", selectedChallengeId: challengeId };
}

/** Back from the picker: step 4 unchanged. */
export function applyBrowseBack(
  selectedChallengeId: string | null
): BrowsePickerSnapshot {
  return { phase: "closed", selectedChallengeId };
}

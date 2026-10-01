import { isCatalogChallenge, type DiscoverCatalogRow } from "./discover-catalog";

export const ONBOARD_WATER_STARTER_ID = "onboard-water";

export type OnboardingStarterRow = DiscoverCatalogRow & {
  duration_days?: number | null;
};

/** Onboarding Start here: catalog only, never 1-day, never onboard-water. */
export function isOnboardingStarterEligible(row: OnboardingStarterRow): boolean {
  if (!isCatalogChallenge(row)) return false;
  if (row.source_starter_id === ONBOARD_WATER_STARTER_ID) return false;
  const days = row.duration_days ?? 0;
  return days > 1;
}

export function filterOnboardingStarterPack<T extends OnboardingStarterRow>(
  rows: readonly T[],
): T[] {
  return rows.filter(isOnboardingStarterEligible);
}

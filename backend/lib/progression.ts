/**
 * Tier thresholds by total days secured.
 * Starter 0-6, Builder 7-29, Relentless 30-89, Elite 90+
 */
export const TIER_THRESHOLDS = [
  { tier: "Starter", minDays: 0, maxDays: 6 },
  { tier: "Builder", minDays: 7, maxDays: 29 },
  { tier: "Relentless", minDays: 30, maxDays: 89 },
  { tier: "Elite", minDays: 90, maxDays: Infinity },
] as const;

export function getTierForDays(totalDaysSecured: number): string {
  const row = TIER_THRESHOLDS.find(
    (t) => totalDaysSecured >= t.minDays && totalDaysSecured <= t.maxDays
  );
  return row?.tier ?? "Starter";
}

export function getPointsToNextTier(totalDaysSecured: number): number {
  const next = TIER_THRESHOLDS.find((t) => t.minDays > totalDaysSecured);
  if (!next) return 0; // already Elite
  return next.minDays - totalDaysSecured;
}

export function getNextTierName(totalDaysSecured: number): string | null {
  const next = TIER_THRESHOLDS.find((t) => t.minDays > totalDaysSecured);
  return next?.tier ?? null;
}

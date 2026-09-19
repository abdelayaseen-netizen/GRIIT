/**
 * Today / Active challenge "Day {n} of {Y}".
 * Y is challenge duration_days. target_streak is not used.
 * Missing or non-positive duration → "Day {n}" with no "of".
 */
export function homeDayTotal(durationDays: number | null | undefined): number | null {
  if (durationDays == null || !Number.isFinite(durationDays) || durationDays <= 0) return null;
  return durationDays;
}

export function homeDayLine(day: number, durationDays: number | null | undefined): string {
  const total = homeDayTotal(durationDays);
  if (total == null) return `Day ${day}`;
  return `Day ${day} of ${total}`;
}

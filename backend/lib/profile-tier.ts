/** Same bands secure_day used to write onto profiles.tier. */
export function profileTierForSecuredDays(totalDays: number): string {
  const days = Math.max(0, Math.floor(totalDays));
  if (days >= 90) return "Elite";
  if (days >= 30) return "Relentless";
  if (days >= 7) return "Builder";
  return "Starter";
}

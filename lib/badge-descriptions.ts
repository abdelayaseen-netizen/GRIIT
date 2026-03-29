/** Long-form copy for badge detail modal (by badge id from API). */
export const BADGE_DESCRIPTIONS: Record<string, string> = {
  "3day":
    "Complete a 3-day streak on any challenge. Every streak starts with showing up three days in a row.",
  "7day":
    "Complete a 7-day streak on any challenge. A full week of consistency builds the foundation of discipline.",
  "14day":
    "Maintain a 14-day streak. Two weeks of daily commitment proves this is more than motivation — it's a habit.",
  "30day":
    "Hit a 30-day streak. A full month of showing up every single day. Most people never make it this far.",
  "60day": "Reach a 60-day streak. Iron-level consistency. You're in the top tier of discipline.",
  first_complete: "Complete your first challenge from start to finish. The first of many.",
  squad: "Invite 3 friends to join GRIIT. Discipline is contagious — spread it.",
};

export function getBadgeDescription(id: string): string {
  return BADGE_DESCRIPTIONS[id] ?? "Keep grinding to unlock this badge.";
}

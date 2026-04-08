/** Long-form copy for badge detail modal (by badge id from API). */
export const BADGE_DESCRIPTIONS: Record<string, string> = {
  // Discipline
  "3day":
    "Complete a 3-day streak on any challenge. Every streak starts with showing up three days in a row.",
  "7day":
    "Complete a 7-day streak on any challenge. A full week of consistency builds the foundation of discipline.",
  "14day":
    "Maintain a 14-day streak. Two weeks of daily commitment proves this is more than motivation — it's a habit.",
  "30day":
    "Hit a 30-day streak. A full month of showing up every single day. Most people never make it this far.",
  "60day": "Reach a 60-day streak. Iron-level consistency. You're in the top tier of discipline.",
  streak_75: "75 days straight. You are in legendary territory. Less than 1% of users reach this.",
  streak_100: "100-day streak. Centurion status. Unwavering, unbreakable discipline.",
  streak_7:
    "Complete a 7-day streak on any challenge. A full week of consistency builds the foundation of discipline.",
  streak_14: "Maintain a 14-day streak. Two weeks of daily commitment.",
  streak_30: "Hit a 30-day streak. A full month of showing up.",
  consistency: "Two weeks of showing up. Consistency beats intensity.",
  // Social
  first_follow: "Follow your first person on GRIIT. Discipline is better with accountability.",
  ten_followers: "Reach 10 followers. Your consistency inspires others to show up.",
  first_respect: "Receive your first respect from another user. Your grind got noticed.",
  fifty_respects: "Receive 50 total respects. Your discipline speaks for itself.",
  first_comment: "Leave your first comment. Encourage someone on their journey.",
  accountability_partner: "Add your first accountability partner. Two is stronger than one.",
  // Creation
  first_challenge_created: "Create your first challenge. You're building the path others walk.",
  challenge_10_participants: "Create a challenge that 10 people join. You're a rally leader.",
  five_challenges_created: "Create 5 different challenges. You're a challenge factory.",
  // Mastery
  first_secure: "Secure your first day. The journey of a thousand days begins with one.",
  first_challenge: "Complete your first challenge from start to finish. The first of many.",
  five_challenges: "Complete 5 challenges. You don't stop at one.",
  total_days_50: "Secure 50 total days across all challenges. Half a century of discipline.",
  total_days_100: "Secure 100 total days. A century of showing up.",
  hard_mode_first: "Complete a hard mode task for the first time. No shortcuts.",
  three_categories: "Complete challenges in 3 different categories. Renaissance discipline.",
  // Legacy / older copy keys
  first_complete: "Complete your first challenge from start to finish. The first of many.",
  squad: "Invite 3 friends to join GRIIT. Discipline is contagious — spread it.",
};

export function getBadgeDescription(id: string): string {
  return BADGE_DESCRIPTIONS[id] ?? "Keep grinding to unlock this badge.";
}

/** Shared achievement/badge definitions across all dimensions. */

export interface AchievementDef {
  key: string;
  label: string;
  dimension: "discipline" | "social" | "creation" | "mastery";
  icon: string;
  color: string;
  description: string;
  threshold?: number;
}

export const ACHIEVEMENTS = {
  // === DISCIPLINE (streaks) ===
  STREAK_3: { key: "3day", label: "3-Day Fire", dimension: "discipline", icon: "Zap", color: "coral", description: "Complete a 3-day streak on any challenge.", threshold: 3 },
  STREAK_7: { key: "7day", label: "Week Warrior", dimension: "discipline", icon: "Star", color: "amber", description: "Complete a 7-day streak. A full week of consistency.", threshold: 7 },
  STREAK_14: { key: "14day", label: "Fortnight", dimension: "discipline", icon: "Trophy", color: "purple", description: "Maintain a 14-day streak. Two weeks of daily commitment.", threshold: 14 },
  STREAK_30: { key: "30day", label: "Month Master", dimension: "discipline", icon: "Target", color: "teal", description: "Hit a 30-day streak. A full month of showing up.", threshold: 30 },
  STREAK_60: { key: "60day", label: "Iron Will", dimension: "discipline", icon: "Zap", color: "coral", description: "Reach a 60-day streak. Iron-level consistency.", threshold: 60 },
  STREAK_75: { key: "streak_75", label: "75-Day Legend", dimension: "discipline", icon: "Trophy", color: "purple", description: "75 days straight. You are in legendary territory.", threshold: 75 },
  STREAK_100: { key: "streak_100", label: "Centurion", dimension: "discipline", icon: "Star", color: "amber", description: "100-day streak. Only the most disciplined reach this.", threshold: 100 },

  /** Legacy keys (display / getLabel — old unlocks used streak_7 etc.; new unlocks use 7day, 14day, …) */
  STREAK_7_LEGACY: { key: "streak_7", label: "7-Day Streak", dimension: "discipline", icon: "Star", color: "amber", description: "Complete a 7-day streak on any challenge.", threshold: 7 },
  STREAK_14_LEGACY: { key: "streak_14", label: "14-Day Streak", dimension: "discipline", icon: "Trophy", color: "purple", description: "Maintain a 14-day streak.", threshold: 14 },
  STREAK_30_LEGACY: { key: "streak_30", label: "30-Day Streak", dimension: "discipline", icon: "Target", color: "teal", description: "Hit a 30-day streak.", threshold: 30 },

  /** Kept for users who already unlocked this key */
  CONSISTENCY: { key: "consistency", label: "Consistency", dimension: "discipline", icon: "Trophy", color: "purple", description: "Two weeks of showing up.", threshold: 14 },

  // === SOCIAL ===
  FIRST_FOLLOW: { key: "first_follow", label: "Connected", dimension: "social", icon: "Users", color: "blue", description: "Follow your first person on GRIIT." },
  TEN_FOLLOWERS: { key: "ten_followers", label: "Growing Crew", dimension: "social", icon: "Users", color: "blue", description: "Reach 10 followers. Your discipline inspires others.", threshold: 10 },
  FIRST_RESPECT: { key: "first_respect", label: "Respected", dimension: "social", icon: "Heart", color: "coral", description: "Receive your first respect from another user." },
  FIFTY_RESPECTS: { key: "fifty_respects", label: "Well Respected", dimension: "social", icon: "Heart", color: "coral", description: "Receive 50 total respects. Your grind is noticed.", threshold: 50 },
  FIRST_COMMENT: { key: "first_comment", label: "Voice Heard", dimension: "social", icon: "MessageCircle", color: "teal", description: "Leave your first comment on someone's post." },
  ACCOUNTABILITY_PARTNER: { key: "accountability_partner", label: "Battle Buddy", dimension: "social", icon: "Users", color: "purple", description: "Add your first accountability partner." },

  // === CREATION ===
  FIRST_CHALLENGE_CREATED: { key: "first_challenge_created", label: "Architect", dimension: "creation", icon: "Hammer", color: "amber", description: "Create your first challenge. Build the path others walk." },
  CHALLENGE_10_PARTICIPANTS: { key: "challenge_10_participants", label: "Rally Leader", dimension: "creation", icon: "Flag", color: "teal", description: "Create a challenge that 10 people join.", threshold: 10 },
  FIVE_CHALLENGES_CREATED: { key: "five_challenges_created", label: "Challenge Factory", dimension: "creation", icon: "Hammer", color: "amber", description: "Create 5 different challenges.", threshold: 5 },

  // === MASTERY ===
  FIRST_SECURE: { key: "first_secure", label: "First Secured Day", dimension: "mastery", icon: "Check", color: "teal", description: "Secure your first day. The journey begins." },
  FIRST_CHALLENGE: { key: "first_challenge", label: "Challenge Champion", dimension: "mastery", icon: "Trophy", color: "purple", description: "Complete your first challenge from start to finish." },
  FIVE_CHALLENGES: { key: "five_challenges", label: "Serial Achiever", dimension: "mastery", icon: "Target", color: "amber", description: "Complete 5 challenges. You don't stop.", threshold: 5 },
  TOTAL_DAYS_50: { key: "total_days_50", label: "Half Century", dimension: "mastery", icon: "Star", color: "amber", description: "Secure 50 total days across all challenges.", threshold: 50 },
  TOTAL_DAYS_100: { key: "total_days_100", label: "Century Grinder", dimension: "mastery", icon: "Trophy", color: "purple", description: "Secure 100 total days. Unwavering.", threshold: 100 },
  HARD_MODE_FIRST: { key: "hard_mode_first", label: "No Shortcuts", dimension: "mastery", icon: "Zap", color: "coral", description: "Complete a hard mode task for the first time." },
  THREE_CATEGORIES: { key: "three_categories", label: "Renaissance", dimension: "mastery", icon: "Target", color: "teal", description: "Complete challenges in 3 different categories.", threshold: 3 },
} satisfies Record<string, AchievementDef>;

export type AchievementKey = string;

/** Get all achievements as an array, optionally filtered by dimension. */
export function getAchievementsByDimension(dimension?: AchievementDef["dimension"]): AchievementDef[] {
  const all = Object.values(ACHIEVEMENTS);
  if (!dimension) return all;
  return all.filter((a) => a.dimension === dimension);
}

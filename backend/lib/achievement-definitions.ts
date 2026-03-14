/** Shared achievement key and display definitions. */
export const ACHIEVEMENTS = {
  STREAK_7: { key: "streak_7", label: "7-Day Streak", threshold: 7 },
  STREAK_14: { key: "streak_14", label: "14-Day Streak", threshold: 14 },
  STREAK_30: { key: "streak_30", label: "30-Day Streak", threshold: 30 },
  STREAK_75: { key: "streak_75", label: "75-Day Legend", threshold: 75 },
  FIRST_SECURE: { key: "first_secure", label: "First Secured Day" },
  FIRST_CHALLENGE: { key: "first_challenge", label: "Challenge Champion" },
  FIVE_CHALLENGES: { key: "five_challenges", label: "Serial Achiever" },
  CONSISTENCY: { key: "consistency", label: "Consistency", threshold: 14 },
} as const;

export type AchievementKey = (typeof ACHIEVEMENTS)[keyof typeof ACHIEVEMENTS]["key"];

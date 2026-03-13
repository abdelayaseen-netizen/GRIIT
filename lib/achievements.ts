/** Achievement keys and display info. Must match backend achievement-definitions. */
export const ACHIEVEMENT_DEFINITIONS = [
  { key: "streak_7", title: "7-Day Streak", description: "7-day streak", category: "consistency" as const },
  { key: "streak_14", title: "14-Day Streak", description: "14-day streak", category: "consistency" as const },
  { key: "streak_30", title: "30-Day Streak", description: "30-day streak", category: "consistency" as const },
  { key: "streak_75", title: "75-Day Legend", description: "75-day streak", category: "consistency" as const },
  { key: "first_secure", title: "First Secured Day", description: "Secure your first day", category: "consistency" as const },
  { key: "first_challenge", title: "First Challenge Completed", description: "Complete a challenge", category: "challenge" as const },
  { key: "consistency", title: "Consistency", description: "14 days without a miss", category: "consistency" as const },
];

export type AchievementCategory = "consistency" | "challenge" | "discipline";

/**
 * Streak milestone definitions for celebrations.
 * Used after securing a day to show enhanced feedback when user hits a milestone.
 */

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export interface MilestoneConfig {
  days: number;
  title: string;
  subtitle: string;
}

export const MILESTONE_MESSAGES: Record<number, MilestoneConfig> = {
  3: {
    days: 3,
    title: "3-DAY STREAK!",
    subtitle: "3 days strong! You're building momentum.",
  },
  7: {
    days: 7,
    title: "🔥 7-DAY STREAK!",
    subtitle: "One full week of discipline! 🔥",
  },
  14: {
    days: 14,
    title: "🔥 14-DAY STREAK!",
    subtitle: "Two weeks! Most people quit by now. Not you.",
  },
  21: {
    days: 21,
    title: "💪 21 DAYS OF DISCIPLINE!",
    subtitle: "21 days — they say this is where habits form.",
  },
  30: {
    days: 30,
    title: "💪 30 DAYS OF DISCIPLINE!",
    subtitle: "A full month of discipline. Respect. 💪",
  },
  50: {
    days: 50,
    title: "50-DAY STREAK!",
    subtitle: "50 days. You're in rare company.",
  },
  75: {
    days: 75,
    title: "75-DAY STREAK!",
    subtitle: "75 days. Elite territory.",
  },
  100: {
    days: 100,
    title: "100 DAYS. LEGENDARY. 🏆",
    subtitle: "100 DAYS. Legendary. 🏆",
  },
};

export function getMilestoneForStreak(streak: number): MilestoneConfig | null {
  if (streak <= 0) return null;
  return MILESTONE_MESSAGES[streak] ?? null;
}

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak as StreakMilestone);
}

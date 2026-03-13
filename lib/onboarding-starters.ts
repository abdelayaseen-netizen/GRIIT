/**
 * Minimal 1-task starter challenges for onboarding Day 1 quick win.
 * Each has exactly one simple task so user can secure Day 1 in < 90 seconds.
 */
export interface OnboardingStarter {
  id: string;
  title: string;
  description: string;
  category: string;
  timeBudget: string;
  taskTitle: string;
  taskType: "checkin" | "journal" | "timer";
}

export const ONBOARDING_STARTERS: OnboardingStarter[] = [
  { id: "onboard-water", title: "Water", description: "Drink 2 bottles today", category: "fitness", timeBudget: "3 min", taskTitle: "Drink 2 bottles of water", taskType: "checkin" },
  { id: "onboard-steps", title: "Steps", description: "2,000 steps today", category: "fitness", timeBudget: "10 min", taskTitle: "Walk 2,000 steps", taskType: "checkin" },
  { id: "onboard-read", title: "Read 5 min", description: "Read for 5 minutes", category: "mind", timeBudget: "10 min", taskTitle: "Read for 5 minutes", taskType: "timer" },
  { id: "onboard-journal", title: "Journal", description: "Write 3 sentences about today", category: "mind", timeBudget: "3 min", taskTitle: "Write 3 sentences about today", taskType: "journal" },
  { id: "onboard-breath", title: "2-Minute Breath", description: "One 2-minute breathing exercise", category: "mind", timeBudget: "3 min", taskTitle: "2-minute breathing exercise", taskType: "timer" },
  { id: "onboard-bed", title: "Make Your Bed", description: "Make your bed today", category: "discipline", timeBudget: "3 min", taskTitle: "Make your bed", taskType: "checkin" },
];

export function filterOnboardingStarters(primaryGoal: string, dailyTimeBudget: string): OnboardingStarter[] {
  let list = ONBOARDING_STARTERS;
  if (primaryGoal && primaryGoal !== "Other") {
    list = list.filter((s) => s.category.toLowerCase() === primaryGoal.toLowerCase());
  }
  if (dailyTimeBudget) {
    const preferShort = dailyTimeBudget === "3 min";
    list = list.sort((a, _b) => (preferShort && a.timeBudget === "3 min" ? -1 : 0));
  }
  return list.length >= 3 ? list : ONBOARDING_STARTERS;
}

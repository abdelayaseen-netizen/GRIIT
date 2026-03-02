/**
 * Starter challenge definitions for onboarding (backend seed + starters.join).
 * Must match lib/onboarding-starters.ts ids.
 */
export const STARTER_DEFINITIONS = [
  { starter_id: "onboard-water", title: "Water", description: "Drink 2 bottles today", category: "fitness", task_title: "Drink 2 bottles of water", task_type: "checkin" as const },
  { starter_id: "onboard-steps", title: "Steps", description: "2,000 steps today", category: "fitness", task_title: "Walk 2,000 steps", task_type: "checkin" as const },
  { starter_id: "onboard-read", title: "Read 5 min", description: "Read for 5 minutes", category: "mind", task_title: "Read for 5 minutes", task_type: "timer" as const },
  { starter_id: "onboard-journal", title: "Journal", description: "Write 3 sentences about today", category: "mind", task_title: "Write 3 sentences about today", task_type: "journal" as const },
  { starter_id: "onboard-breath", title: "2-Minute Breath", description: "One 2-minute breathing exercise", category: "mind", task_title: "2-minute breathing exercise", task_type: "timer" as const },
  { starter_id: "onboard-bed", title: "Make Your Bed", description: "Make your bed today", category: "discipline", task_title: "Make your bed", task_type: "checkin" as const },
] as const;

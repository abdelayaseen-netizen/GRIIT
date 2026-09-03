import type { OnboardingGoal } from "@/store/onboardingStore";

const GOAL_IDS = new Set<OnboardingGoal>([
  "physical_toughness",
  "mental_discipline",
  "daily_habits",
  "reading_learning",
  "cold_exposure",
  "sleep_recovery",
]);

export function parseGoalsFromAnswers(answers: unknown): OnboardingGoal[] {
  if (!answers || typeof answers !== "object") return [];
  const raw = (answers as { goals?: unknown }).goals;
  if (!Array.isArray(raw)) return [];
  const out: OnboardingGoal[] = [];
  for (const item of raw) {
    if (typeof item === "string" && GOAL_IDS.has(item as OnboardingGoal)) {
      const goal = item as OnboardingGoal;
      if (!out.includes(goal)) out.push(goal);
    }
  }
  return out;
}

export function mergeGoalsIntoAnswers(
  existing: Record<string, unknown> | null | undefined,
  goals: OnboardingGoal[]
): Record<string, unknown> {
  return { ...(existing ?? {}), goals };
}

import type { OnboardingGoal } from "@/store/onboardingStore";
import { filterChallengesByGoals, inferChallengeGoalTags } from "@/lib/goal-challenge-map";

export type SuggestableChallenge = {
  id: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  duration_days?: number | null;
  participants_count?: number | null;
  tasks?: { length?: number } | unknown[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MATCH_REASON: Record<OnboardingGoal, string> = {
  physical_toughness: "Matches physical toughness",
  mental_discipline: "Matches mental discipline",
  daily_habits: "Matches daily habits",
  reading_learning: "Matches reading & learning",
  cold_exposure: "Matches cold exposure",
  sleep_recovery: "Matches sleep & recovery",
  faith_prayer: "Matches faith and prayer",
};

export { inferChallengeGoalTags };

/** First intersecting inferred tag, else "Popular first challenge". */
export function matchReasonForChallenge(
  c: SuggestableChallenge,
  goals: readonly OnboardingGoal[]
): string {
  const selected = new Set(goals);
  const hit = inferChallengeGoalTags(c).find((tag) => selected.has(tag));
  return hit ? MATCH_REASON[hit] : "Popular first challenge";
}

export function countNoun(n: number, singular: string, plural: string): string {
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`;
}

export function challengeDetailLine(c: SuggestableChallenge): string {
  const days = c.duration_days != null ? countNoun(c.duration_days, "day", "days") : null;
  const taskCount = Array.isArray(c.tasks) ? c.tasks.length : 0;
  const tasks = taskCount > 0 ? countNoun(taskCount, "task", "tasks") : null;
  const line = [days, tasks, "daily"].filter(Boolean).join(" · ");
  return line || c.category || "Starter";
}

export function isJoinableChallengeId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Rank catalog by selected goals. Empty / non-UUID catalog → []. Never invents ids. */
export function suggestChallengesForGoals(
  goals: readonly OnboardingGoal[],
  catalog: readonly SuggestableChallenge[],
  limit = 3
): SuggestableChallenge[] {
  const joinable = catalog.filter((c) => typeof c.id === "string" && isJoinableChallengeId(c.id));
  if (joinable.length === 0) return [];
  return filterChallengesByGoals(goals, joinable, limit);
}

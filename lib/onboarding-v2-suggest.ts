import type { OnboardingGoal } from "@/store/onboardingStore";
import { inferChallengeGoalTags } from "@/lib/goal-challenge-map";
import { parseTargetStreak } from "@/lib/onboarding-v2-target-streak-parse";
import type { SuggestionTask } from "@/lib/onboarding-v2-first-challenge";

export const DEFAULT_ONBOARDING_LINE = 7;
export const NO_DAYS_OFF_TITLE = "No Days Off";

export type SuggestableChallenge = {
  id: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  duration_days?: number | null;
  is_hard_mode?: boolean | null;
  participation_type?: string | null;
  participants_count?: number | null;
  tasks?: SuggestionTask[] | { length?: number };
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MATCH_REASON: Record<OnboardingGoal, string> = {
  physical_toughness: "Matches physical toughness",
  mental_discipline: "Matches mental discipline",
  daily_habits: "Matches daily habits",
  reading_learning: "Matches reading and learning",
  cold_exposure: "Matches cold exposure",
  sleep_recovery: "Matches sleep and recovery",
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

/** Custom is its number. Invalid / missing line falls back to the 7-day preset. */
export function resolveOnboardingLine(line: number | null | undefined): number {
  return parseTargetStreak(line) ?? DEFAULT_ONBOARDING_LINE;
}

export function isNoDaysOffChallenge(c: { title?: string | null }): boolean {
  return (c.title ?? "").trim().toLowerCase() === NO_DAYS_OFF_TITLE.toLowerCase();
}

/** Never 1-day. Duration must be at least the locked line. */
export function meetsOnboardingDuration(
  durationDays: number | null | undefined,
  line: number,
): boolean {
  const days = durationDays ?? 0;
  return days > 1 && days >= line;
}

function goalScore(c: SuggestableChallenge, goals: readonly OnboardingGoal[]): number {
  if (goals.length === 0) return 0;
  const selected = new Set(goals);
  return inferChallengeGoalTags(c).filter((tag) => selected.has(tag)).length;
}

/** First card that is not No Days Off. Null when the list is empty or only NDO. */
export function preselectedSuggestionId(
  suggestions: readonly SuggestableChallenge[],
): string | null {
  for (const c of suggestions) {
    if (!isNoDaysOffChallenge(c)) return c.id;
  }
  return null;
}

/**
 * Catalog rows with duration_days ≥ line. Never 1-day.
 * Sort |duration − line| then goals matched. No Days Off is last and never pre-selected.
 */
export function suggestChallengesForGoals(
  goals: readonly OnboardingGoal[],
  catalog: readonly SuggestableChallenge[],
  limit = 3,
  line?: number | null,
): SuggestableChallenge[] {
  const resolved = resolveOnboardingLine(line);
  const joinable = catalog.filter(
    (c) =>
      typeof c.id === "string" &&
      isJoinableChallengeId(c.id) &&
      meetsOnboardingDuration(c.duration_days, resolved),
  );
  if (joinable.length === 0) return [];

  const noDaysOff = joinable.filter(isNoDaysOffChallenge);
  const rest = joinable.filter((c) => !isNoDaysOffChallenge(c));
  const ranked = rest
    .map((row) => ({ row, score: goalScore(row, goals) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      const da = Math.abs((a.row.duration_days ?? 0) - resolved);
      const db = Math.abs((b.row.duration_days ?? 0) - resolved);
      if (da !== db) return da - db;
      if (b.score !== a.score) return b.score - a.score;
      return a.row.id.localeCompare(b.row.id);
    })
    .map((entry) => entry.row);

  const ndo = noDaysOff[0];
  const regularLimit = ndo ? Math.max(0, limit - 1) : limit;
  const regular = ranked.slice(0, regularLimit);
  if (!ndo) return regular;
  return [...regular, ndo];
}

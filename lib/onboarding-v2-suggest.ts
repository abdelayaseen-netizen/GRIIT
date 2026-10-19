import type { OnboardingGoal } from "@/store/onboardingStore";
import { goalFromCategory, goalFromTitle, inferChallengeGoalTags } from "@/lib/goal-challenge-map";
import { parseTargetStreak } from "@/lib/onboarding-v2-target-streak-parse";
import type { SuggestionTask } from "@/lib/onboarding-v2-first-challenge";
import { dedupeChallengesByTitle } from "@/lib/challenge-dedupe";

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
  visibility?: string | null;
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
  running: "Matches running",
  health: "Matches health",
};

export { inferChallengeGoalTags };

/** Named titles and the stored category win. Keywords fill in only when those miss. */
export function matchReasonForChallenge(
  c: SuggestableChallenge,
  goals: readonly OnboardingGoal[]
): string {
  const titled = goalFromTitle(c.title);
  if (titled) return MATCH_REASON[titled];
  const fromCategory = goalFromCategory(c.category);
  if (fromCategory && goals.includes(fromCategory)) return MATCH_REASON[fromCategory];
  const selected = new Set(goals);
  const hit = inferChallengeGoalTags(c).find((tag) => selected.has(tag));
  return hit ? MATCH_REASON[hit] : "Popular first challenge";
}

/**
 * Team challenges need an invite. Duo / shared_goal waiting rooms only add a
 * member row — no enrollment — so they are not a first join. Private rows are
 * not a first join.
 */
export function isRecommendableChallenge(c: {
  participation_type?: string | null;
  visibility?: string | null;
}): boolean {
  const part = (c.participation_type ?? "solo").toLowerCase();
  if (part === "team" || part === "duo" || part === "shared_goal") return false;
  const vis = (c.visibility ?? "public").toLowerCase();
  if (vis === "private" || vis === "friends") return false;
  return true;
}

export function countNoun(n: number, singular: string, plural: string): string {
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`;
}

/** Stored participants_count. Hidden under 10. The column is not split by is_test. */
export function doingItLine(count: number | null | undefined): string | null {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 10) return null;
  return `${Math.floor(n).toLocaleString("en-US")} doing it`;
}

export function challengeDetailLine(c: SuggestableChallenge): string {
  const days = c.duration_days != null ? countNoun(c.duration_days, "day", "days") : null;
  const taskCount = Array.isArray(c.tasks) ? c.tasks.length : 0;
  const tasks = taskCount > 0 ? countNoun(taskCount, "task", "tasks") : null;
  const doing = doingItLine(c.participants_count);
  const line = [days, tasks, doing, "daily"].filter(Boolean).join(" · ");
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
  const titled = goalFromTitle(c.title);
  if (titled) return goals.includes(titled) ? 2 : 0;
  const fromCategory = goalFromCategory(c.category);
  const selected = new Set(goals);
  const keyword = inferChallengeGoalTags(c).filter((tag) => selected.has(tag)).length;
  if (fromCategory && selected.has(fromCategory)) return 2 + keyword;
  return keyword;
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
  const joinable = dedupeChallengesByTitle(
    catalog.filter(
      (c) =>
        typeof c.id === "string" &&
        isJoinableChallengeId(c.id) &&
        isRecommendableChallenge(c) &&
        meetsOnboardingDuration(c.duration_days, resolved),
    ),
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
  const popular = [...rest].sort((a, b) => {
    const count = (Number(b.participants_count) || 0) - (Number(a.participants_count) || 0);
    if (count !== 0) return count;
    return a.id.localeCompare(b.id);
  });
  const pool = ranked.length > 0 ? ranked : popular;
  const regular = pool.slice(0, regularLimit);
  if (!ndo) return regular;
  return [...regular, ndo];
}

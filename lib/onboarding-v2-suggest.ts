import type { OnboardingGoal } from "@/store/onboardingStore";

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

const GOAL_ORDER: OnboardingGoal[] = [
  "physical_toughness",
  "mental_discipline",
  "daily_habits",
  "reading_learning",
  "cold_exposure",
  "sleep_recovery",
];

const GOAL_MATCH: Record<OnboardingGoal, { categories: string[]; keywords: string[] }> = {
  physical_toughness: {
    categories: ["fitness", "body"],
    keywords: ["run", "steps", "workout", "5k", "walk", "move", "training"],
  },
  mental_discipline: {
    categories: ["discipline", "focus"],
    keywords: ["discipline", "focus", "phone", "morning", "warrior"],
  },
  daily_habits: {
    categories: ["discipline"],
    keywords: ["water", "bed", "habit", "daily", "drink", "consistent"],
  },
  reading_learning: {
    categories: ["mind"],
    keywords: ["read", "journal", "pages", "learn", "gratitude", "mindful"],
  },
  cold_exposure: {
    categories: ["discipline", "fitness"],
    keywords: ["cold", "shower"],
  },
  sleep_recovery: {
    categories: [],
    keywords: ["sleep", "rest", "recovery", "lights", "bedtime"],
  },
};

const MATCH_REASON: Record<OnboardingGoal, string> = {
  physical_toughness: "Matches physical toughness",
  mental_discipline: "Matches mental discipline",
  daily_habits: "Matches daily habits",
  reading_learning: "Matches reading & learning",
  cold_exposure: "Matches cold exposure",
  sleep_recovery: "Matches sleep & recovery",
};

function haystack(c: SuggestableChallenge): string {
  return `${c.title ?? ""} ${c.description ?? ""} ${c.category ?? ""}`.toLowerCase();
}

function challengeMatchesGoal(c: SuggestableChallenge, goal: OnboardingGoal): boolean {
  const match = GOAL_MATCH[goal];
  if (!match) return false;
  const text = haystack(c);
  const category = (c.category ?? "").toLowerCase();
  if (match.categories.some((cat) => category === cat || category.includes(cat))) return true;
  return match.keywords.some((word) => text.includes(word));
}

/** Keyword/category scorer as the tag source — challenges have no tags column. */
export function inferChallengeGoalTags(c: SuggestableChallenge): OnboardingGoal[] {
  return GOAL_ORDER.filter((goal) => challengeMatchesGoal(c, goal));
}

function scoreChallenge(c: SuggestableChallenge, goals: readonly OnboardingGoal[]): number {
  if (goals.length === 0) return 0;
  const selected = new Set(goals);
  return inferChallengeGoalTags(c).filter((tag) => selected.has(tag)).length;
}

/** First intersecting inferred tag, else "Popular first challenge". */
export function matchReasonForChallenge(
  c: SuggestableChallenge,
  goals: readonly OnboardingGoal[]
): string {
  const selected = new Set(goals);
  const hit = inferChallengeGoalTags(c).find((tag) => selected.has(tag));
  return hit ? MATCH_REASON[hit] : "Popular first challenge";
}

export function challengeDetailLine(c: SuggestableChallenge): string {
  const days = c.duration_days != null ? `${c.duration_days} days` : null;
  const taskCount = Array.isArray(c.tasks) ? c.tasks.length : 0;
  const tasks = taskCount > 0 ? `${taskCount} tasks` : null;
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
  const ranked = [...joinable].sort((a, b) => {
    const diff = scoreChallenge(b, goals) - scoreChallenge(a, goals);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
  return ranked.slice(0, limit);
}

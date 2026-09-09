import type { OnboardingGoal } from "@/store/onboardingStore";

/** Catalog row. Filter uses `category`; challenges have no tags column. */
export type ChallengeMapRow = {
  id: string;
  title?: string;
  description?: string | null;
  category?: string | null;
};

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

function haystack(c: ChallengeMapRow): string {
  return `${c.title ?? ""} ${c.description ?? ""} ${c.category ?? ""}`.toLowerCase();
}

function challengeMatchesGoal(c: ChallengeMapRow, goal: OnboardingGoal): boolean {
  const match = GOAL_MATCH[goal];
  if (!match) return false;
  const text = haystack(c);
  const category = (c.category ?? "").toLowerCase();
  if (match.categories.some((cat) => category === cat || category.includes(cat))) return true;
  return match.keywords.some((word) => text.includes(word));
}

export function inferChallengeGoalTags(c: ChallengeMapRow): OnboardingGoal[] {
  return GOAL_ORDER.filter((goal) => challengeMatchesGoal(c, goal));
}

function scoreChallenge(c: ChallengeMapRow, goals: readonly OnboardingGoal[]): number {
  if (goals.length === 0) return 0;
  const selected = new Set(goals);
  return inferChallengeGoalTags(c).filter((tag) => selected.has(tag)).length;
}

/** Rank catalog rows by selected goals using `category` plus title/description keywords. */
export function filterChallengesByGoals<T extends ChallengeMapRow>(
  goals: readonly OnboardingGoal[],
  rows: readonly T[],
  limit = 3
): T[] {
  const ranked = [...rows].sort((a, b) => {
    const diff = scoreChallenge(b, goals) - scoreChallenge(a, goals);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
  return ranked.slice(0, limit);
}

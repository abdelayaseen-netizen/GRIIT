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
  "faith_prayer",
];

export const GOAL_LABELS: Record<OnboardingGoal, string> = {
  physical_toughness: "Physical toughness",
  mental_discipline: "Mental discipline",
  daily_habits: "Daily habits",
  reading_learning: "Reading and learning",
  cold_exposure: "Cold exposure",
  sleep_recovery: "Sleep and recovery",
  faith_prayer: "Faith and prayer",
};

const GOAL_MATCH: Record<OnboardingGoal, { categories: string[]; keywords: string[] }> = {
  physical_toughness: {
    categories: ["fitness", "body"],
    keywords: ["run", "steps", "workout", "5k", "walk", "move", "training"],
  },
  mental_discipline: {
    categories: ["mind", "focus", "discipline"],
    keywords: ["meditat", "journal", "focus", "phone"],
  },
  daily_habits: {
    categories: ["discipline"],
    keywords: ["water", "bed", "habit", "daily", "drink", "consistent"],
  },
  reading_learning: {
    categories: [],
    keywords: ["read", "pages", "book", "learn", "course", "language"],
  },
  cold_exposure: {
    categories: ["discipline", "fitness"],
    keywords: ["cold", "shower"],
  },
  sleep_recovery: {
    categories: [],
    keywords: ["sleep", "bed", "bedtime", "lights", "rest", "recovery", "sunset", "screen"],
  },
  faith_prayer: {
    categories: ["faith"],
    keywords: ["pray", "prayer", "salah", "quran", "dhikr", "fajr", "mosque", "deen"],
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

/** Rank catalog rows by selected goals. Never returns a row with score 0. */
export function filterChallengesByGoals<T extends ChallengeMapRow>(
  goals: readonly OnboardingGoal[],
  rows: readonly T[],
  limit = 3
): T[] {
  return [...rows]
    .map((row) => ({ row, score: scoreChallenge(row, goals) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (diff !== 0) return diff;
      return a.row.id.localeCompare(b.row.id);
    })
    .slice(0, limit)
    .map((entry) => entry.row);
}

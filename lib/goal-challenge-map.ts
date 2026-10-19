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
  "running",
  "health",
];

/** Build 92 09.1: the Part 3 labels; cold exposure and sleep stay for goals saved before build 92. */
export const GOAL_LABELS: Record<OnboardingGoal, string> = {
  physical_toughness: "Fitness and gym",
  mental_discipline: "Mind",
  daily_habits: "Discipline",
  reading_learning: "Reading",
  cold_exposure: "Cold exposure",
  sleep_recovery: "Sleep and recovery",
  faith_prayer: "Faith and prayer",
  running: "Running",
  health: "Health",
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
  running: {
    categories: ["running"],
    keywords: ["run", "5k", "10k", "mile", "jog", "strava"],
  },
  health: {
    categories: ["health"],
    keywords: ["water", "sleep", "steps", "walk", "cold", "shower", "sugar", "diet", "hydrat"],
  },
};

const CATEGORY_GOAL: Record<string, OnboardingGoal> = {
  faith: "faith_prayer",
  prayer: "faith_prayer",
  fitness: "physical_toughness",
  body: "physical_toughness",
  mind: "mental_discipline",
  focus: "mental_discipline",
  health: "health",
  running: "running",
  learning: "reading_learning",
  discipline: "daily_habits",
  habit: "daily_habits",
  habits: "daily_habits",
  "daily habits": "daily_habits",
};

/** The stored category, not a keyword in the title. */
export function goalFromCategory(category: string | null | undefined): OnboardingGoal | null {
  const c = (category ?? "").trim().toLowerCase();
  if (!c) return null;
  return CATEGORY_GOAL[c] ?? null;
}

/** Named faith and 75 Hard titles keep their goal even when the category column is wrong. */
export function goalFromTitle(title: string | null | undefined): OnboardingGoal | null {
  const t = (title ?? "").trim().toLowerCase();
  if (!t) return null;
  if (/pray|prayer|quran|masjid|salah|dhikr/.test(t)) return "faith_prayer";
  if (/75/.test(t) && /hard/.test(t)) return "physical_toughness";
  return null;
}

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

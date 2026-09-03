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
};

function haystack(c: SuggestableChallenge): string {
  return `${c.title ?? ""} ${c.description ?? ""} ${c.category ?? ""}`.toLowerCase();
}

function scoreChallenge(c: SuggestableChallenge, goals: readonly OnboardingGoal[]): number {
  const text = haystack(c);
  const category = (c.category ?? "").toLowerCase();
  let score = 0;
  for (const goal of goals) {
    const match = GOAL_MATCH[goal];
    if (!match) continue;
    if (match.categories.some((cat) => category === cat || category.includes(cat))) {
      score += 3;
    }
    for (const word of match.keywords) {
      if (text.includes(word)) score += 2;
    }
  }
  return score;
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

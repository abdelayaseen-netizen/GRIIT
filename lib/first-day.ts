/**
 * Build 92 chunk 09 (Part 3 · first day): the goals, Start here and the join toast.
 * Copy is the Part 3 copy table, word for word.
 */
import type { OnboardingGoal } from "@/store/onboardingStore";
import { day1TomorrowLabel } from "@/lib/time-enforcement";

/** 2 columns of 56 pt cards; Faith and prayer is second so it is never under the button. */
export const FIRST_DAY_GOALS: readonly { id: OnboardingGoal; label: string }[] = [
  { id: "physical_toughness", label: "Fitness and gym" },
  { id: "faith_prayer", label: "Faith and prayer" },
  { id: "running", label: "Running" },
  { id: "reading_learning", label: "Reading" },
  { id: "health", label: "Health" },
  { id: "daily_habits", label: "Discipline" },
  { id: "mental_discipline", label: "Mind" },
];

export const MAX_FIRST_DAY_GOALS = 3;

export const GOALS_COPY = {
  title: "What are you building?",
  subtitle: "Pick up to 3. We'll suggest challenges that match.",
  cta: "Continue",
} as const;

export function goalHint(n: number): string {
  return n > 0 ? `${n} of 3 picked` : "Pick at least one";
}

/** A 4th pick swaps out the oldest (and says which); a second tap unpicks. */
export function pickGoal<T extends string>(
  selected: readonly T[],
  id: T,
  max: number = MAX_FIRST_DAY_GOALS,
): { next: T[]; swappedOut: T | null } {
  if (selected.includes(id)) return { next: selected.filter((g) => g !== id), swappedOut: null };
  if (selected.length < max) return { next: [...selected, id], swappedOut: null };
  const [oldest, ...rest] = selected;
  return { next: [...rest, id], swappedOut: oldest ?? null };
}

export const START_HERE_COPY = {
  title: "Start here",
  subtitle: "Join one to start today. You can add more later.",
  join: "Join",
  joining: "Joining",
  browse: "Browse all challenges",
  browseAll: "Browse all",
  empty: (goal: string) => `Nothing open right now for ${goal}.`,
};

export const FREEZE_LINE =
  "Miss a day? A freeze covers it so your streak doesn’t break. You earn one every 7 days in a row.";

export const JOINED_TOAST = "You’re in. Day 1 is today.";

type WithTasks = { tasks?: readonly object[] | { length?: number } | null };

/**
 * The first card can always be finished today. A challenge whose window has closed today keeps
 * its place among the other closed ones, after every open one, labelled "Day 1 is tomorrow at {time}".
 */
export function orderStartHere<T extends WithTasks>(
  challenges: readonly T[],
  now: Date = new Date(),
  timeZone?: string,
): { challenge: T; startsTomorrow: string | null }[] {
  const rows = challenges.map((challenge) => ({
    challenge,
    startsTomorrow: day1TomorrowLabel(
      Array.isArray(challenge.tasks) ? (challenge.tasks as readonly object[]) : [],
      now,
      timeZone,
    ),
  }));
  return [...rows.filter((r) => !r.startsTomorrow), ...rows.filter((r) => r.startsTomorrow)];
}

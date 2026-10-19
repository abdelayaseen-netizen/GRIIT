/**
 * Build 92 10.2 (P3-14, P3-15, P3-16): the joined challenge page. Two numbers, the dots from the
 * same day records (`challenges.progress.days`), the dot key once, "Your posts here", one primary.
 */
import type { WeekStripDay } from "@/components/ds/WeekStrip";
import { audienceLabel, type PostAudience } from "@/lib/post-audience";

export const DOT_KEY = {
  secured: "Secured",
  today: "Today",
  freeze: "Held by a freeze",
  missed: "Missed",
  before: "Before you joined",
} as const;

export const DOT_KEY_COPY = { title: "What the dots mean", done: "Got it" } as const;

export function topNumbers(e: { day: number; total: number; secured: number }): { day: string; secured: string } {
  const secured = Math.max(0, Math.floor(e.secured));
  return {
    day: `Day ${e.day} of ${e.total}`,
    secured: `${secured} ${secured === 1 ? "day" : "days"} secured`,
  };
}

export const START_TODAY = "Start today’s task";
export const TODAY_DONE = "Today’s task is done";

export function joinedPrimary(todayDone: boolean): { label: string; disabled: boolean } {
  return todayDone ? { label: TODAY_DONE, disabled: true } : { label: START_TODAY, disabled: false };
}

export function visibilityRow(aud: PostAudience): string {
  return `Your posts here: ${audienceLabel(aud)}`;
}

export const POSTS_HERE_SHEET = {
  title: (challenge: string) => `Your posts in ${challenge}`,
  body: "The default for new posts in this challenge. You can still change it on each post.",
  save: "Save",
} as const;

type DayState = "before_join" | "secured" | "held" | "missed" | "today" | "future" | string;
type StripState = NonNullable<WeekStripDay["state"]>;

/** One state per week key. Held days are a freeze, never secured; today is the outlined ring. */
export function weekDotsFromProgress(
  days: readonly { date_key: string; state: DayState }[],
  weekKeys: readonly string[],
  todaySecured: boolean,
): StripState[] {
  const byKey = new Map(days.map((d) => [d.date_key, d.state]));
  const first = days[0]?.date_key ?? null;
  return weekKeys.map((key) => {
    const state = byKey.get(key);
    if (state === "secured") return "secured";
    if (state === "held") return "frozen";
    if (state === "missed") return "missed";
    // WeekStrip draws an open today as the outlined ring from "missed" + todayIndex.
    if (state === "today") return todaySecured ? "secured" : "missed";
    if (state === "future") return "future";
    if (state === "before_join") return "before";
    if (first && key < first) return "before";
    return "future";
  });
}

/** First-day starter. One row per user. The client never writes the table. */

export const STARTER_TITLES = [
  "Drink a glass of water",
  "Write one thing you’re grateful for",
  "Lay out tomorrow’s workout clothes",
  "Set tomorrow’s alarm",
  "Read one page",
  "Make your bed",
] as const;

export const STARTER_MAX = 40;
export const GRATEFUL_TITLE = "Write one thing you’re grateful for";

export function starterTitleError(raw: string): "Write a task first." | "Keep it to 40 characters." | null {
  const title = raw.trim();
  if (!title) return "Write a task first.";
  if (title.length > STARTER_MAX) return "Keep it to 40 characters.";
  return null;
}

export function starterSource(title: string): "picked" | "written" {
  return (STARTER_TITLES as readonly string[]).includes(title.trim()) ? "picked" : "written";
}

/** +1 freeze once, and only while the hold is under the cap. */
export function starterFreezeGrant(input: {
  alreadyGranted: boolean;
  held: number;
  cap: number;
}): { grant: boolean; nextHeld: number } {
  const held = Math.max(0, Math.floor(input.held));
  const cap = Math.max(0, Math.floor(input.cap));
  if (input.alreadyGranted || cap <= 0 || held >= cap) {
    return { grant: false, nextHeld: Math.min(held, cap || held) };
  }
  return { grant: true, nextHeld: held + 1 };
}

/** Unfinished starters disappear at midnight and never return. */
export function starterIsExpired(createdDateKey: string, todayKey: string): boolean {
  return createdDateKey < todayKey;
}

/** Onboarding joins start tomorrow while the starter owns today. */
export function starterJoinStartsTomorrow(input: {
  requested: boolean;
  todaySecured: boolean;
  windowClosed: boolean;
}): boolean {
  return input.requested || input.todaySecured || input.windowClosed;
}

export const WHY_PROOF_HOLD_MS = 600;
export const WHY_PROOF_RING_MS = 240;
export const WHY_PROOF_HEADER_MS = 360;
export const WHY_PROOF_FADE_MS = 200;

export const WHY_PROOF_TITLE = "Streaks are easy to fake.";
export const WHY_PROOF_SUB =
  "Here the day is secured only when every task is done. The server decides, not you.";
export const WHY_PROOF_START = "2 of 3. The day is not secured.";
export const WHY_PROOF_END = "Day secured. 3 of 3 tasks.";

export const WHY_CIRCLE_TITLE = "Discipline, witnessed.";
export const WHY_CIRCLE_SUB =
  "People you follow see what you share. Your proof stays private until you share it.";

export const ACCOUNT_TITLE = "Save your streak.";
export const ACCOUNT_PHONE_LINE = "So your days stay yours if you change phones.";
export const ACCOUNT_SKIP = "Skip — I'll risk losing my progress";

export function accountInLine(challenge: string | null | undefined): string {
  const name = (challenge ?? "").trim() || "your challenge";
  return `You are in ${name}. Day 1 is today.`;
}

export function accountSavedChallengeLine(title: string, durationDays: number): string {
  return `${title} Day 1 of ${durationDays}`;
}

export function accountSavedLineDays(n: number): string {
  return `Your line ${n} days`;
}

export function accountSavedReminder(time: string): string {
  return `Reminder ${time}`;
}

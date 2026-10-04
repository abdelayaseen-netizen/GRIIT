import { addCalendarDaysToDateKey } from "./date-utils";

export type V42BadgeId =
  | "streak_3"
  | "streak_7"
  | "streak_14"
  | "streak_30"
  | "streak_75"
  | "secured_100"
  | "finish_1"
  | "finish_3"
  | "comeback"
  | "full_house"
  | "early_10"
  | "camera_30";

export type V42BadgeDef = {
  id: V42BadgeId;
  name: string;
  mark: string;
  rule: string;
  target: number;
};

export const V42_BADGES: V42BadgeDef[] = [
  { id: "streak_3", name: "3-day streak", mark: "3", rule: "Secure 3 days in a row.", target: 3 },
  { id: "streak_7", name: "7-day streak", mark: "7", rule: "Secure 7 days in a row.", target: 7 },
  { id: "streak_14", name: "14-day streak", mark: "14", rule: "Secure 14 days in a row.", target: 14 },
  { id: "streak_30", name: "30-day streak", mark: "30", rule: "Secure 30 days in a row.", target: 30 },
  { id: "streak_75", name: "75-day streak", mark: "75", rule: "Secure 75 days in a row.", target: 75 },
  { id: "secured_100", name: "100 days secured", mark: "100", rule: "Secure 100 days in total.", target: 100 },
  { id: "finish_1", name: "First finish", mark: "flag", rule: "Finish a challenge.", target: 1 },
  { id: "finish_3", name: "Three finishes", mark: "flag-triangle-right", rule: "Finish three challenges.", target: 3 },
  { id: "comeback", name: "Comeback", mark: "rotate-ccw", rule: "Secure a day right after a day that wasn't secured.", target: 1 },
  { id: "full_house", name: "Full house", mark: "users", rule: "Finish a group challenge where every member finished.", target: 1 },
  { id: "early_10", name: "Early", mark: "sunrise", rule: "Secure 10 days that included a task with a Time gate.", target: 10 },
  { id: "camera_30", name: "Camera 30", mark: "camera", rule: "Post 30 proofs taken with the camera.", target: 30 },
];

export const V42_BADGE_COUNT = 12;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function earnedOnLine(dateKey: string): string {
  const parts = dateKey.slice(0, 10).split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day || month < 1 || month > 12) return "Earned.";
  return `Earned ${day} ${MONTHS[month - 1]}.`;
}

export type V42BadgeFacts = {
  securedKeys: readonly string[];
  dueKeys: readonly string[];
  holdKeys: readonly string[];
  completedEndedKeys: readonly string[];
  fullHouseAt?: string | null;
  timeGateSecuredKeys: readonly string[];
  cameraProofKeys: readonly string[];
  /** Live streak. Unearned streak badges count this, not the best run. */
  currentStreak?: number;
};

export type V42BadgeState = V42BadgeDef & {
  earned: boolean;
  have: number;
  earnedOn?: string;
  progress: string;
};

function uniqSorted(keys: readonly string[]): string[] {
  return [...new Set(keys.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)))].sort();
}

/** Longest secured run. Holds keep the run; they do not add. */
export function longestSecuredRun(
  securedKeys: readonly string[],
  holdKeys: readonly string[] = [],
): { length: number; firstHit: Partial<Record<number, string>> } {
  const secured = new Set(securedKeys);
  const holds = new Set(holdKeys);
  const all = uniqSorted([...securedKeys, ...holdKeys]);
  if (all.length === 0) return { length: 0, firstHit: {} };
  let cursor = all[0]!;
  const last = all[all.length - 1]!;
  let run = 0;
  let best = 0;
  const firstHit: Partial<Record<number, string>> = {};
  while (cursor <= last) {
    if (secured.has(cursor)) {
      run += 1;
      if (run > best) best = run;
      if (!firstHit[run]) firstHit[run] = cursor;
      cursor = addCalendarDaysToDateKey(cursor, 1);
      continue;
    }
    if (holds.has(cursor)) {
      cursor = addCalendarDaysToDateKey(cursor, 1);
      continue;
    }
    run = 0;
    cursor = addCalendarDaysToDateKey(cursor, 1);
  }
  return { length: best, firstHit };
}

export function comebackDate(securedKeys: readonly string[], dueKeys: readonly string[], holdKeys: readonly string[]): string | null {
  const secured = new Set(securedKeys);
  const due = new Set(dueKeys);
  const holds = new Set(holdKeys);
  for (const key of uniqSorted(securedKeys)) {
    const prev = addCalendarDaysToDateKey(key, -1);
    if (due.has(prev) && !secured.has(prev) && !holds.has(prev)) return key;
  }
  return null;
}

function of(have: number, target: number): string {
  return `${Math.min(have, target)} of ${target}`;
}

export function evaluateV42Badges(facts: V42BadgeFacts): V42BadgeState[] {
  const secured = uniqSorted(facts.securedKeys);
  const run = longestSecuredRun(secured, facts.holdKeys);
  const completed = facts.completedEndedKeys.filter(Boolean);
  const come = comebackDate(secured, facts.dueKeys, facts.holdKeys);
  const early = uniqSorted(facts.timeGateSecuredKeys);
  const camera = uniqSorted(facts.cameraProofKeys);
  const bestRun = run.length;
  const current =
    facts.currentStreak == null
      ? bestRun
      : Math.max(0, Math.floor(facts.currentStreak));
  const streakHave = (target: number) => (bestRun >= target ? bestRun : current);
  const haveById: Record<V42BadgeId, number> = {
    streak_3: streakHave(3),
    streak_7: streakHave(7),
    streak_14: streakHave(14),
    streak_30: streakHave(30),
    streak_75: streakHave(75),
    secured_100: secured.length,
    finish_1: completed.length,
    finish_3: completed.length,
    comeback: come ? 1 : 0,
    full_house: facts.fullHouseAt ? 1 : 0,
    early_10: early.length,
    camera_30: camera.length,
  };
  const earnedOnById: Partial<Record<V42BadgeId, string>> = {
    streak_3: run.firstHit[3],
    streak_7: run.firstHit[7],
    streak_14: run.firstHit[14],
    streak_30: run.firstHit[30],
    streak_75: run.firstHit[75],
    secured_100: secured[99],
    finish_1: completed[0],
    finish_3: completed[2],
    comeback: come ?? undefined,
    full_house: facts.fullHouseAt ?? undefined,
    early_10: early[9],
    camera_30: camera[29],
  };
  return V42_BADGES.map((def) => {
    const have = haveById[def.id];
    const earned = have >= def.target;
    const streak = def.id.startsWith("streak_");
    const progress = earned
      ? earnedOnLine(earnedOnById[def.id] ?? "")
      : streak
        ? `${of(have, def.target)}. Your streak is ${have} days.`
        : def.target === 1
          ? "Not yet"
          : of(have, def.target);
    return {
      ...def,
      earned,
      have,
      earnedOn: earned ? earnedOnById[def.id] : undefined,
      progress,
    };
  });
}

export function badgesEarnedLine(rows: readonly { earned: boolean }[]): string {
  const n = rows.filter((r) => r.earned).length;
  return `${n} of ${V42_BADGE_COUNT} earned`;
}

/**
 * Profile v2 badge marks vs current ACHIEVEMENTS
 * (backend/lib/achievement-definitions.ts:15–50).
 *
 * Stored rows live in public.user_achievements (achievement_key, unlocked_at).
 * There is no separate badges table. Mapping is display + optional key alias.
 * Earn notifications are out of scope.
 */

export type ProfileV2BadgeNeed = 3 | 7 | 14 | 30 | 100;
export type ProfileV2BadgeSource = "bestStreak" | "verifiedDays";

export type ProfileV2BadgeDef = {
  need: ProfileV2BadgeNeed;
  name: string;
  rule: string;
  source: ProfileV2BadgeSource;
  /** Canonical stored key after the (unapplied) mapping migration. */
  canonicalKey: string;
  /** Existing ACHIEVEMENTS keys that count as this mark. */
  legacyKeys: string[];
  /** Current labels cited from ACHIEVEMENTS. */
  legacyLabels: string[];
};

export const PROFILE_V2_BADGES: ProfileV2BadgeDef[] = [
  {
    need: 3,
    name: "3 days",
    rule: "Three consecutive verified days",
    source: "bestStreak",
    canonicalKey: "3day",
    legacyKeys: ["3day"],
    legacyLabels: ["3-Day Fire"],
  },
  {
    need: 7,
    name: "7 days",
    rule: "Seven consecutive verified days",
    source: "bestStreak",
    canonicalKey: "7day",
    legacyKeys: ["7day", "streak_7"],
    legacyLabels: ["Week Warrior", "7-Day Streak"],
  },
  {
    need: 14,
    name: "14 days",
    rule: "Fourteen consecutive verified days",
    source: "bestStreak",
    canonicalKey: "14day",
    legacyKeys: ["14day", "streak_14", "consistency"],
    legacyLabels: ["Fortnight", "14-Day Streak", "Consistency"],
  },
  {
    need: 30,
    name: "30 days",
    rule: "Thirty consecutive verified days",
    source: "bestStreak",
    canonicalKey: "30day",
    legacyKeys: ["30day", "streak_30"],
    legacyLabels: ["Month Master", "30-Day Streak"],
  },
  {
    need: 100,
    name: "100 verified",
    rule: "One hundred verified days in total",
    source: "verifiedDays",
    canonicalKey: "total_days_100",
    legacyKeys: ["total_days_100"],
    legacyLabels: ["Century Grinder"],
  },
];

/** Keys that stay in user_achievements but are not profile-v2 marks. */
export const PROFILE_V2_UNMAPPED_ACHIEVEMENT_KEYS = [
  "60day",
  "streak_75",
  "streak_100",
] as const;

export function badgeHave(source: ProfileV2BadgeSource, bestStreak: number, verifiedDays: number): number {
  return source === "verifiedDays" ? verifiedDays : bestStreak;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function formatDayMonthYear(dateKey: string): string {
  const [y, m, d] = dateKey.slice(0, 10).split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) return "—";
  const mon = MONTHS[m - 1];
  if (!mon) return "—";
  return `${d} ${mon} ${y}`;
}

export function formatBadgeUnlockDate(isoOrKey: string): string {
  const key = /^\d{4}-\d{2}-\d{2}/.test(isoOrKey) ? isoOrKey.slice(0, 10) : null;
  if (!key) {
    const d = new Date(isoOrKey);
    if (Number.isNaN(d.getTime())) return "Earned";
    return `Earned ${formatDayMonthYear(d.toISOString().slice(0, 10))}`;
  }
  return `Earned ${formatDayMonthYear(key)}`;
}

export function badgeRowsFromProgress(input: {
  bestStreak: number;
  verifiedDays: number;
  /** canonical or legacy key → unlock instant */
  unlocks?: Record<string, string>;
}): {
  need: ProfileV2BadgeNeed;
  name: string;
  rule: string;
  source: ProfileV2BadgeSource;
  earned: boolean;
  state: string;
  progress: number;
}[] {
  const unlocks = input.unlocks ?? {};
  return PROFILE_V2_BADGES.map((b) => {
    const have = badgeHave(b.source, input.bestStreak, input.verifiedDays);
    const earned = have >= b.need;
    const unlockAt = b.legacyKeys.map((k) => unlocks[k]).find(Boolean);
    return {
      need: b.need,
      name: b.name,
      rule: b.rule,
      source: b.source,
      earned,
      state: earned
        ? unlockAt
          ? formatBadgeUnlockDate(unlockAt)
          : "Earned"
        : `${have} / ${b.need}`,
      progress: Math.min(1, have / b.need),
    };
  });
}

const WEEK_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven"] as const;

export const BOARD_RULE =
  "Secured days since Monday. A day counts when every task in this challenge is done.";
export const LAST_7_DAYS = "Last 7 days";
export const LAST_7_DAYS_RULE = "Secured days in the last 7 days.";
export const TOP_OF_CHALLENGE = "Top of the challenge";
export const AROUND_YOU = "Around you";
export const YOU_ARE_ON_THIS_BOARD = "You are on this board.";
export const LEAVE_IT = "Leave it";
export const JOIN_THE_BOARD = "Join the board";
export const NO_BOARD_YET = "No board yet";
export const TWO_PERSON_LINE =
  "Two people in this challenge. A board of two is a comparison, not a ranking.";

export function elapsedWeekLine(ended: number): string {
  const n = Math.max(0, Math.min(7, Math.floor(ended)));
  const word = WEEK_WORDS[n] ?? String(n);
  const noun = n === 1 ? "day" : "days";
  const verb = n === 1 ? "has" : "have";
  return `${word} ${noun} of the week ${verb} ended.`;
}

export function ranksBelowLine(lowestShown: number): string {
  return `Ranks below ${lowestShown} are not shown, to you or to anyone.`;
}

export function onlyPersonLine(challenge: string): string {
  return `You are the only person in ${challenge}. Invite someone and the board starts on the Monday after they join.`;
}

export function youMark(isYou: boolean): string {
  return isYou ? "· you" : "";
}

export type BoardMember = {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  secured: number;
  /** Build 92 08.5: secured days this week that carried a proof. */
  verified?: number;
  /** Build 92 08.5: when the latest secured day landed; earlier wins a tie. */
  lastSecuredAt?: string | null;
};

export type RankedMember = BoardMember & { rank: number; you: boolean };

/** Build 92 08.5: your row reads "You". */
export const BOARD_YOU = "You";
export const BOARD_WEEK_DAYS = 7;

/** "3 of 7 · 2 verified"; "0 of 7" when nothing is verified. */
export function boardRowLine(secured: number, verified: number): string {
  const base = `${secured} of ${BOARD_WEEK_DAYS}`;
  return verified > 0 ? `${base} · ${verified} verified` : base;
}

/**
 * Build 92 08.5 (P2-16): secured desc, then verified desc, then whoever secured earlier.
 * Ranks are positions, 1..n; the board is a ranking, not a scoreboard with shared places.
 */
export function rankBoard(members: readonly BoardMember[], viewerId: string): RankedMember[] {
  const sorted = [...members].sort((a, b) => {
    if (b.secured !== a.secured) return b.secured - a.secured;
    const av = a.verified ?? 0;
    const bv = b.verified ?? 0;
    if (bv !== av) return bv - av;
    const al = a.lastSecuredAt ?? "";
    const bl = b.lastSecuredAt ?? "";
    if (al && bl && al !== bl) return al < bl ? -1 : 1;
    if (al && !bl) return -1;
    if (!al && bl) return 1;
    return a.displayName.localeCompare(b.displayName);
  });
  return sorted.map((m, i) => ({ ...m, rank: i + 1, you: m.userId === viewerId }));
}

export function boardSlices(
  ranked: readonly RankedMember[],
  viewerId: string,
): {
  memberCount: number;
  top: RankedMember[];
  around: RankedMember[];
  lowestShown: number;
  split: boolean;
} {
  const memberCount = ranked.length;
  if (memberCount <= 2) {
    return {
      memberCount,
      top: [...ranked],
      around: [],
      lowestShown: ranked[ranked.length - 1]?.rank ?? 0,
      split: false,
    };
  }
  const top = ranked.slice(0, 3);
  const idx = ranked.findIndex((m) => m.userId === viewerId);
  const center = idx >= 0 ? idx : 0;
  const from = Math.max(0, center - 1);
  const to = Math.min(ranked.length, center + 2);
  const around = ranked.slice(from, to);
  const shown = [...top, ...around];
  const lowestShown = shown.reduce((n, m) => Math.max(n, m.rank), 0);
  return { memberCount, top, around, lowestShown, split: true };
}

export function boardEmptyState(memberCount: number, challenge: string): { heading: string; body: string; cta?: string } | null {
  if (memberCount <= 1) {
    const name = challenge.trim() || "this challenge";
    // Build 92 08.3 (P2-15): Invite opens the invite sheet.
    void name;
    return {
      heading: "A board needs two.",
      body: "Invite someone to see how you compare this week.",
      cta: "Invite",
    };
  }
  return null;
}

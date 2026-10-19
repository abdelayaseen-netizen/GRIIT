/**
 * Build 92 10.4 (P3-19 to P3-21): proofs lead the feed. Today's "started" events fold into one
 * quiet line, placed after the first proof. One line per day means it is never at the top, never
 * next to another started line, and at most one per 5 posts. Started events from earlier days are
 * not shown. A feed with no proofs is the empty state, never a list of started lines.
 */
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { feedEventVerb, type FeedListItem } from "@/lib/feed-join";
import { dateKeyFromIso } from "@/lib/challenge-end";

export type StartedEntry = {
  userId: string;
  name: string;
  challengeId: string | null;
  challengeName: string;
};

export type StartedDayGroup = {
  kind: "startedDay";
  id: string;
  dateKey: string;
  names: string[];
  others: number;
  count: number;
  entries: StartedEntry[];
};

export type FoldedFeedRow = FeedListItem | StartedDayGroup;

export function isStartedDay(item: FoldedFeedRow): item is StartedDayGroup {
  return "kind" in item && item.kind === "startedDay";
}

function isStarted(item: FeedListItem): boolean {
  if ("kind" in item) return item.verb === "started";
  return feedEventVerb(item as LiveFeedPost) === "started";
}

function startedEntries(item: FeedListItem): StartedEntry[] {
  if ("kind" in item) {
    return item.avatars.map((a) => ({
      userId: a.userId,
      name: (a.displayName || a.username || "").trim(),
      challengeId: item.challengeId,
      challengeName: item.challengeName,
    }));
  }
  const post = item as LiveFeedPost;
  return [
    {
      userId: post.userId,
      name: (post.displayName || post.username || "").trim(),
      challengeId: post.challengeId,
      challengeName: post.challengeName,
    },
  ];
}

function createdAtOf(item: FeedListItem): string {
  return item.createdAt;
}

export function foldStartedLines(
  items: readonly FeedListItem[],
  opts: { todayKey: string; timeZone: string },
): FoldedFeedRow[] {
  const proofs: FeedListItem[] = [];
  const entries: StartedEntry[] = [];
  for (const item of items) {
    if (!isStarted(item)) {
      proofs.push(item);
      continue;
    }
    if (dateKeyFromIso(createdAtOf(item), opts.timeZone) !== opts.todayKey) continue;
    for (const e of startedEntries(item)) {
      if (!entries.some((x) => x.userId === e.userId && x.challengeId === e.challengeId)) entries.push(e);
    }
  }
  if (proofs.length === 0) return [];
  if (entries.length === 0) return proofs;

  const names: string[] = [];
  for (const e of entries) if (e.name && !names.includes(e.name)) names.push(e.name);
  const shown = names.slice(0, 2);
  const people = new Set(entries.map((e) => e.userId)).size;
  const group: StartedDayGroup = {
    kind: "startedDay",
    id: `started-${opts.todayKey}`,
    dateKey: opts.todayKey,
    names: shown,
    others: Math.max(0, people - shown.length),
    count: people,
    entries,
  };
  return [proofs[0]!, group, ...proofs.slice(1)];
}

/** "Bilal and Zayd started challenges today", "Bilal, Zayd and 2 others…", "3 people started…". */
export function startedLine(g: Pick<StartedDayGroup, "names" | "others" | "count">): string {
  const names = g.names.filter(Boolean);
  if (names.length === 0) return `${g.count} people started challenges today`;
  if (g.others > 0) return `${names.join(", ")} and ${g.others} ${g.others === 1 ? "other" : "others"} started challenges today`;
  return `${names.join(" and ")} started challenges today`;
}

export const FEED_CAPTION = {
  following: (n: number) => (n > 0 ? `Proofs from the ${n} people you follow.` : "Proofs from people you follow."),
  everyone: "Proofs from everyone on GRIIT, newest first.",
} as const;

export const FEED_EMPTY = {
  following: "No proofs from people you follow yet.",
  everyone: "No proofs yet today.",
  body: "Find a challenge, or invite a friend to start one with you.",
  discover: "Discover",
  invite: "Invite",
} as const;

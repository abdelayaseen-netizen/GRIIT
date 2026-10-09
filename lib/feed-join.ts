import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { checkInHasCameraProof } from "@/backend/lib/proof-predicate";
import { formatOfDays } from "@/lib/format-days";

const HOUR_MS = 60 * 60 * 1000;

/** Seal only when proof_photo_url is present (Camera 30 / frame 129). */
export function showCameraSeal(proofPhotoUrl?: string | null): boolean {
  return checkInHasCameraProof({
    date_key: "1970-01-01",
    proof_photo_url: proofPhotoUrl ?? null,
  });
}

/** Own-post double tap is a no-op. Double tap never removes respect. */
export function doubleTapAction(ownPost: boolean, alreadyRespected: boolean): "noop" | "respect" | "keep" {
  if (ownPost) return "noop";
  return alreadyRespected ? "keep" : "respect";
}

export type FeedEventVerb = "started" | "finished";

export function feedEventVerb(post: Pick<LiveFeedPost, "eventType" | "isCompleted">): FeedEventVerb | null {
  if (post.eventType === "joined_challenge" || post.eventType === "challenge_created") return "started";
  if (post.eventType === "completed_challenge") return "finished";
  return null;
}

function whoLine(names: string[], others: number): string {
  if (names.length === 1 && !others) return names[0] ?? "";
  if (others) return `${names.join(", ")} and ${others}${others === 1 ? " other" : " others"}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Two names, then "and n others". Frame 1226: "Bilal, Zayd and 2 others". */
export function startedWho(names: string[], others: number): string {
  const listed = names.filter(Boolean).slice(0, 2);
  const extra = Math.max(0, names.filter(Boolean).length - listed.length) + Math.max(0, others);
  if (listed.length === 0) return "";
  if (extra === 0) {
    if (listed.length === 1) return listed[0]!;
    return `${listed[0]} and ${listed[1]}`;
  }
  const rest = `${extra} ${extra === 1 ? "other" : "others"}`;
  if (listed.length === 1) return `${listed[0]} and ${rest}`;
  return `${listed[0]}, ${listed[1]} and ${rest}`;
}

export function joinLine(names: string[], others: number, challenge: string): string {
  return `${startedWho(names, others)} started ${challenge}`;
}

export type FeedEventAvatar = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type FeedEventGroup = {
  kind: "join" | "event";
  verb: FeedEventVerb;
  id: string;
  challengeId: string | null;
  challengeName: string;
  names: string[];
  others: number;
  createdAt: string;
  memberIds: string[];
  avatars: FeedEventAvatar[];
  dayN: number;
  dayOf: number;
  secured: number;
};

export type FeedJoinGroup = FeedEventGroup;
export type FeedListItem = LiveFeedPost | FeedEventGroup;

export function isJoinEvent(post: LiveFeedPost): boolean {
  return feedEventVerb(post) === "started";
}

export function isJoinGroup(item: FeedListItem): item is FeedEventGroup {
  return "kind" in item && (item.kind === "join" || item.kind === "event");
}

export function eventLine(group: Pick<FeedEventGroup, "names" | "others" | "verb" | "challengeName" | "dayN" | "dayOf" | "secured">): string {
  const who = whoLine(group.names, group.others);
  if (group.verb === "started") return `${startedWho(group.names, group.others)} started ${group.challengeName}`;
  if (!group.secured) return `${who} ended ${group.challengeName}`;
  return `${who} finished ${group.challengeName} · ${formatOfDays(group.secured, group.dayOf)}`;
}

/** Group started lines for one challenge inside one clock hour. Finished stays a post. */
export function groupFeedJoins(posts: readonly LiveFeedPost[]): FeedListItem[] {
  const out: FeedListItem[] = [];
  let open: {
    verb: FeedEventVerb;
    challengeId: string;
    hour: number;
    grouped: LiveFeedPost[];
  } | null = null;

  const flush = () => {
    if (!open || open.grouped.length === 0) {
      open = null;
      return;
    }
    const first = open.grouped[0]!;
    const names: string[] = [];
    const memberIds: string[] = [];
    const avatars: FeedEventAvatar[] = [];
    for (const other of open.grouped) {
      const label = (other.displayName || other.username || "").trim();
      if (label && !names.includes(label)) names.push(label);
      if (other.userId && !memberIds.includes(other.userId)) {
        memberIds.push(other.userId);
        avatars.push({
          userId: other.userId,
          username: other.username,
          displayName: other.displayName,
          avatarUrl: other.avatarUrl,
        });
      }
    }
    const shown = names.slice(0, 2);
    out.push({
      kind: open.verb === "started" ? "join" : "event",
      verb: open.verb,
      id: first.id,
      challengeId: first.challengeId,
      challengeName: first.challengeName,
      names: shown,
      others: Math.max(0, names.length - shown.length),
      createdAt: first.createdAt,
      memberIds,
      avatars,
      dayN: first.currentDay,
      dayOf: first.totalDays,
      secured: first.securedDays ?? first.currentDay,
    });
    open = null;
  };

  for (const post of posts) {
    const verb = feedEventVerb(post);
    if (verb !== "started" || !post.challengeId) {
      flush();
      out.push(post);
      continue;
    }
    const hour = Math.floor(Date.parse(post.createdAt) / HOUR_MS);
    if (open && open.verb === verb && open.challengeId === post.challengeId && open.hour === hour) {
      open.grouped.push(post);
      continue;
    }
    flush();
    open = { verb, challengeId: post.challengeId, hour, grouped: [post] };
  }
  flush();
  return out;
}

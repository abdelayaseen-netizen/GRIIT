import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { checkInHasCameraProof } from "@/backend/lib/proof-predicate";

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

export function joinLine(names: string[], others: number, challenge: string): string {
  const who =
    names.length === 1 && !others
      ? names[0]
      : others
        ? `${names.join(", ")} and ${others}${others === 1 ? " other" : " others"}`
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${who} started ${challenge}`;
}

export function systemLine(name: string, dayN: number, dayOf: number, challenge: string): string {
  return `${name} secured Day ${dayN} of ${dayOf} · ${challenge}`;
}

export type FeedJoinGroup = {
  kind: "join";
  id: string;
  challengeId: string | null;
  challengeName: string;
  names: string[];
  others: number;
  createdAt: string;
  memberIds: string[];
};

export type FeedListItem = LiveFeedPost | FeedJoinGroup;

export function isJoinEvent(post: LiveFeedPost): boolean {
  return post.eventType === "joined_challenge" || post.eventType === "challenge_created";
}

export function isJoinGroup(item: FeedListItem): item is FeedJoinGroup {
  return "kind" in item && item.kind === "join";
}

/** Group join events per challenge within one hour. Guests (is_anonymous) are dropped in feed.ts. */
export function groupFeedJoins(posts: readonly LiveFeedPost[]): FeedListItem[] {
  const out: FeedListItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i]!;
    if (used.has(post.id)) continue;
    if (!isJoinEvent(post) || !post.challengeId) {
      out.push(post);
      continue;
    }
    const t0 = Date.parse(post.createdAt);
    const names: string[] = [];
    const memberIds: string[] = [];
    const grouped: LiveFeedPost[] = [];
    for (let j = i; j < posts.length; j += 1) {
      const other = posts[j]!;
      if (used.has(other.id) || !isJoinEvent(other)) continue;
      if (other.challengeId !== post.challengeId) continue;
      if (Math.abs(Date.parse(other.createdAt) - t0) > HOUR_MS) continue;
      used.add(other.id);
      grouped.push(other);
      const label = (other.displayName || other.username || "").trim();
      if (label && !names.includes(label)) names.push(label);
      if (other.userId && !memberIds.includes(other.userId)) memberIds.push(other.userId);
    }
    if (grouped.length === 0) continue;
    const shown = names.slice(0, 2);
    const others = Math.max(0, names.length - shown.length);
    out.push({
      kind: "join",
      id: grouped[0]?.id ?? post.id,
      challengeId: post.challengeId,
      challengeName: post.challengeName,
      names: shown,
      others,
      createdAt: grouped[0]?.createdAt ?? post.createdAt,
      memberIds,
    });
  }
  return out;
}

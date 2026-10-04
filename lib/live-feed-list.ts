import { proofImageUrlForCheckIn } from "@/lib/profile-v2-proof-photo";

export type LiveFeedListPost = {
  id: string;
  userId: string;
  eventType: string;
  challengeId?: string | null;
  challengeName?: string | null;
  taskName?: string | null;
  currentDay?: number | null;
  photoUrl?: string | null;
  proofPhotoUrl?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
};

export function liveFeedProofUrl(post: Pick<LiveFeedListPost, "photoUrl" | "proofPhotoUrl">): string | null {
  return proofImageUrlForCheckIn({
    photo_url: post.photoUrl,
    proof_photo_url: post.proofPhotoUrl,
  });
}

/** Avatar slot: profile avatar only. Never the proof photo. */
export function feedAvatarUri(
  avatarUrl: string | null | undefined,
  proofUrl?: string | null,
): string | undefined {
  const a = avatarUrl?.trim();
  if (!a) return undefined;
  if (proofUrl && a === proofUrl) return undefined;
  return a;
}

export function liveFeedDedupeKey(post: LiveFeedListPost): string {
  const dayKey =
    post.currentDay != null && Number.isFinite(post.currentDay)
      ? `d${Math.floor(post.currentDay)}`
      : new Date(post.createdAt).toDateString();
  const task = (post.taskName ?? "").trim().toLowerCase();
  if (task) return `${post.userId}|${task}|${dayKey}`;
  const challengeKey = post.challengeId ?? post.challengeName ?? "unknown";
  return `${post.userId}|${challengeKey}|${post.eventType}|${dayKey}`;
}

/**
 * One row per user + task + day. Prefer the camera proof when duplicates exist.
 * Events without a task name still collapse only with the same event type.
 */
export function keepLiveFeedPosts<T extends LiveFeedListPost>(posts: readonly T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const key = liveFeedDedupeKey(post);
    const list = groups.get(key);
    if (list) list.push(post);
    else groups.set(key, [post]);
  }
  const seen = new Set<string>();
  const out: T[] = [];
  for (const post of posts) {
    const key = liveFeedDedupeKey(post);
    if (seen.has(key)) continue;
    seen.add(key);
    const group = groups.get(key) ?? [post];
    out.push(group.find((row) => liveFeedProofUrl(row)) ?? group[0]!);
  }
  return out;
}

/** Home Following is people you follow. Own posts stay in Activity. */
export function excludeOwnFollowingPosts<T extends { userId: string }>(
  posts: readonly T[],
  userId: string | null | undefined,
): T[] {
  if (!userId) return [...posts];
  return posts.filter((post) => post.userId !== userId);
}

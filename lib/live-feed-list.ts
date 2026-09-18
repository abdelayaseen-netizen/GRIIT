import { proofImageUrlForCheckIn } from "@/lib/profile-v2-proof-photo";

export type LiveFeedListPost = {
  id: string;
  userId: string;
  eventType: string;
  challengeId?: string | null;
  challengeName?: string | null;
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

/**
 * Keep every camera proof. Do not let secured_day (newest, no photo)
 * replace task_completed rows for the same user/challenge/day.
 */
export function keepLiveFeedPosts<T extends LiveFeedListPost>(posts: readonly T[]): T[] {
  const seenNoProof = new Set<string>();
  return posts.filter((post) => {
    if (liveFeedProofUrl(post)) return true;
    const dayKey = new Date(post.createdAt).toDateString();
    const challengeKey = post.challengeId ?? post.challengeName ?? "unknown";
    const key = `${post.userId}-${challengeKey}-${dayKey}-${post.eventType}`;
    if (seenNoProof.has(key)) return false;
    seenNoProof.add(key);
    return true;
  });
}

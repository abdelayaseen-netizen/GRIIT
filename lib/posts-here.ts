/**
 * Build 92 10.2 (P3-16): "Your posts here" — the default audience for new posts in one joined
 * challenge, per user, on this device. Each post can still change it.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PostAudience } from "@/lib/post-audience";

export function postsHereKey(userId: string, activeChallengeId: string): string {
  return `griit.postsHere.v1:${userId}:${activeChallengeId}`;
}

export function parsePostsHere(raw: string | null): PostAudience | null {
  return raw === "friends" || raw === "everyone" || raw === "only_me" ? raw : null;
}

export async function readPostsHere(userId: string, activeChallengeId: string): Promise<PostAudience | null> {
  if (!userId || !activeChallengeId) return null;
  try {
    return parsePostsHere(await AsyncStorage.getItem(postsHereKey(userId, activeChallengeId)));
  } catch {
    return null;
  }
}

export async function writePostsHere(userId: string, activeChallengeId: string, audience: PostAudience): Promise<void> {
  if (!userId || !activeChallengeId) return;
  await AsyncStorage.setItem(postsHereKey(userId, activeChallengeId), audience);
}

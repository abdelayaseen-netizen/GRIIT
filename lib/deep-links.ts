/**
 * Deep link URL builders for sharing and invite attribution.
 * Uses DEEP_LINK_BASE_URL from config (env EXPO_PUBLIC_DEEP_LINK_BASE_URL or default).
 */

import { DEEP_LINK_BASE_URL } from "@/lib/config";

export function challengeDeepLink(challengeId: string, refUserId?: string | null): string {
  const url = `${DEEP_LINK_BASE_URL}/challenge/${challengeId}`;
  if (refUserId) return `${url}?ref=${encodeURIComponent(refUserId)}`;
  return url;
}

export function inviteDeepLink(inviteCode: string, refUserId?: string | null): string {
  const url = `${DEEP_LINK_BASE_URL}/invite/${encodeURIComponent(inviteCode)}`;
  if (refUserId) return `${url}?ref=${encodeURIComponent(refUserId)}`;
  return url;
}

export function profileDeepLink(username: string): string {
  return `${DEEP_LINK_BASE_URL}/profile/${encodeURIComponent(username)}`;
}


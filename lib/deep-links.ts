/**
 * Deep link URL builders for sharing and invite attribution.
 * Uses https://griit.app for Universal/App Links (iOS/Android) and web fallback.
 */

const BASE_URL = "https://griit.app";

export function challengeDeepLink(challengeId: string, refUserId?: string | null): string {
  const url = `${BASE_URL}/challenge/${challengeId}`;
  if (refUserId) return `${url}?ref=${encodeURIComponent(refUserId)}`;
  return url;
}

export function inviteDeepLink(inviteCode: string, refUserId?: string | null): string {
  const url = `${BASE_URL}/invite/${encodeURIComponent(inviteCode)}`;
  if (refUserId) return `${url}?ref=${encodeURIComponent(refUserId)}`;
  return url;
}

export function profileDeepLink(username: string): string {
  return `${BASE_URL}/profile/${encodeURIComponent(username)}`;
}

/** Parse ref (referrer user id) from URL search params. */
export function getRefFromUrl(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://griit.app${url.startsWith("/") ? url : `/${url}`}`);
    const ref = u.searchParams.get("ref");
    return ref ? ref.trim() : null;
  } catch {
    return null;
  }
}

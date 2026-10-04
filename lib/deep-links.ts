/**
 * Deep links for sharing. Web URLs only when EXPO_PUBLIC_DEEP_LINK_BASE_URL is set.
 * Otherwise the app scheme. Never default to griit.app.
 */

import { APP_SCHEME, DEEP_LINK_BASE_URL } from "@/lib/config";

export function joinMeOnGriitCode(code: string): string {
  return `Join me on GRIIT · code ${code.trim()}`;
}

function withRef(url: string, refUserId?: string | null): string {
  if (!refUserId) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ref=${encodeURIComponent(refUserId)}`;
}

function appOrWebPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (DEEP_LINK_BASE_URL) return `${DEEP_LINK_BASE_URL}${clean}`;
  return `${APP_SCHEME}://${clean.slice(1)}`;
}

export function challengeDeepLink(challengeId: string, refUserId?: string | null): string {
  return withRef(appOrWebPath(`/challenge/${challengeId}`), refUserId);
}

export function inviteDeepLink(inviteCode: string, refUserId?: string | null): string {
  return withRef(appOrWebPath(`/invite/${encodeURIComponent(inviteCode)}`), refUserId);
}

export function profileDeepLink(username: string): string {
  return appOrWebPath(`/profile/${encodeURIComponent(username)}`);
}

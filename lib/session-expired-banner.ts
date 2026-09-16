/** Banner body is text + padding. The top inset is a margin, not extra pad. */
export const SESSION_EXPIRED_PAD = 12;
export const OFFLINE_BANNER_PAD = 8;

export function topBannerOffset(
  insetsTop: number,
  paddingVertical: number,
): {
  marginTop: number;
  paddingVertical: number;
} {
  return {
    marginTop: Math.max(0, insetsTop),
    paddingVertical,
  };
}

export function sessionExpiredBannerOffset(insetsTop: number): {
  marginTop: number;
  paddingVertical: number;
} {
  return topBannerOffset(insetsTop, SESSION_EXPIRED_PAD);
}

/** Leftover 401 copy must not sit on sign-in / reset. */
export function showSessionExpiredBanner(
  pathname: string,
  message: string | null,
): boolean {
  if (!message) return false;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return false;
  return true;
}

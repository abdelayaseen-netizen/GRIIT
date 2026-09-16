/** Banner body is text + 12pt padding. The top inset is a margin, not extra pad. */
export const SESSION_EXPIRED_PAD = 12;

export function sessionExpiredBannerOffset(insetsTop: number): {
  marginTop: number;
  paddingVertical: number;
} {
  return {
    marginTop: Math.max(0, insetsTop),
    paddingVertical: SESSION_EXPIRED_PAD,
  };
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

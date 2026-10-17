/**
 * Notify the app when the session has expired (e.g. 401 from API).
 * Used by tRPC to signal sign-out + redirect to auth without tight coupling to router.
 */

export type SessionExpiredListener = () => void;

const listeners: SessionExpiredListener[] = [];

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function notifySessionExpired(): void {
  listeners.forEach((l) => l());
}

/** Banner is a leftover 401. Any signed-in session (sign-in, sign-up, restore) clears it. */
export function sessionExpiredMessageForAuthState(
  hasSession: boolean,
  current: string | null,
): string | null {
  if (hasSession) return null;
  return current;
}

/** A 401 with no session is an unauthenticated call, not an expiry. */
export function shouldNotifySessionExpired(hasSession: boolean): boolean {
  return hasSession;
}

export type RefreshVerdict = "keep" | "sign_out";

/**
 * Build 90 06.9: a single 401 used to sign the person out on the spot. A stale access
 * token on a slow or flaky connection (the app reopened a day later, refresh not yet
 * through) produced exactly that, so the App Review account "forgot" its login.
 * After a 401 we refresh once. Only a refresh the auth server rejects (the refresh token
 * is gone or revoked) ends the session. A network failure keeps it; the next call retries.
 */
export function refreshVerdictAfter401(result: {
  session: unknown | null;
  error: { name?: string; status?: number } | null;
}): RefreshVerdict {
  if (result.session) return "keep";
  const error = result.error;
  if (!error) return "sign_out";
  if (error.name === "AuthRetryableFetchError") return "keep";
  if (error.name === "AuthSessionMissingError") return "sign_out";
  if (typeof error.status === "number" && error.status >= 400 && error.status < 500) return "sign_out";
  return "keep";
}

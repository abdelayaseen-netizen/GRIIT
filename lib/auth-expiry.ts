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

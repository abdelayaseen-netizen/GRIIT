/**
 * Chunk Q + U share visibility for activity_events.
 * R2: omit shareChoicePending → shared (old clients). true → unanswered until flip.
 * Flip is service-role after ownership check. No user UPDATE policy.
 * share_state is the source of truth; `shared` stays in sync for build-61.
 */

export type ShareState = "unanswered" | "shared" | "kept";

export function shareStateOnInsert(shareChoicePending?: boolean): ShareState {
  return shareChoicePending === true ? "unanswered" : "shared";
}

export function sharedFromShareState(state: ShareState): boolean {
  return state === "shared";
}

export function shareColumns(state: ShareState, nowIso?: string): {
  share_state: ShareState;
  shared: boolean;
  shared_at: string | null;
} {
  const shared = state === "shared";
  return {
    share_state: state,
    shared,
    shared_at: shared ? (nowIso ?? new Date().toISOString()) : null,
  };
}

export function sharedOnInsert(shareChoicePending?: boolean): boolean {
  return sharedFromShareState(shareStateOnInsert(shareChoicePending));
}

export function canFlipShare(ownerId: string, actorId: string): boolean {
  return ownerId === actorId && ownerId.length > 0;
}

export function flipSharePatch(
  alreadyShared: boolean,
  nowIso: string,
  existingSharedAt: string | null,
): { shared: true; shared_at: string; share_state: "shared" } {
  return {
    shared: true,
    share_state: "shared",
    shared_at: alreadyShared && existingSharedAt ? existingSharedAt : nowIso,
  };
}

export function keepSharePatch(): { shared: false; share_state: "kept"; shared_at: null } {
  return { shared: false, share_state: "kept", shared_at: null };
}

export function feedShowsEvent(shared: boolean | ShareState): boolean {
  if (shared === "shared" || shared === true) return true;
  return false;
}

/** R4 — secured_day is public only when at least one proof that day is shared. */
export function securedDaySharedOnInsert(sharedProofCount: number): boolean {
  return sharedProofCount > 0;
}

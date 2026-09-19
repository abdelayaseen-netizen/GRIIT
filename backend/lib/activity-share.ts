/**
 * Chunk Q share visibility for activity_events.
 * R2: omit shareChoicePending → shared (old clients). true → unshared until flip.
 * Flip is service-role after ownership check. No user UPDATE policy.
 */

export function sharedOnInsert(shareChoicePending?: boolean): boolean {
  return shareChoicePending !== true;
}

export function canFlipShare(ownerId: string, actorId: string): boolean {
  return ownerId === actorId && ownerId.length > 0;
}

export function flipSharePatch(
  alreadyShared: boolean,
  nowIso: string,
  existingSharedAt: string | null,
): { shared: true; shared_at: string } {
  return {
    shared: true,
    shared_at: alreadyShared && existingSharedAt ? existingSharedAt : nowIso,
  };
}

export function feedShowsEvent(shared: boolean): boolean {
  return shared === true;
}

/** R4 — secured_day is public only when at least one proof that day is shared. */
export function securedDaySharedOnInsert(sharedProofCount: number): boolean {
  return sharedProofCount > 0;
}

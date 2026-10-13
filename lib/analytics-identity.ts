/**
 * A guest who saves an account keeps the distinct id they already had,
 * so the funnel stays one person. The new auth id is only an alias.
 */
export function accountSaveDistinctId(input: {
  guestDistinctId: string | null;
  nextUserId: string;
}): { distinctId: string; aliasUserId: string | null } {
  const guest = input.guestDistinctId?.trim() || null;
  if (guest && guest !== input.nextUserId) {
    return { distinctId: guest, aliasUserId: input.nextUserId };
  }
  return { distinctId: input.nextUserId, aliasUserId: null };
}

let guestDistinctId: string | null = null;

export function noteGuestDistinctId(userId: string): void {
  if (userId) guestDistinctId = userId;
}

export function peekGuestDistinctId(): string | null {
  return guestDistinctId;
}

export function clearGuestDistinctId(): void {
  guestDistinctId = null;
}

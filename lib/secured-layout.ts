/**
 * Secured layout variant. Camera proof is read off the completion, never require_photo.
 */

export function securedHasCameraProof(completion: {
  verified?: boolean | null;
  proof_photo_url?: string | null;
  proofUri?: string | null;
}): boolean {
  return (
    completion.verified === true ||
    Boolean(completion.proof_photo_url) ||
    Boolean(completion.proofUri)
  );
}

/** Remaining Mon–Sun days after today. Monday = 0. */
export function moreDaysThisWeek(todayIndex: number): number {
  return Math.max(0, 6 - todayIndex);
}

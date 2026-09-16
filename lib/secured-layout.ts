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

/**
 * Frame 58 — proof moment copy. Photo stays private until Share or Keep.
 * Share to the feed is checkins.shareProof, not the OS sheet (contradiction 44).
 */
export const PROOF_SHARE = "Share to the feed";
export const PROOF_KEEP = "Keep it to the record";
export const PROOF_SHARE_FAILED = "Not shared. It is in your record.";

export function proofMomentStatus(args: {
  hasPhoto: boolean;
  remainingToday: number;
  challengeDoneToday: boolean;
  challengeName: string;
}): string {
  const n = Math.max(0, Math.floor(args.remainingToday));
  return [
    args.hasPhoto ? "Camera proof, recorded." : "Self-reported, recorded.",
    args.challengeDoneToday ? `${args.challengeName} is done for today.` : null,
    `${n} left to secure today.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function closingProofEventId(
  dayProofs: { eventId?: string | null; imageUrl?: string | null }[] | undefined,
  proofUrl?: string | null,
): string | null {
  if (!dayProofs?.length) return null;
  const url = proofUrl?.trim() || "";
  const match = url
    ? dayProofs.find((t) => t.imageUrl === url && t.eventId)
    : undefined;
  return match?.eventId ?? dayProofs.find((t) => t.eventId)?.eventId ?? null;
}

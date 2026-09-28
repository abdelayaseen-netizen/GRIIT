/**
 * Discover / catalog covers come only from the challenge's own cover field
 * or generated fallback art. Never from check-ins, activity_events, or proofs.
 */

const CHALLENGE_COVER_KEYS = ["cover_url", "cover_image_url", "cover"] as const;

export type ChallengeCoverRow = {
  cover_url?: string | null;
  cover_image_url?: string | null;
  cover?: string | null;
  featuredProof?: { photo_url?: string | null } | null;
  photo_url?: string | null;
  proof_photo_url?: string | null;
};

export function catalogCoverUri(row: ChallengeCoverRow | null | undefined): string | null {
  if (!row) return null;
  for (const key of CHALLENGE_COVER_KEYS) {
    const raw = row[key];
    if (typeof raw === "string") {
      const t = raw.trim();
      if (/^https:\/\//i.test(t)) return t;
    }
  }
  return null;
}

/** Shared feed / owner-only. Catalog covers never call this. */
export function canShowParticipantProof(args: {
  shared: boolean;
  ownerId: string;
  viewerId: string | null | undefined;
}): boolean {
  if (args.viewerId && args.ownerId === args.viewerId) return true;
  return args.shared === true;
}

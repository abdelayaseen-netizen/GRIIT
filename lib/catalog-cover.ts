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

/** Surface label when there is no https cover. Always the challenge title. */
export function catalogCoverLabel(row: {
  category?: string | null;
  title?: string | null;
  name?: string | null;
} | null | undefined): string {
  const title = (row?.title ?? row?.name ?? "").trim();
  if (title) return title;
  const cat = (row?.category ?? "").trim();
  if (cat) return cat.charAt(0).toUpperCase() + cat.slice(1);
  return "Challenge";
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

/**
 * Proof capture for a secured day lives on `check_ins`.
 * Join `day_secures` → `check_ins` on (user_id, date_key).
 * Prefer photo_url, then proof_url, then completion_image_url.
 * Production check_ins has no proof_photo_url.
 * Accepts https, http, and file (local camera on Secured).
 * Storage paths are not rewritten to public URLs — use a signed API URL.
 */

export type CheckInProofRow = {
  date_key: string;
  task_id?: string | null;
  active_challenge_id?: string | null;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  proof_photo_url?: string | null;
};

/** Keep the URL the API gave us. Do not rewrite signed → public. */
export function publicUrlForProofHttp(raw: string): string | null {
  const s = raw.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    new URL(s);
    return s;
  } catch {
    return null;
  }
}

export function resolveProofImageUrl(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  if (/^file:\/\//i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return publicUrlForProofHttp(s);
  return null;
}

export function isProofImageUrl(raw: string | null | undefined): boolean {
  return resolveProofImageUrl(raw) != null;
}

/** One helper for feed, Secured, and Profile Proofs. */
export function proofImageUrlForCheckIn(row: {
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  proof_photo_url?: string | null;
}): string | null {
  for (const raw of [row.photo_url, row.proof_url, row.completion_image_url]) {
    const url = resolveProofImageUrl(raw);
    if (url) return url;
  }
  return null;
}

export function proofPhotoFromCheckIn(row: Omit<CheckInProofRow, "date_key">): string | null {
  return proofImageUrlForCheckIn(row);
}

export function proofTilePostId(
  posts: readonly {
    id: string;
    photoUrl?: string | null;
    proofPhotoUrl?: string | null;
    createdAt?: string;
  }[],
  proof: { imageUrl?: string | null; dateKey: string },
): string | null {
  if (proof.imageUrl) {
    const byUrl = posts.find(
      (p) => p.photoUrl === proof.imageUrl || p.proofPhotoUrl === proof.imageUrl,
    );
    if (byUrl) return byUrl.id;
  }
  const byDay = posts.find((p) => (p.createdAt ?? "").slice(0, 10) === proof.dateKey);
  return byDay?.id ?? null;
}

/** First photo per date_key wins. Rows without a photo are omitted from the map. */
export function proofPhotosByDateKey(rows: CheckInProofRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows) {
    if (map.has(row.date_key)) continue;
    const url = proofPhotoFromCheckIn(row);
    if (url) map.set(row.date_key, url);
  }
  return map;
}

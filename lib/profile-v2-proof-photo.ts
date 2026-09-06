/**
 * Proof capture for a secured day lives on `check_ins`.
 * Join `day_secures` → `check_ins` on (user_id, date_key).
 * Prefer photo_url, then proof_url, then completion_image_url.
 */

export type CheckInProofRow = {
  date_key: string;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
};

export function proofPhotoFromCheckIn(row: Omit<CheckInProofRow, "date_key">): string | null {
  for (const raw of [row.photo_url, row.proof_url, row.completion_image_url]) {
    const s = raw?.trim();
    if (s && /^https?:\/\//i.test(s)) return s;
  }
  return null;
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

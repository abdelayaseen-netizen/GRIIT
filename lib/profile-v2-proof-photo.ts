/**
 * Proof capture for a secured day lives on `check_ins`.
 * Join `day_secures` → `check_ins` on (user_id, date_key).
 * Prefer photo_url, then proof_url, then completion_image_url.
 * Production check_ins has no proof_photo_url.
 * Accepts https, http, file (local camera on Secured), and a
 * `task-proofs` storage path (`{userId}/{ts}-{rand}.jpg`) from older writes.
 */

export const PROOF_STORAGE_BUCKET = "task-proofs";

const STORAGE_OBJECT_PATH =
  /^(?:task-proofs\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/?#]+\.(?:jpe?g|png|webp))$/i;

export type CheckInProofRow = {
  date_key: string;
  active_challenge_id?: string | null;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  proof_photo_url?: string | null;
};

export function proofSupabaseOrigin(override?: string): string {
  return (override ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
}

/** `{userId}/{file}.jpg` or `task-proofs/{userId}/{file}.jpg` → public object URL. */
export function publicUrlForProofStoragePath(
  raw: string | null | undefined,
  supabaseUrl?: string,
): string | null {
  const s = raw?.trim();
  if (!s) return null;
  const match = STORAGE_OBJECT_PATH.exec(s.replace(/^\/+/, ""));
  if (!match) return null;
  const origin = proofSupabaseOrigin(supabaseUrl);
  if (!origin) return null;
  return `${origin}/storage/v1/object/public/${PROOF_STORAGE_BUCKET}/${match[1]}`;
}

/** Signed or object URL missing `/public/` → public object URL. */
export function publicUrlForProofHttp(raw: string, supabaseUrl?: string): string | null {
  const s = raw.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const url = new URL(s);
    const signed = url.pathname.match(/\/storage\/v1\/object\/sign\/task-proofs\/(.+)$/i);
    if (signed) {
      url.pathname = `/storage/v1/object/public/${PROOF_STORAGE_BUCKET}/${signed[1]}`;
      url.search = "";
      return url.toString();
    }
    const missingPublic = url.pathname.match(/\/storage\/v1\/object\/(?!public\/|sign\/)(?:task-proofs\/)?(.+)$/i);
    if (missingPublic && !url.pathname.includes("/object/public/")) {
      url.pathname = `/storage/v1/object/public/${PROOF_STORAGE_BUCKET}/${missingPublic[1]}`;
      return url.toString();
    }
    return s;
  } catch {
    return publicUrlForProofStoragePath(s, supabaseUrl);
  }
}

export function resolveProofImageUrl(
  raw: string | null | undefined,
  supabaseUrl?: string,
): string | null {
  const s = raw?.trim();
  if (!s) return null;
  if (/^file:\/\//i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return publicUrlForProofHttp(s, supabaseUrl);
  return publicUrlForProofStoragePath(s, supabaseUrl);
}

export function isProofImageUrl(raw: string | null | undefined): boolean {
  return resolveProofImageUrl(raw) != null;
}

/** One helper for feed, Secured, and Profile Proofs. */
export function proofImageUrlForCheckIn(
  row: {
    photo_url?: string | null;
    proof_url?: string | null;
    completion_image_url?: string | null;
    proof_photo_url?: string | null;
  },
  supabaseUrl?: string,
): string | null {
  for (const raw of [row.photo_url, row.proof_url, row.completion_image_url]) {
    const url = resolveProofImageUrl(raw, supabaseUrl);
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

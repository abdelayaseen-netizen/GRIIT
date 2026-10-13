/** Signed proof URLs last 3600s. Reuse one until shortly before it expires. */

const SIGN_TTL_MS = 3600 * 1000;
const RENEW_BEFORE_MS = 120 * 1000;
export const PROOF_PREFETCH_COUNT = 12;

type Entry = { url: string; expiresAt: number };

const cache = new Map<string, Entry>();

export function cachedProofUrl(
  id: string,
  signedUrl: string | null | undefined,
  now = Date.now(),
): string | null {
  const hit = cache.get(id);
  if (hit && hit.expiresAt - now > RENEW_BEFORE_MS) return hit.url;
  const next = signedUrl?.trim() || null;
  if (!next) return hit && hit.expiresAt > now ? hit.url : null;
  cache.set(id, { url: next, expiresAt: now + SIGN_TTL_MS - RENEW_BEFORE_MS });
  return next;
}

export function proofPrefetchUrls(
  urls: readonly (string | null | undefined)[],
  limit = PROOF_PREFETCH_COUNT,
): string[] {
  const out: string[] = [];
  for (const url of urls) {
    if (!url || !/^https?:\/\//i.test(url)) continue;
    out.push(url);
    if (out.length >= limit) break;
  }
  return out;
}

export function clearProofUrlCache(): void {
  cache.clear();
}

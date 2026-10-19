// Build 92 chunk 11.3 · proof photos are re-signed on every fetch (new token, same object), so
// keying the image cache on the URL downloaded the same photo again each time. Key on the object.
const STORAGE_MARKERS = [
  "/storage/v1/object/sign/",
  "/storage/v1/object/public/",
  "/storage/v1/render/image/sign/",
  "/storage/v1/render/image/public/",
];

export function proofCacheKey(uri: string | null | undefined): string | undefined {
  if (typeof uri !== "string" || !/^https?:\/\//i.test(uri)) return undefined;
  try {
    const url = new URL(uri);
    if (!STORAGE_MARKERS.some((m) => url.pathname.includes(m))) return undefined;
    return `${url.host}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function proofSource(uri: string): { uri: string; cacheKey?: string } {
  const cacheKey = proofCacheKey(uri);
  return cacheKey ? { uri, cacheKey } : { uri };
}

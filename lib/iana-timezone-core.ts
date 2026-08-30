/**
 * Pure IANA timezone validation (no Expo). Shared by client + tests.
 */

/** True when `tz` is accepted by Intl as a timeZone option. */
export function isValidIanaTimeZone(tz: string): boolean {
  const trimmed = tz.trim();
  if (!trimmed || trimmed.length > 64) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

/**
 * Return a safe IANA zone. Rejects garbage; falls back to `fallback` then UTC.
 */
export function resolveIanaTimeZone(
  raw: string | null | undefined,
  fallback = "UTC"
): string {
  const candidate = (raw ?? "").trim();
  if (candidate && isValidIanaTimeZone(candidate)) return candidate;
  const fb = fallback.trim();
  if (fb && isValidIanaTimeZone(fb)) return fb;
  return "UTC";
}

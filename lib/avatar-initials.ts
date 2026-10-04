import { DS_V3 } from "@/lib/design-system";

/** G2: letters from display_name (two words → two letters), else username. Never blank. */
export function initialsFrom(
  displayName?: string | null,
  username?: string | null,
): string {
  const src = (displayName || username || "").trim();
  if (!src || /^user_/i.test(src)) return "·";
  const parts = src.split(/\s+/).filter(Boolean);
  if (!parts.length) return "·";
  const letters =
    parts.length === 1
      ? parts[0]!.slice(0, 1)
      : `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`;
  const cleaned = letters.replace(/[^\p{L}]/gu, "");
  return cleaned ? cleaned.toUpperCase() : "·";
}

export function avatarTint(userId?: string | null): { bg: string; fg: string } {
  if (!userId) return { bg: DS_V3.color.border, fg: DS_V3.color.textPrimary };
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  const pair =
    Math.abs(h) % 2 === 0
      ? { bg: DS_V3.color.brandTint, fg: DS_V3.color.brandText }
      : { bg: DS_V3.color.border, fg: DS_V3.color.textPrimary };
  if ((pair.bg as string) === (DS_V3.color.canvas as string)) {
    return { bg: DS_V3.color.border, fg: DS_V3.color.textPrimary };
  }
  return pair;
}

/** Tiny / empty bitmaps load without error and paint a black circle. */
export function avatarPhotoLooksValid(width?: number | null, height?: number | null): boolean {
  return (width ?? 0) >= 8 && (height ?? 0) >= 8;
}

/** Photo only while this uri has not failed. A new uri retries. */
export function avatarShowsPhoto(
  uri: string | null | undefined,
  failedUri: string | null,
): boolean {
  const next = (uri ?? "").trim();
  if (!next) return false;
  return failedUri !== next;
}

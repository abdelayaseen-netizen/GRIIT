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
  return Math.abs(h) % 2 === 0
    ? { bg: DS_V3.color.brandTint, fg: DS_V3.color.brandText }
    : { bg: DS_V3.color.border, fg: DS_V3.color.textPrimary };
}

import { DS_COLORS } from "@/lib/design-system";

/** Warm, distinct backgrounds — all from DS_COLORS (accessible with white initials). */
const AVATAR_BG_BY_USERNAME = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.DISCOVER_BLUE,
  DS_COLORS.GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CATEGORY_MIND,
  DS_COLORS.danger,
] as const;

/** Deterministic avatar background from username (feed + profile placeholders). */
export function getAvatarColor(username: string): string {
  if (!username || username.length === 0) return AVATAR_BG_BY_USERNAME[0];
  const code = username.charCodeAt(0);
  return AVATAR_BG_BY_USERNAME[code % AVATAR_BG_BY_USERNAME.length] ?? AVATAR_BG_BY_USERNAME[0];
}

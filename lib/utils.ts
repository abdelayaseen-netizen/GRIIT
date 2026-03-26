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

/** Rotating avatar backgrounds by user id hash (feed spec). */
const FEED_AVATAR_BY_USER_ID = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.CATEGORY_MIND,
  DS_COLORS.GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CELEB_BONUS_PURPLE,
  DS_COLORS.DISCOVER_BLUE,
] as const;

export function getFeedAvatarBgFromUserId(userId: string): string {
  if (!userId?.length) return FEED_AVATAR_BY_USER_ID[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % FEED_AVATAR_BY_USER_ID.length;
  return FEED_AVATAR_BY_USER_ID[idx] ?? FEED_AVATAR_BY_USER_ID[0];
}

/** Initials: first letter of first + last name (or first two chars of single token). */
export function getDisplayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const a = parts[0] ?? "";
    return a.slice(0, 2).toUpperCase();
  }
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const a = first.charAt(0);
  const b = last.charAt(0);
  return `${a}${b}`.toUpperCase();
}

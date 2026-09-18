import { DS_COLORS } from "@/lib/design-system";
import { initialsFrom } from "@/lib/avatar-initials";

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

/** Same letters as `initialsFrom` — empty string when that helper returns null. */
export function getDisplayInitials(displayName: string): string {
  return initialsFrom(displayName) ?? "";
}

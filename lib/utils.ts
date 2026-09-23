import { DS_V3 } from "@/lib/design-system";
import { initialsFrom } from "@/lib/avatar-initials";

/** Rotating avatar backgrounds by user id hash (feed spec). */
const FEED_AVATAR_BY_USER_ID = [
  DS_V3.color.brand,
  DS_V3.color.brandText,
  DS_V3.color.brand,
  DS_V3.color.brand,
  DS_V3.color.brandTint,
  DS_V3.color.brandText,
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

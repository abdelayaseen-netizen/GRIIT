import { DS_COLORS } from "@/lib/design-system";

/** Deterministic avatar colors from user id (design tokens only). */
export const AVATAR_COLORS = [
  { bg: DS_COLORS.ACCENT_TINT, letter: DS_COLORS.DISCOVER_CORAL },
  { bg: DS_COLORS.GREEN_BG, letter: DS_COLORS.GREEN },
  { bg: DS_COLORS.purpleTintLight, letter: DS_COLORS.CATEGORY_MIND },
  { bg: DS_COLORS.DISCOVER_DIFF_TINT_MED, letter: DS_COLORS.DISCOVER_BLUE },
  { bg: DS_COLORS.difficultyMediumBg, letter: DS_COLORS.WARNING },
] as const;

export function getAvatarColor(userId: string): { bg: string; letter: string } {
  const idx = (userId.codePointAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] ?? AVATAR_COLORS[0];
}

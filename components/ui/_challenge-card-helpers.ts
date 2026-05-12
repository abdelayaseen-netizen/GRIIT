import { DS_COLORS } from "@/lib/design-system";

/** Maps a challenge category to its stripe accent color.
 *  Used by ChallengeCardFeatured / ChallengeRowCard / ChallengeCard24h. */
export function getStripeColorByCategory(category?: string): string {
  const cat = (category ?? "").toUpperCase();
  if (cat === "FITNESS") return DS_COLORS.ACCENT_PRIMARY;
  if (cat === "MIND") return DS_COLORS.CATEGORY_MIND_STRIPE;
  if (cat === "DISCIPLINE") return DS_COLORS.ACCENT_GREEN;
  if (cat === "FAITH") return DS_COLORS.CATEGORY_FAITH_STRIPE;
  return DS_COLORS.ACCENT_PRIMARY;
}

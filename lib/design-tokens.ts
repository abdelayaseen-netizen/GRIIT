/**
 * Global design system: colors, typography, card styling, spacing.
 * Use for pixel-accurate card radius, shadows, spacing across all screens.
 */
import { DS_COLORS } from "@/lib/design-system";

export const designTokens = {
  /** Card border radius on all cards */
  cardRadius: 16,
  /** Subtle card shadow — no heavy/bubbly look */
  cardShadow: {
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  /** Card border: 1px warm gray */
  cardBorderWidth: 1,
  cardBorderColor: DS_COLORS.border,
  /** Header pill badges (score, streak): height and radius */
  pillHeight: 36,
  pillBorderRadius: 20,
  pillBorderColor: DS_COLORS.chipStroke,
  /** Screen horizontal padding */
  screenPaddingH: 20,
  /** Between sections */
  sectionGap: 24,
  sectionGapLarge: 32,
  /** Between cards */
  cardGap: 12,
  cardGapLarge: 16,
  /** Typography */
  screenTitleSize: 28,
  screenTitleWeight: "800" as const,
  sectionHeaderSize: 20,
  sectionHeaderWeight: "700" as const,
  cardTitleSize: 20,
  bodySize: 15,
  bodyWeight: "400" as const,
  descriptionSize: 14,
  smallLabelSize: 12,
  smallLabelWeight: "500" as const,
  statNumberSize: 28,
  statLabelSize: 11,
  statLabelWeight: "600" as const,
  buttonTextSize: 16,
  buttonTextWeight: "600" as const,
  /** App title */
  logoLetterSpacing: 6,
  logoFontSize: 28,
  logoSubtitleFontSize: 13,
  /** CTA button height */
  ctaButtonHeight: 52,
  ctaBorderRadius: 16,
} as const;

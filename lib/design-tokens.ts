/**
 * Reference design tokens from cursor-prompt-complete-frontend-ui.md.
 * Use for pixel-accurate card radius, shadows, spacing.
 */

export const designTokens = {
  /** Card border radius on all cards */
  cardRadius: 16,
  /** Subtle card shadow per reference */
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  /** Header pill badges (score, streak): height and radius */
  pillHeight: 36,
  pillBorderRadius: 20,
  /** Border for pills/cards where reference uses #E0DDD8 */
  pillBorderColor: "#E0DDD8",
  /** Screen horizontal padding */
  screenPaddingH: 16,
  /** Between sections */
  sectionGap: 24,
  /** Between cards */
  cardGap: 12,
  /** App title letter-spacing */
  logoLetterSpacing: 6,
  /** App title font size */
  logoFontSize: 28,
  /** Subtitle under logo */
  logoSubtitleFontSize: 13,
} as const;

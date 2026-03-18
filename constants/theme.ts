/**
 * GRIIT Theme Constants — Aligned with Design System v2
 * Re-exports from design-system.ts for backwards compatibility
 */
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_RADIUS, DS_SHADOWS, DS_MEASURES } from '@/lib/design-system';

// Re-export everything from design system
export {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
  DS_MEASURES,
};

// Legacy compatibility exports (mapped to new tokens)
export const BASE_COLORS = {
  background: DS_COLORS.BG_PRIMARY,
  surface: DS_COLORS.BG_CARD,
  card: DS_COLORS.BG_CARD,
  textPrimary: DS_COLORS.TEXT_PRIMARY,
  textSecondary: DS_COLORS.TEXT_SECONDARY,
  textMuted: DS_COLORS.TEXT_TERTIARY,
  accent: DS_COLORS.ACCENT_PRIMARY,
  border: DS_COLORS.BORDER_DEFAULT,
  success: DS_COLORS.ACCENT_GREEN,
  tabInactive: DS_COLORS.TAB_INACTIVE,
  tabActive: DS_COLORS.TAB_ACTIVE,
} as const;

export const SURFACE_MUTED = DS_COLORS.BG_CARD_TINTED;
export const SURFACE_SUBTLE = DS_COLORS.STREAK_TINTED_BG;
export const ACCENT_LIGHT = DS_COLORS.STREAK_TINTED_BG;
export const ACCENT_SOFT = DS_COLORS.STREAK_TINTED_BG;
export const SUCCESS_LIGHT = DS_COLORS.SUCCESS_LIGHT;
export const WARNING_COLOR = DS_COLORS.WARNING;
export const WARNING_LIGHT = DS_COLORS.WARNING_LIGHT;
export const DANGER_COLOR = DS_COLORS.DANGER;
export const DANGER_LIGHT = DS_COLORS.DANGER_LIGHT;
export const NAVY_DARK = DS_COLORS.TEXT_PRIMARY;
export const GOLD = DS_COLORS.DIFFICULTY_MEDIUM_TEXT;

export const BORDER_STRONG = DS_COLORS.TEXT_PRIMARY;
export const CHIP_FILL = DS_COLORS.BG_CARD_TINTED;
export const PILL = DS_COLORS.BG_CARD_TINTED;
export const SHADOW = DS_COLORS.SHADOW;
export const SHADOW_MEDIUM = 'rgba(0,0,0,0.08)';
export const BLACK_BTN = DS_COLORS.BLACK;

export const COMMITMENT_BUTTON_BG = DS_COLORS.BLACK;
export const EXPLORE_BUTTON_BG = DS_COLORS.EXPLORE_BUTTON_BG;

export const BADGE_GREEN_BG = DS_COLORS.ACCENT_GREEN_BG;
export const BADGE_GREEN_TEXT = DS_COLORS.ACCENT_GREEN;
export const BADGE_YELLOW_BG = DS_COLORS.WARNING_LIGHT;
export const BADGE_YELLOW_TEXT = DS_COLORS.WARNING;
export const BADGE_ORANGE_BG = DS_COLORS.STREAK_TINTED_BG;
export const BADGE_ORANGE_TEXT = DS_COLORS.ACCENT_PRIMARY;
export const BADGE_RED_BG = DS_COLORS.DANGER_LIGHT;
export const BADGE_RED_TEXT = DS_COLORS.DANGER;

export const CATEGORY_FITNESS = DS_COLORS.CATEGORY_FITNESS;
export const CATEGORY_MIND = DS_COLORS.CATEGORY_MIND;
export const CATEGORY_DISCIPLINE = DS_COLORS.CATEGORY_DISCIPLINE;

/** @deprecated Use DS_COLORS directly */
export const COLORS = {
  background: DS_COLORS.BG_PRIMARY,
  cardBackground: DS_COLORS.BG_CARD,
  text: DS_COLORS.TEXT_PRIMARY,
  textSecondary: DS_COLORS.TEXT_SECONDARY,
  accent: DS_COLORS.ACCENT_PRIMARY,
  accentLight: DS_COLORS.STREAK_TINTED_BG,
  border: DS_COLORS.BORDER_DEFAULT,
  success: DS_COLORS.ACCENT_GREEN,
  warning: DS_COLORS.WARNING,
  tabInactive: DS_COLORS.TAB_INACTIVE,
  tabActive: DS_COLORS.TAB_ACTIVE,
} as const;

export const SPACING = {
  xs: DS_SPACING.XS,
  sm: DS_SPACING.SM,
  md: DS_SPACING.MD,
  lg: DS_SPACING.BASE,
  xl: DS_SPACING.XL,
} as const;

export const BORDER_RADIUS = {
  sm: DS_RADIUS.SM,
  md: DS_RADIUS.MD,
  lg: DS_RADIUS.LG,
  xl: DS_RADIUS.XL,
  full: 9999,
  card: DS_RADIUS.MD,
  pill: DS_RADIUS.PILL,
} as const;

export const SHADOWS = DS_SHADOWS;

export const TYPOGRAPHY = {
  pageTitle: { fontSize: DS_TYPOGRAPHY.SIZE_2XL, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.5 },
  sectionHeader: { fontSize: DS_TYPOGRAPHY.SIZE_LG, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, letterSpacing: -0.3 },
  cardTitle: { fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, letterSpacing: -0.2 },
  cardTitleLarge: { fontSize: DS_TYPOGRAPHY.SIZE_LG, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.4 },
  body: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR, lineHeight: 22 },
  secondary: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR },
  meta: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM, letterSpacing: -0.1 },
  metaSmall: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM },
  badgeLabel: { fontSize: 10, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD },
  caption: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
} as const;

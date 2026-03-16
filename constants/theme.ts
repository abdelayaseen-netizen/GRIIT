/**
 * GRIIT Design DNA — Rork spec. Single source of truth for colors and tokens.
 * Warm cream #F7F4EF, dark text #0B0B0F, accent #E8733A. No dark mode.
 */
export const BASE_COLORS = {
  background: "#F7F4EF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#0B0B0F",
  textSecondary: "#6B6B73",
  textMuted: "#9A9AA3",
  accent: "#E8733A",
  border: "#E7E3DC",
  success: "#2E7D32",
  tabInactive: "#9A9AA3",
  tabActive: "#E8733A",
} as const;

export const SURFACE_MUTED = "#F3F1EC";
export const SURFACE_SUBTLE = "#FFF5F0";
export const ACCENT_LIGHT = "#FFF0E8";
export const ACCENT_SOFT = "#F7D2C3";
export const SUCCESS_LIGHT = "#E8F5E9";
export const WARNING_COLOR = "#F5A623";
export const WARNING_LIGHT = "#FFFBEB";
export const DANGER_COLOR = "#D32F2F";
export const DANGER_LIGHT = "#FEF2F2";
export const NAVY_DARK = "#0B0B0F";
export const GOLD = "#C4960C";

export const BORDER_STRONG = "#0B0B0F";
export const CHIP_FILL = "#F3F4F6";
export const PILL = "#F3F4F6";
export const SHADOW = "rgba(0,0,0,0.04)";
export const SHADOW_MEDIUM = "rgba(0,0,0,0.08)";
export const BLACK_BTN = "#0B0B0F";

export const COMMITMENT_BUTTON_BG = "#0B0B0F";
export const EXPLORE_BUTTON_BG = "#E8733A";

export const BADGE_GREEN_BG = "#E8F5E9";
export const BADGE_GREEN_TEXT = "#2E7D32";
export const BADGE_YELLOW_BG = "#FFFBEB";
export const BADGE_YELLOW_TEXT = "#F5A623";
export const BADGE_ORANGE_BG = "#FFF0E8";
export const BADGE_ORANGE_TEXT = "#E8733A";
export const BADGE_RED_BG = "#FEF2F2";
export const BADGE_RED_TEXT = "#D32F2F";

export const CATEGORY_FITNESS = "#E8734A";
export const CATEGORY_MIND = "#7C6BC4";
export const CATEGORY_DISCIPLINE = "#1A1A1A";

/** @deprecated Use BASE_COLORS or DS_COLORS. */
export const COLORS = {
  background: BASE_COLORS.background,
  cardBackground: BASE_COLORS.surface,
  text: BASE_COLORS.textPrimary,
  textSecondary: BASE_COLORS.textSecondary,
  accent: BASE_COLORS.accent,
  accentLight: ACCENT_LIGHT,
  border: BASE_COLORS.border,
  success: BASE_COLORS.success,
  warning: WARNING_COLOR,
  tabInactive: BASE_COLORS.tabInactive,
  tabActive: BASE_COLORS.tabActive,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const DS_SPACING = {
  screenHorizontal: 20,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  cardPadding: 16,
  listItemGap: 12,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  card: 12,
  pill: 20,
} as const;

export const DS_RADIUS = {
  card: 14,
  cardAlt: 16,
  pill: 20,
  button: 14,
  iconButton: 14,
  badge: 8,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

export const DS_SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

export const TYPOGRAPHY = {
  pageTitle: { fontSize: 26, fontWeight: "700" as const, letterSpacing: -0.5 },
  sectionHeader: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  cardTitle: { fontSize: 17, fontWeight: "700" as const, letterSpacing: -0.2 },
  cardTitleLarge: { fontSize: 20, fontWeight: "800" as const, letterSpacing: -0.4 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  secondary: { fontSize: 14, fontWeight: "400" as const },
  meta: { fontSize: 13, fontWeight: "500" as const, letterSpacing: -0.1 },
  metaSmall: { fontSize: 12, fontWeight: "500" as const },
  badgeLabel: { fontSize: 10, fontWeight: "800" as const },
  caption: { fontSize: 11, fontWeight: "600" as const },
} as const;

export const DS_TYPOGRAPHY = TYPOGRAPHY;

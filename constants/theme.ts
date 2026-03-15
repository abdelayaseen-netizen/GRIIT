/**
 * GRIIT Design DNA — single source of truth for base palette.
 * Warm cream bg, charcoal text, burnt orange accent, dark commitment buttons.
 */
export const BASE_COLORS = {
  background: "#F5F1EB",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#2D3A2E",
  textSecondary: "#7A7A6D",
  accent: "#D2734A",
  border: "#E8E4DD",
  success: "#2D7A4F",
  tabInactive: "#7A7A6D",
  tabActive: "#D2734A",
} as const;

/** Dark commitment button (Continue, I Commit, Start Day 1) */
export const COMMITMENT_BUTTON_BG = "#2D2D2D";
/** Explore Challenges button (navy/charcoal) */
export const EXPLORE_BUTTON_BG = "#2D3A5F";

/** @deprecated Use BASE_COLORS or DS_COLORS. Kept for any direct theme.ts imports. */
export const COLORS = {
  background: BASE_COLORS.background,
  cardBackground: BASE_COLORS.surface,
  text: BASE_COLORS.textPrimary,
  textSecondary: BASE_COLORS.textSecondary,
  accent: BASE_COLORS.accent,
  accentLight: "#FFF7ED",
  border: BASE_COLORS.border,
  success: BASE_COLORS.success,
  warning: "#E8A230",
  tabInactive: BASE_COLORS.tabInactive,
  tabActive: BASE_COLORS.tabActive,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const TYPOGRAPHY = {
  heading: { fontSize: 20, fontWeight: "700" as const, color: "#2D3A2E" },
  subheading: { fontSize: 16, fontWeight: "600" as const, color: "#2D3A2E" },
  body: { fontSize: 14, fontWeight: "400" as const, color: "#2D3A2E" },
  caption: { fontSize: 12, fontWeight: "400" as const, color: "#7A7A6D" },
  stat: { fontSize: 28, fontWeight: "700" as const, color: "#2D3A2E" },
} as const;

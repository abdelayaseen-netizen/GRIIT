/**
 * Single source of truth for base palette. lib/design-system.ts imports these.
 * Cream/orange/green design system — matches Home and tab bar.
 */
export const BASE_COLORS = {
  background: "#F0EDE6",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#888884",
  accent: "#E07B4A",
  border: "#E8E5DE",
  success: "#2F7A52",
  tabInactive: "#888884",
  tabActive: "#E07B4A",
} as const;

/** @deprecated Use BASE_COLORS or DS_COLORS. Kept for any direct theme.ts imports. */
export const COLORS = {
  background: BASE_COLORS.background,
  cardBackground: BASE_COLORS.surface,
  text: BASE_COLORS.textPrimary,
  textSecondary: BASE_COLORS.textSecondary,
  accent: BASE_COLORS.accent,
  accentLight: "#FFF0E8",
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

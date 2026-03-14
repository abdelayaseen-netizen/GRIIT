/**
 * UI redesign theme — cream/orange/green design system.
 * Aligns with Home screen and tab bar. Use for consistent screens.
 * See also: lib/design-system.ts (DS_COLORS, DS_SPACING, etc.)
 */
export const COLORS = {
  background: "#F5F1EB",
  cardBackground: "#FFFFFF",
  text: "#2D3A2E",
  textSecondary: "#7A7A6D",
  accent: "#D2734A",
  accentLight: "#FFF0E8",
  border: "#E8E4DD",
  success: "#2D7A4F",
  warning: "#E8A230",
  tabInactive: "#9E9E91",
  tabActive: "#D2734A",
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

/**
 * GRIIT Design DNA — UI Overhaul spec.
 * Warm cream bg (#FAF8F5), charcoal text, orange accent (#E8845F).
 */
export const BASE_COLORS = {
  background: "#FAF8F5",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textMuted: "#9B9B9B",
  accent: "#E8845F",
  border: "#F0ECE6",
  success: "#2D8A4E",
  tabInactive: "#9B9B9B",
  tabActive: "#E8845F",
} as const;

/** Surface subtle (stats, Today's Reset) */
export const SURFACE_SUBTLE = "#FFF8F2";
/** Accent light (badges, alerts) */
export const ACCENT_LIGHT = "#FFF0EA";
/** Success light */
export const SUCCESS_LIGHT = "#E8F5E9";
/** Warning / amber */
export const WARNING_COLOR = "#E8A82E";
export const WARNING_LIGHT = "#FFF8E1";
/** Danger */
export const DANGER_COLOR = "#D94040";
export const DANGER_LIGHT = "#FFEBEE";
/** Navy dark (GRIT logo) */
export const NAVY_DARK = "#2C3539";
/** Gold (milestones, trophies) */
export const GOLD = "#C4960C";

/** Dark commitment button (Continue, I Commit, Start Day 1) */
export const COMMITMENT_BUTTON_BG = "#1A1A1A";
/** Explore Challenges button */
export const EXPLORE_BUTTON_BG = "#E8845F";

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
  card: 12,
  pill: 20,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;

export const TYPOGRAPHY = {
  pageTitle: { fontSize: 32, fontWeight: "800" as const, color: "#1A1A1A" },
  pageSubtitle: { fontSize: 15, fontWeight: "400" as const, color: "#6B6B6B" },
  sectionHeader: { fontSize: 20, fontWeight: "700" as const, color: "#1A1A1A" },
  cardTitle: { fontSize: 18, fontWeight: "700" as const, color: "#1A1A1A" },
  body: { fontSize: 14, fontWeight: "400" as const, color: "#6B6B6B" },
  badge: { fontSize: 12, fontWeight: "600" as const },
  meta: { fontSize: 13, fontWeight: "400" as const, color: "#9B9B9B" },
  stat: { fontSize: 28, fontWeight: "800" as const, color: "#1A1A1A" },
  statLabel: { fontSize: 12, fontWeight: "400" as const, color: "#9B9B9B" },
  heading: { fontSize: 20, fontWeight: "700" as const, color: "#1A1A1A" },
  subheading: { fontSize: 16, fontWeight: "600" as const, color: "#1A1A1A" },
  caption: { fontSize: 12, fontWeight: "400" as const, color: "#9B9B9B" },
} as const;

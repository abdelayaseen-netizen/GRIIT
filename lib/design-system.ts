/**
 * GRIIT Design System — 2026 premium mobile.
 * Single source of truth: colors, typography, spacing, radius, borders, shadows.
 * Use across onboarding, Home, Discover, Challenge Detail, Movement, Profile, Settings.
 */

// ─── COLORS ─────────────────────────────────────────────────────────────────
export const DS_COLORS = {
  // Base
  background: "#F6F5F2",
  backgroundAlt: "#F8F7F4",
  surface: "#FFFFFF",
  surfaceWarm: "#FCFCFA",
  surfaceMuted: "#F2F0EB",

  // Text
  textPrimary: "#111111",
  textPrimaryAlt: "#141414",
  textSecondary: "#6F6F6F",
  textSecondaryAlt: "#8A8A8A",
  textMuted: "#8A8A8A",

  // Borders
  border: "#E5E2DC",
  borderAlt: "#E8E6E1",

  // Accent
  accent: "#E97A45",
  accentDark: "#D96A3E",
  accentSoft: "#FFF5F0",

  // Semantic
  success: "#2D8B4E",
  successSoft: "#E8F5E9",
  warning: "#F5A623",
  warningSoft: "#FFFBEB",
  danger: "#E53E3E",
  dangerSoft: "#FEF2F2",

  // UI
  white: "#FFFFFF",
  black: "#111111",
  chipFill: "#F3F2EF",
  chipStroke: "#E5E2DC",
  inputPlaceholder: "#8A8A8A",
  tabInactive: "#8A8A8A",
  centerButtonBg: "#111111",
} as const;

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────
export const DS_TYPOGRAPHY = {
  // Wordmark / brand
  wordmark: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: 3,
    lineHeight: 34,
  },
  wordmarkSubtitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },

  // Headlines
  pageTitleLarge: { fontSize: 44, fontWeight: "800" as const, letterSpacing: -0.8, lineHeight: 50 },
  pageTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 34 },
  sectionTitle: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.2, lineHeight: 26 },
  cardTitle: { fontSize: 20, fontWeight: "700" as const, lineHeight: 26 },

  // Body
  body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  bodySmall: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  secondary: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  metadata: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },

  // UI
  eyebrow: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 1, lineHeight: 16 },
  button: { fontSize: 17, fontWeight: "700" as const, lineHeight: 22 },
  buttonSmall: { fontSize: 16, fontWeight: "600" as const },
  tabLabel: { fontSize: 11, fontWeight: "500" as const },
  chip: { fontSize: 15, fontWeight: "600" as const },
  statValue: { fontSize: 28, fontWeight: "700" as const },
  statLabel: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.5 },
} as const;

// ─── SPACING (4/8/12/16/20/24/32/40) ───────────────────────────────────────
export const DS_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  screenHorizontal: 24,
  screenHorizontalAlt: 20,
  sectionGap: 24,
  sectionGapLarge: 32,
  cardPadding: 20,
  cardGap: 16,
  inputLabelGap: 8,
  listItemGap: 12,
} as const;

// ─── RADIUS ─────────────────────────────────────────────────────────────────
export const DS_RADIUS = {
  input: 20,
  card: 26,
  cardAlt: 24,
  pill: 999,
  button: 22,
  buttonPill: 24,
  chip: 999,
  iconButton: 22,
  centerNavButton: 999,
} as const;

// ─── BORDERS ───────────────────────────────────────────────────────────────
export const DS_BORDERS = {
  width: 1,
  widthStrong: 2,
  color: DS_COLORS.border,
  colorStrong: DS_COLORS.textPrimary,
} as const;

// ─── SHADOWS (minimal, soft) ───────────────────────────────────────────────
export const DS_SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  centerButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

// ─── COMPONENT MEASURES ────────────────────────────────────────────────────
export const DS_MEASURES = {
  ctaHeight: 58,
  ctaHeightCompact: 52,
  inputHeight: 56,
  searchHeight: 52,
  tabBarHeight: 88,
  centerNavButtonSize: 58,
  headerHeight: 56,
  progressBarHeight: 6,
} as const;

export type DSColors = typeof DS_COLORS;
export type DSTypography = typeof DS_TYPOGRAPHY;
export type DSSpacing = typeof DS_SPACING;
export type DSRadius = typeof DS_RADIUS;

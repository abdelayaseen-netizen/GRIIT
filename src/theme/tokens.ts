/**
 * Design tokens: colors, typography, spacing. Matches lib/design-tokens + constants/colors.
 */

// ─── COLORS (prompt: #FAFAF8, #E8734A, #2D8B4E, #F0EDE8) ───────────────────
export const colors = {
  background: "#FAFAF8",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  borderSubtle: "#F0EDE8",
  shadowColor: "rgba(0,0,0,0.04)",
  accentOrange: "#E8734A",
  accentOrangeDark: "#D96A3E",
  chipFill: "#F3F4F6",
  chipStroke: "#E0DDD8",
  chipText: "#6B7280",
  successGreenText: "#2D8B4E",
  badgeRedText: "#E53E3E",
  badgeRedBg: "#FEE2E2",
  badgeOrangeText: "#C86A3A",
  badgeOrangeBg: "#FFF5F0",
  badgeGreenText: "#2D8B4E",
  badgeGreenBg: "#F0FFF4",
  badgeYellowGreenText: "#7C9B2E",
  badgeYellowGreenBg: "#ECFCCB",
  purpleStripe: "#7C6BC4",
  blueStripe: "#2563EB",
  greenStripe: "#2D8B4E",
  orangeStripe: "#E8734A",
  redStripe: "#E53E3E",
  searchIcon: "#9CA3AF",
  searchPlaceholder: "#9CA3AF",
  tabInactive: "#9CA3AF",
  centerButtonBg: "#1A1A1A",
  white: "#FFFFFF",
  black: "#1A1A1A",

  bgMain: "#FAFAF8",
  cardBg: "#FFFFFF",
  borderLight: "#F0EDE8",
  textSecondaryCreate: "#6B7280",
  accentOrangeCreate: "#E8734A",
  accentOrangeSoft: "#FFF5F0",
  accentGreen: "#2D8B4E",
  accentGreenSoft: "#F0FFF4",
  accentBlue: "#3B82F6",
  accentPurple: "#6366F1",
  accentYellow: "#D4A017",
  accentRed: "#E53E3E",
  accentRedSoft: "#FEF2F2",
  accentPink: "#EC4899",
  accentGray: "#6B7280",
} as const;

// ─── TYPOGRAPHY (Rork hierarchy) ───────────────────────────────────────────
export const typography = {
  discoverTitle: { fontSize: 40, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 44 },
  subtitle: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  sectionHeader: { fontSize: 22, fontWeight: "800" as const, lineHeight: 28 },
  cardTitle: { fontSize: 26, fontWeight: "800" as const, lineHeight: 30 },
  cardTitleLarge: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  cardDescription: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  metaRow: { fontSize: 12, fontWeight: "500" as const, lineHeight: 18 },
  chipLabel: { fontSize: 15, fontWeight: "700" as const },
  badgeLabel: { fontSize: 10, fontWeight: "800" as const },
  compactTitle: { fontSize: 16, fontWeight: "700" as const, lineHeight: 22 },
  compactDesc: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  emptySub: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  tabLabel: { fontSize: 11, fontWeight: "500" as const },

  // Create flow
  pageTitle: { fontSize: 32, fontWeight: "700" as const, lineHeight: 40 },
  sectionTitle: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  label: { fontSize: 12, fontWeight: "600" as const, lineHeight: 16 },
  primaryBody: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  secondaryText: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  smallHelper: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  challengeCardTitle: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  challengeCardDesc: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  previewCardTitle: { fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  previewCardSubtitle: { fontSize: 16, fontWeight: "400" as const, lineHeight: 22 },
  dailyTaskTitle: { fontSize: 16, fontWeight: "600" as const },
  dailyTaskMeta: { fontSize: 14, fontWeight: "400" as const },
} as const;

// ─── SPACING ───────────────────────────────────────────────────────────────
export const spacing = {
  screenHorizontal: 20,
  sectionVertical: 20,
  cardPadding: 18,
  chipGap: 10,
  listItemGap: 14,
  headerTop: 12,
  searchBottom: 12,
  categoryBottom: 12,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  // 8pt grid for Create flow
  gridXS: 8,
  gridS: 12,
  gridM: 16,
  gridL: 24,
  gridXL: 32,
} as const;

// ─── RADII ──────────────────────────────────────────────────────────────────
export const radius = {
  cardLarge: 16,
  card: 16,
  searchBar: 12,
  chip: 999,
  tag: 12,
  iconButton: 14,
  emptyIcon: 32,
  primaryButton: 16,
  cardCreate: 16,
  inputCreate: 12,
  pillCreate: 12,
  tagCreate: 8,
  taskTypeCard: 16,
  previewCard: 16,
} as const;

// ─── SHADOWS (soft, Rork) ──────────────────────────────────────────────────
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  centerButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// ─── BORDERS ───────────────────────────────────────────────────────────────
export const borders = {
  card: { borderWidth: 1, borderColor: colors.borderSubtle },
  chip: { borderWidth: 1, borderColor: colors.chipStroke },
  search: { borderWidth: 1, borderColor: colors.borderSubtle },
} as const;

// ─── ICON SIZES ────────────────────────────────────────────────────────────
export const iconSizes = {
  search: 20,
  chip: 16,
  section: 18,
  cardMeta: 13,
  arrowButton: 18,
  tabBar: 24,
  centerButtonPlus: 25,
  emptyIcon: 32,
} as const;

// ─── COMPONENT MEASURES ────────────────────────────────────────────────────
export const measures = {
  searchHeight: 54,
  chipPaddingH: 17,
  chipPaddingV: 11,
  stripeWidth: 3,
  dailyCardWidth: 280,
  dailyCardHeight: 200,
  headerHeight: 56,
  inputHeight: 52,
  primaryButtonHeight: 52,
  taskTypeCardHeight: 120,
  taskTypeIconCircle: 44,
  dailyTaskRowHeight: 72,
  previewIconSize: 48,
  stepperConnectorHeight: 4,
  stepperCircle: 36,
  centerButtonSize: 56,
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type IconSizes = typeof iconSizes;

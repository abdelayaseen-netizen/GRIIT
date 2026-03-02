/**
 * Single source of truth for Rork-style design tokens.
 * No screen or component should hardcode colors/sizes; use these tokens.
 */

// ─── COLORS (Rork exact) ───────────────────────────────────────────────────
export const colors = {
  background: "#F6F4EF",
  surface: "#FFFFFF",
  textPrimary: "#111111",
  textSecondary: "#8B8B8B",
  borderSubtle: "#E9E6DF",
  shadowColor: "rgba(0,0,0,0.08)",
  accentOrange: "#E9895B",
  accentOrangeDark: "#D9774E",
  chipFill: "#F2F1ED",
  chipStroke: "#E5E2DA",
  chipText: "#6F6F6F",
  successGreenText: "#1AAE61",
  badgeRedText: "#D34A42",
  badgeRedBg: "#F7E1DF",
  badgeOrangeText: "#C77719",
  badgeOrangeBg: "#F6E7D2",
  badgeGreenText: "#1C8A55",
  badgeGreenBg: "#DFF2E8",
  purpleStripe: "#7B61FF",
  blueStripe: "#2F80ED",
  greenStripe: "#27AE60",
  orangeStripe: "#F2994A",
  redStripe: "#D34A42",
  searchIcon: "#9A9A9A",
  searchPlaceholder: "#B0B0B0",
  tabInactive: "#8E8E8E",
  centerButtonBg: "#111111",
  white: "#FFFFFF",
  black: "#111111",

  // Create flow (Rork exact)
  bgMain: "#F7F7F6",
  cardBg: "#FFFFFF",
  borderLight: "#E7E7E5",
  textSecondaryCreate: "#6E6E6C",
  accentOrangeCreate: "#E17847",
  accentOrangeSoft: "#F3D2C1",
  accentGreen: "#2F7D45",
  accentGreenSoft: "#E6F4EA",
  accentBlue: "#3B82F6",
  accentPurple: "#6366F1",
  accentYellow: "#F59E0B",
  accentRed: "#DC2626",
  accentRedSoft: "#FEE2E2",
  accentPink: "#EC4899",
  accentGray: "#6B7280",
} as const;

// ─── TYPOGRAPHY (Rork hierarchy) ───────────────────────────────────────────
export const typography = {
  discoverTitle: { fontSize: 40, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 44 },
  subtitle: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  sectionHeader: { fontSize: 22, fontWeight: "800" as const, lineHeight: 28 },
  cardTitle: { fontSize: 26, fontWeight: "800" as const, lineHeight: 30 },
  cardTitleLarge: { fontSize: 28, fontWeight: "800" as const, lineHeight: 32 },
  cardDescription: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  metaRow: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  chipLabel: { fontSize: 15, fontWeight: "700" as const },
  badgeLabel: { fontSize: 13, fontWeight: "800" as const },
  compactTitle: { fontSize: 20, fontWeight: "800" as const, lineHeight: 24 },
  compactDesc: { fontSize: 15, fontWeight: "500" as const, lineHeight: 20 },
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

// ─── RADII (Rork) ──────────────────────────────────────────────────────────
export const radius = {
  cardLarge: 24,
  card: 22,
  searchBar: 19,
  chip: 999,
  tag: 14,
  iconButton: 18,
  emptyIcon: 32,
  primaryButton: 18,
  // Create flow
  cardCreate: 20,
  inputCreate: 18,
  pillCreate: 16,
  tagCreate: 16,
  taskTypeCard: 20,
  previewCard: 24,
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
  stripeWidth: 7,
  dailyCardWidth: 300,
  dailyCardHeight: 200,
  headerHeight: 56,
  inputHeight: 56,
  primaryButtonHeight: 60,
  taskTypeCardHeight: 120,
  taskTypeIconCircle: 44,
  dailyTaskRowHeight: 72,
  previewIconSize: 48,
  stepperConnectorHeight: 4,
  stepperCircle: 36,
  centerButtonSize: 64,
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type IconSizes = typeof iconSizes;

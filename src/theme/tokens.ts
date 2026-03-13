/**
 * Design tokens: colors, typography, spacing. Matches lib/design-tokens + constants/colors.
 */

// ─── COLORS (Rork) ──────────────────────────────────────────────────────────
export const colors = {
  background: "#F0EDE6",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#888884",
  borderSubtle: "#E8E5DE",
  shadowColor: "rgba(0,0,0,0.04)",
  accentOrange: "#E07B4A",
  accentOrangeDark: "#D96A3E",
  chipFill: "#F0EDE6",
  chipStroke: "#E0DDD6",
  chipText: "#444",
  successGreenText: "#2F7A52",
  badgeRedText: "#AA1111",
  badgeRedBg: "#FFE5E5",
  badgeOrangeText: "#C85A20",
  badgeOrangeBg: "#FFF0E8",
  badgeGreenText: "#2F7A52",
  badgeGreenBg: "#EAF5F0",
  badgeYellowGreenText: "#7C9B2E",
  badgeYellowGreenBg: "#ECFCCB",
  purpleStripe: "#7C6BC4",
  blueStripe: "#2563EB",
  greenStripe: "#2F7A52",
  orangeStripe: "#E07B4A",
  redStripe: "#E53E3E",
  searchIcon: "#888884",
  searchPlaceholder: "#888884",
  tabInactive: "#888884",
  centerButtonBg: "#1C1C1E",
  white: "#FFFFFF",
  black: "#1A1A1A",

  bgMain: "#F0EDE6",
  cardBg: "#FFFFFF",
  borderLight: "#E8E5DE",
  textSecondaryCreate: "#888884",
  accentOrangeCreate: "#E07B4A",
  accentOrangeSoft: "#FFF5F0",
  accentGreen: "#2F7A52",
  accentGreenSoft: "#EAF5F0",
  accentBlue: "#3B82F6",
  accentPurple: "#6366F1",
  accentYellow: "#D4A017",
  accentRed: "#E53E3E",
  accentRedSoft: "#FEF2F2",
  accentPink: "#EC4899",
  accentGray: "#888884",
} as const;

// ─── TYPOGRAPHY (Rork) ──────────────────────────────────────────────────────
export const typography = {
  discoverTitle: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 36 },
  subtitle: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  sectionHeader: { fontSize: 17, fontWeight: "700" as const, lineHeight: 22 },
  cardTitle: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  cardTitleLarge: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  cardDescription: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  metaRow: { fontSize: 12, fontWeight: "400" as const, lineHeight: 18 },
  chipLabel: { fontSize: 15, fontWeight: "400" as const },
  badgeLabel: { fontSize: 12, fontWeight: "600" as const },
  compactTitle: { fontSize: 16, fontWeight: "700" as const, lineHeight: 22 },
  compactDesc: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  emptyTitle: { fontSize: 17, fontWeight: "700" as const, lineHeight: 24 },
  emptySub: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  tabLabel: { fontSize: 10, fontWeight: "400" as const },

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

// ─── SHADOWS (Rork: opacity 0.04, radius 8, elevation 2) ────────────────────
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  centerButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

// ─── BORDERS (Rork: #E8E5DE) ───────────────────────────────────────────────
export const borders = {
  card: { borderWidth: 1, borderColor: "#E8E5DE" },
  chip: { borderWidth: 1, borderColor: "#E0DDD6" },
  search: { borderWidth: 1, borderColor: "#E8E5DE" },
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

// ─── COMPONENT MEASURES (Rork) ─────────────────────────────────────────────
export const measures = {
  searchHeight: 44,
  chipPaddingH: 16,
  chipPaddingV: 10,
  stripeWidth: 4,
  dailyCardWidth: 280,
  dailyCardHeight: 200,
  headerHeight: 56,
  inputHeight: 52,
  primaryButtonHeight: 56,
  taskTypeCardHeight: 120,
  taskTypeIconCircle: 44,
  dailyTaskRowHeight: 72,
  previewIconSize: 48,
  stepperConnectorHeight: 4,
  stepperCircle: 28,
  centerButtonSize: 56,
  filterPillHeight: 36,
  cardMeta: 13,
} as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type IconSizes = typeof iconSizes;

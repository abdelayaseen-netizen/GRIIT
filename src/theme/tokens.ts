/**
 * Design tokens: colors, typography, spacing. Matches lib/design-tokens + constants/colors.
 * Colors re-export from design-system for single source of truth.
 */

import { DS_COLORS } from "@/lib/design-system";

// ─── COLORS (Rork) ──────────────────────────────────────────────────────────
export const colors = {
  background: DS_COLORS.background,
  surface: DS_COLORS.surface,
  textPrimary: DS_COLORS.textPrimary,
  textSecondary: DS_COLORS.textSecondary,
  borderSubtle: DS_COLORS.border,
  shadowColor: "rgba(0,0,0,0.04)",
  accentOrange: DS_COLORS.accent,
  accentOrangeDark: DS_COLORS.accentDark,
  chipFill: DS_COLORS.chipFill,
  chipStroke: DS_COLORS.chipStroke,
  chipText: DS_COLORS.filterChipActiveBg,
  successGreenText: DS_COLORS.success,
  badgeRedText: DS_COLORS.difficultyExtremeText,
  badgeRedBg: DS_COLORS.difficultyExtremeBg,
  badgeOrangeText: DS_COLORS.difficultyMediumText,
  badgeOrangeBg: DS_COLORS.difficultyMediumBg,
  badgeGreenText: DS_COLORS.success,
  badgeGreenBg: DS_COLORS.featuredLabelBg,
  badgeYellowGreenText: DS_COLORS.badgeYellowGreenText,
  badgeYellowGreenBg: DS_COLORS.badgeYellowGreenBg,
  purpleStripe: DS_COLORS.purpleStripe,
  blueStripe: DS_COLORS.blueStripe,
  greenStripe: DS_COLORS.success,
  orangeStripe: DS_COLORS.accent,
  redStripe: DS_COLORS.danger,
  searchIcon: DS_COLORS.inputPlaceholder,
  searchPlaceholder: DS_COLORS.inputPlaceholder,
  tabInactive: DS_COLORS.tabInactive,
  centerButtonBg: DS_COLORS.centerButtonBg,
  white: DS_COLORS.white,
  black: DS_COLORS.black,

  bgMain: DS_COLORS.background,
  cardBg: DS_COLORS.surface,
  borderLight: DS_COLORS.border,
  textSecondaryCreate: DS_COLORS.textSecondary,
  accentOrangeCreate: DS_COLORS.accent,
  accentOrangeSoft: DS_COLORS.accentSoft,
  accentGreen: DS_COLORS.success,
  accentGreenSoft: DS_COLORS.successSoft,
  accentBlue: DS_COLORS.checkinBlue,
  accentPurple: DS_COLORS.taskIndigo,
  accentYellow: DS_COLORS.milestoneGold,
  accentRed: DS_COLORS.danger,
  accentRedSoft: DS_COLORS.dangerSoft,
  accentPink: DS_COLORS.taskPhotoPink,
  accentGray: DS_COLORS.textSecondary,
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
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  subtle: {
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  centerButton: {
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

// ─── BORDERS (Rork) ───────────────────────────────────────────────────────
export const borders = {
  card: { borderWidth: 1, borderColor: DS_COLORS.border },
  chip: { borderWidth: 1, borderColor: DS_COLORS.chipStroke },
  search: { borderWidth: 1, borderColor: DS_COLORS.border },
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

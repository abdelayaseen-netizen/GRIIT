/**
 * GRIIT Design System — Rork visual spec.
 * Single source of truth: colors, typography, spacing, radius, borders, shadows.
 */

// ─── COLORS (Rork exact) ───────────────────────────────────────────────────
export const DS_COLORS = {
  // Base
  background: "#F0EDE6",
  backgroundAlt: "#F8F6F2",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  surfaceWarm: "#FCFCFA",
  surfaceMuted: "#F2F0EB",

  // Text
  textPrimary: "#1A1A1A",
  textPrimaryAlt: "#141414",
  textSecondary: "#888884",
  textSecondaryAlt: "#888884",
  textMuted: "#AAAAAA",

  // Borders
  border: "#E8E5DE",
  borderAlt: "#E8E5DE",
  filterPillInactiveBorder: "#E0DDD6",

  // Accent
  accent: "#E07B4A",
  accentDark: "#D96A3E",
  accentSoft: "#FFF5F0",

  // Semantic
  success: "#2F7A52",
  successSoft: "#EAF5F0",
  warning: "#F5A623",
  warningSoft: "#FFFBEB",
  danger: "#E53E3E",
  dangerSoft: "#FEF2F2",
  dangerDark: "#B91C1C",
  dangerMid: "#DC2626",
  dangerDarkest: "#7F1D1D",
  materialRed: "#F44336",
  materialGreen: "#4CAF50",

  // Onboarding / dark surfaces
  onboardingBg: "#0A0A0A",
  borderDark: "#333333",
  darkCard: "#1A1A1A",
  darkTextSecondary: "#A0A0A0",
  darkTextTertiary: "#737373",
  darkTextMuted: "#525252",
  darkBorder: "#2A2A2A",
  darkPill: "#262626",
  darkCategoryMind: "#8B7CD4",
  darkStreakPlatinum: "#71717A",
  darkMilestoneSilver: "#A8A8A8",
  darkMilestoneGold: "#EAB308",
  darkMilestoneDiamond: "#67E8F1",

  // Task type / semantic accents
  milestoneGold: "#D4A017",
  milestoneBronze: "#CD7F32",
  milestoneSilver: "#C0C0C0",
  milestoneDiamond: "#B9F2FF",
  crownGold: "#B8860B",
  linkBlue: "#0EA5E9",
  journalPurple: "#8E44AD",
  runOrange: "#FF6B35",
  taskIndigo: "#6366F1",
  taskPhotoPink: "#EC4899",
  taskAmber: "#F59E0B",
  taskEmerald: "#10B981",
  silverRank: "#9CA3AF",

  // Controls
  switchThumbInactive: "#f4f3f4",
  toggleTrackOn: "#FDDCB5",
  skeletonBg: "#E8E6E1",
  overlayDark: "#111",
  overlayDarker: "#0f0f0f",
  modalBackdrop: "rgba(0,0,0,0.5)",
  grayMuted: "#999",
  grayMedium: "#6B7280",
  filterChipActiveBg: "#444",

  // UI
  white: "#FFFFFF",
  black: "#1A1A1A",
  chipFill: "#F0EDE6",
  chipStroke: "#E0DDD6",
  inputPlaceholder: "#888884",
  tabInactive: "#888884",
  centerButtonBg: "#1C1C1E",

  // Difficulty badges
  difficultyMediumBg: "#FFF0E8",
  difficultyMediumText: "#C85A20",
  difficultyHardBg: "#FFEAEA",
  difficultyHardText: "#C83030",
  difficultyExtremeBg: "#FFE5E5",
  difficultyExtremeText: "#AA1111",
  featuredLabelBg: "#EAF5F0",
  featuredLabelText: "#2F7A52",
  badgeYellowGreenText: "#7C9B2E",
  badgeYellowGreenBg: "#ECFCCB",
  purpleStripe: "#7C6BC4",
  blueStripe: "#2563EB",
  activeTodayText: "#2F7A52",
  challengePausedBg: "#FFF0EE",
  challengePausedTitle: "#C84030",
  rebuildModeText: "#E07B4A",

  // Settings
  settingsPageBg: "#EAF0F0",
  settingsBackCircle: "#EDF0F0",

  // Challenge detail 24h header
  challenge24hHeaderBg: "#3E7A55",
  difficultyEasyHeader: "#1B5E20",
  challengeHeaderDark: "#1A1A2E",
  alertRedBorder: "#F8D7DA",

  // Shadows
  shadowBlack: "#000",

  // Tints / one-off UI
  purpleTintLight: "#F5ECFF",
  purpleTintWarm: "#FFEFEB",
  journalStartBlue: "#6B8BFF",
  avatarPurple: "#D1C4E9",
  avatarPurpleText: "#7E57C2",
  emeraldDark: "#059669",
  activityOrange: "#FC4C02",
  rankGoldBg: "#D4A853",
  photoThumbBg: "#eeeeee",
  acceptGreen: "#22c55e",
  createErrorBg: "#FEF3EE",
  createErrorText: "#C86A3A",
  darkSurface: "#1F1F1F",
  amberDarkText: "#92400E",
  amberLightBg: "#FEF3C7",
  dangerLightBg: "#FEE2E2",
  grayLight: "#E5E5E5",
  stepperGray: "#D0CEC8",
  journalPurpleLight: "#F3E8FF",
  photoPinkBg: "#FFF0F5",
  runGreenBg: "#F0FFF4",
  checkinBlue: "#3B82F6",
  checkinBlueBg: "#EFF6FF",
  surfaceAlt: "#F2F2F1",
  syncingBannerBg: "#FFF8E1",
  packBorderFaith: "#93C5FD",
  packBorderOrange: "#FDBA74",
  taskIndigoBg: "#6366F115",
  grayDark: "#666666",
  grayDarker: "#555555",
  grayMid: "#CCCCCC",
  surfaceGray: "#EEEEEE",
  surfaceGrayDark: "#DDDDDD",
  moodYellow: "#EAB308",
  journalCardBg: "#FAF8F6",
  taskIndigoAlpha: "#6366F10D",
  taskAmberAlpha: "#F59E0B14",
  avatarColor1: "#E8733A",
  avatarColor2: "#2E7D32",
  avatarColor3: "#5C6BC0",
  avatarColor4: "#EF5350",
  avatarColor5: "#26A69A",
  avatarColor6: "#FFA726",
  avatarColor7: "#8D6E63",
  avatarColor8: "#66BB6A",
  confettiCyan: "#00CED1",
  confettiPurple: "#9B59B6",
  journalPurpleVivid: "#A855F7",
  chipGrayBg: "#F3F4F6",
} as const;

// ─── TYPOGRAPHY (Rork) ─────────────────────────────────────────────────────
export const DS_TYPOGRAPHY = {
  screenTitle: { fontSize: 30, fontWeight: "800" as const, color: "#1A1A1A", letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 15, fontWeight: "400" as const, color: "#888884" },
  sectionHeader: { fontSize: 17, fontWeight: "700" as const, color: "#1A1A1A" },
  cardTitle: { fontSize: 18, fontWeight: "700" as const, color: "#1A1A1A" },
  cardSubtitle: { fontSize: 14, fontWeight: "400" as const, color: "#888884" },
  metaRow: { fontSize: 12, fontWeight: "400" as const, color: "#AAAAAA" },
  featuredLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1, color: "#2F7A52" },
  difficultyBadge: { fontSize: 12, fontWeight: "600" as const },
  tabLabel: { fontSize: 10, fontWeight: "400" as const },
  ctaButton: { fontSize: 16, fontWeight: "600" as const, color: "#FFFFFF" },
  activeTodayCount: { fontSize: 13, fontWeight: "600" as const, color: "#2F7A52" },

  wordmark: { fontSize: 16, fontWeight: "800" as const, letterSpacing: 3, lineHeight: 20 },
  wordmarkSubtitle: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  pageTitleLarge: { fontSize: 44, fontWeight: "800" as const, letterSpacing: -0.8, lineHeight: 50 },
  pageTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 34 },
  sectionTitle: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.2, lineHeight: 26 },

  body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  bodySmall: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  secondary: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  metadata: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  eyebrow: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 1, lineHeight: 16 },
  button: { fontSize: 17, fontWeight: "700" as const, lineHeight: 22 },
  buttonSmall: { fontSize: 16, fontWeight: "600" as const },
  chip: { fontSize: 15, fontWeight: "600" as const },
  statValue: { fontSize: 28, fontWeight: "700" as const },
  statLabel: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.5 },
} as const;

// ─── SPACING (Rork) ────────────────────────────────────────────────────────
export const DS_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  screenHorizontal: 20,
  screenHorizontalAlt: 20,
  screenTopPadding: 16,
  sectionGap: 12,
  sectionGapLarge: 32,
  cardPadding: 16,
  cardGap: 12,
  inputLabelGap: 8,
  listItemGap: 12,
} as const;

// ─── RADIUS (Rork) ─────────────────────────────────────────────────────────
export const DS_RADIUS = {
  input: 12,
  card: 16,
  cardAlt: 16,
  pill: 999,
  button: 14,
  buttonPill: 14,
  chip: 999,
  iconButton: 22,
  centerNavButton: 999,
  searchBar: 12,
  filterPill: 999,
  ctaButton: 14,
  featuredBadge: 6,
  modal: 24,
} as const;

// ─── BORDERS ───────────────────────────────────────────────────────────────
export const DS_BORDERS = {
  width: 1,
  widthStrong: 2,
  color: DS_COLORS.border,
  colorStrong: DS_COLORS.textPrimary,
} as const;

// ─── SHADOWS (Rork: shadowColor #000, opacity 0.04, radius 8, elevation 2) ─
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

// ─── COMPONENT MEASURES (Rork) ─────────────────────────────────────────────
export const DS_MEASURES = {
  ctaHeight: 56,
  ctaHeightCompact: 52,
  inputHeight: 56,
  searchHeight: 44,
  searchBarRadius: 12,
  filterPillHeight: 36,
  tabBarHeight: 88,
  centerNavButtonSize: 56,
  headerHeight: 56,
  progressBarHeight: 6,
  featuredStripeWidth: 4,
  sectionHeaderIconSize: 18,
} as const;

export type DSColors = typeof DS_COLORS;
export type DSTypography = typeof DS_TYPOGRAPHY;
export type DSSpacing = typeof DS_SPACING;
export type DSRadius = typeof DS_RADIUS;

/**
 * GRIIT Design System v3 — Complete UI Redesign with Approved Reference Values
 * Source of truth for all colors, typography, spacing, and radius values.
 * NO raw hex values should exist outside this file.
 * ALL tokens are flat static exports — NO Object.assign, NO runtime merging.
 */

export const DS_COLORS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE BACKGROUNDS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  BG_PAGE: '#F5F5F5',           // Cool neutral grey — main screen background
  BG_CARD: '#FFFFFF',           // Pure white — all card surfaces
  BG_CARD_TINTED: '#F7F5F0',    // Warm card variant
  BG_DARK: '#111111',           // Near-black overlays / dark UI elements

  // Legacy uppercase aliases
  BG_PRIMARY: '#F5F5F5',
  BG_HEADER_DEFAULT: '#E8845F',

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCENT COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  ACCENT: '#E8845F',            // GRIIT orange — primary CTAs, active nav, icons
  ACCENT_DARK: '#D4724E',       // Pressed state for orange
  ACCENT_TINT: '#FFF0ED',       // Light orange bg for task icons, badges
  ACCENT_TINT_BORDER: '#F5C4B4', // Border for orange-tint containers

  // Legacy uppercase
  ACCENT_PRIMARY: '#E8845F',
  ACCENT_SECONDARY: '#D4724E',

  // ═══════════════════════════════════════════════════════════════════════════
  // GREEN / SUCCESS COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  GREEN: '#3D7A5A',             // Success / completion
  GREEN_BG: '#EBF5EE',          // Light green for completed cards
  GREEN_ICON: '#4A9068',        // Green icon tint

  // Legacy uppercase
  ACCENT_GREEN: '#3D7A5A',
  ACCENT_GREEN_BG: '#EBF5EE',
  ACCENT_GREEN_ICON: '#4A9068',
  SUCCESS_LIGHT: '#EBF5EE',

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  TEXT_PRIMARY: '#111111',      // Headings and body
  TEXT_SECONDARY: '#666666',    // Subtext, labels, metadata
  TEXT_MUTED: '#999999',        // Placeholders, disabled
  TEXT_ON_DARK: '#FFFFFF',      // Text on dark/colored backgrounds

  // Legacy
  TEXT_TERTIARY: '#999999',
  TEXT_ORANGE: '#E8845F',
  TEXT_ON_ACCENT: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // BORDER / DIVIDER COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  BORDER: '#E8E5DF',            // Default card border
  DIVIDER: '#EEEBE5',           // Section dividers
  SHADOW: 'rgba(0,0,0,0.06)',

  // Legacy
  BORDER_DEFAULT: '#E8E5DF',
  BORDER_CARD: '#EFEFEF',

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB BAR (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  TAB_ACTIVE: '#E8845F',
  TAB_INACTIVE: '#AAAAAA',
  TAB_BG: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVE / STREAK (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  LIVE_DOT: '#E8845F',
  STREAK_ICON: '#E8845F',

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  WHITE: '#FFFFFF',
  BLACK: '#111111',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNING / DANGER (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  WARNING: '#F5A623',
  WARNING_BG: '#FFFBEB',
  WARNING_LIGHT: '#FFFBEB',
  DANGER: '#DC2626',
  DANGER_BG: '#FEF2F2',
  DANGER_LIGHT: '#FEF2F2',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTED CHALLENGE CARDS (home — category dot accents)
  // ═══════════════════════════════════════════════════════════════════════════
  SUGGESTED_CARD_ACCENT_MIND: '#5B8DEF',
  SUGGESTED_CARD_ACCENT_LIFESTYLE: '#34C759',

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  CATEGORY_FITNESS: '#E8845F',
  CATEGORY_MIND: '#7C6BC4',
  CATEGORY_MIND_STRIPE: '#4A5568',
  CATEGORY_DISCIPLINE: '#111111',
  CATEGORY_FAITH_STRIPE: '#7C6BC4',
  CATEGORY_PEACH: '#F5D5C0',

  // ═══════════════════════════════════════════════════════════════════════════
  // DIFFICULTY BADGES (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  DIFFICULTY_EASY_BG: '#EBF5EE',
  DIFFICULTY_EASY_TEXT: '#3D7A5A',
  DIFFICULTY_MEDIUM_BG: '#FFF8E8',
  DIFFICULTY_MEDIUM_TEXT: '#C17D00',
  DIFFICULTY_HARD_BG: '#FFF0ED',
  DIFFICULTY_HARD_TEXT: '#E8845F',
  DIFFICULTY_EXTREME_BG: '#FFE5E5',
  DIFFICULTY_EXTREME_TEXT: '#DC2626',
  DIFFICULTY_MEDIUM: '#F5A623',

  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED / TIMER (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  FEATURED_BG: '#FFF0ED',
  FEATURED_TEXT: '#E8845F',
  TIMER_BG: '#FFF0ED',
  TIMER_TEXT: '#E8845F',

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK ICONS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  TASK_ICON_BG: '#FFF0ED',
  TASK_ICON_COLOR: '#E8845F',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPLORE BUTTON (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  EXPLORE_BTN_BG: '#2D5BE3',
  EXPLORE_BTN_TEXT: '#FFFFFF',
  EXPLORE_BUTTON_BG: '#2D5BE3',
  EXPLORE_BUTTON_TEXT: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  INPUT_BG: '#FFFFFF',
  INPUT_BORDER: '#E8E5DF',
  INPUT_BORDER_FOCUS: '#E8845F',
  INPUT_PLACEHOLDER: '#999999',

  // ═══════════════════════════════════════════════════════════════════════════
  // SKELETON / MODAL (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  SKELETON_BG: '#E8E5DF',
  MODAL_BACKDROP: 'rgba(0,0,0,0.5)',
  OVERLAY_DARK: 'rgba(0,0,0,0.7)',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETED STATES (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  COMPLETED_BORDER: '#C5DFD0',
  PROGRESS_BG: '#C5DFD0',
  COMPLETED_PROGRESS_BG: '#C5DFD0',

  // ═══════════════════════════════════════════════════════════════════════════
  // AVATAR (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  AVATAR_BORDER: '#FFFFFF',
  AVATAR_1: '#E8845F',
  AVATAR_2: '#2D8A4E',
  AVATAR_3: '#7B61FF',
  AVATAR_4: '#00897B',
  AVATAR_5: '#C4960C',
  AVATAR_6: '#D94040',
  AVATAR_COLOR_1: '#E8845F',
  AVATAR_COLOR_2: '#2D8A4E',
  AVATAR_COLOR_3: '#7B61FF',
  AVATAR_COLOR_4: '#00897B',
  AVATAR_COLOR_5: '#C4960C',
  AVATAR_COLOR_6: '#D94040',

  // ═══════════════════════════════════════════════════════════════════════════
  // STRIPES (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  PURPLE_STRIPE: '#7C6BC4',
  BLUE_STRIPE: '#2563EB',

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER COLORS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  HEADER_GREEN: '#2D6A4F',
  HEADER_ORANGE: '#C4784A',
  HEADER_MIND: '#3D6B8E',
  HEADER_FITNESS: '#C4784A',
  HEADER_DISCIPLINE: '#4A3728',
  CHALLENGE_HEADER_DARK: '#2D3A2E',
  DARK_GREEN_HEADER: '#2D3A2E',
  /** Deep saturated challenge header by category (cursorrules) */
  HEADER_FITNESS_DEEP: '#2D1810',
  HEADER_MIND_DEEP: '#1A1A2E',
  HEADER_DISCIPLINE_DEEP: '#1A3A2A',
  HEADER_FAITH_DEEP: '#1A1A2E',
  HEADER_DEFAULT: '#2D1810',

  // ═══════════════════════════════════════════════════════════════════════════
  // MISC / TRANSPARENT
  // ═══════════════════════════════════════════════════════════════════════════
  TRANSPARENT: 'transparent',

  // ═══════════════════════════════════════════════════════════════════════════
  // SWITCH/TOGGLE
  // ═══════════════════════════════════════════════════════════════════════════
  SWITCH_TRACK_ON: '#E8845F',
  SWITCH_TRACK_OFF: '#E8E5DF',
  SWITCH_THUMB: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK CONTEXT CARD ICONS
  // ═══════════════════════════════════════════════════════════════════════════
  ICON_BG_BLUE: '#EEF0F8',
  ICON_COLOR_BLUE: '#4A6FA5',

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAK TINTED BG
  // ═══════════════════════════════════════════════════════════════════════════
  STREAK_TINTED_BG: '#FFF0ED',

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 6 CLEANUP TOKENS
  // ═══════════════════════════════════════════════════════════════════════════
  ERROR_RED: '#DC2626',
  ERROR_BG: '#FEF2F2',
  DISABLED_BG: '#C4C0B8',
  HEADER_GRADIENT_DAILY_START: '#2D6A4F',
  HEADER_GRADIENT_DAILY_END: '#3D8B6A',
  HEADER_GRADIENT_DEFAULT_START: '#C4784A',
  HEADER_GRADIENT_DEFAULT_END: '#A65F3A',
  FALLBACK_BG: '#F7F4EF',
  CARD_ALT_BG: '#F5F3F0',
  TASK_PILL_BG: '#F5F3F0',
  SELECTED_BG: '#FFF0EA',
  PRESSED_ORANGE: '#D2734A',
  GRAY_CARD_BG: '#F3F4F6',
  SCORE_ARROW: '#666666',
  PAYWALL_BULLET: '#E8845F',
  SHARE_CARD_BG: '#000000',
  PROFILE_HEADER_BG: '#F5F3F0',
  SCORE_ICON: '#666666',
  RANK_DOT: '#AAAAAA',

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK TYPE COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  taskIndigo: '#6366F1',
  taskIndigoBg: '#EEF2FF',
  taskAmber: '#F59E0B',
  taskEmerald: '#10B981',
  taskPhotoPink: '#EC4899',
  grayMedium: '#6B7280',
  grayLight: '#F3F4F6',

  // ═══════════════════════════════════════════════════════════════════════════
  // LINK / BUTTON COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  linkBlue: '#2563EB',
  checkinBlue: '#2563EB',
  acceptGreen: '#10B981',
  centerButtonBg: '#E8845F',
  DISCOVER_CORAL: '#E8593C',
  DISCOVER_BLUE: '#5B7FD4',
  DISCOVER_GREEN: '#4CAF50',

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE FLOW COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  createErrorText: '#DC2626',
  createErrorBg: '#FEF2F2',
  createChallengeGreen: '#10B981',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHIP / FILTER
  // ═══════════════════════════════════════════════════════════════════════════
  chipFill: '#F7F5F0',
  chipStroke: '#E8E5DF',
  filterChipActiveBg: '#111111',
  featuredLabelBg: '#EBF5EE',

  // ═══════════════════════════════════════════════════════════════════════════
  // BADGES
  // ═══════════════════════════════════════════════════════════════════════════
  badgeYellowGreenText: '#65A30D',
  badgeYellowGreenBg: '#ECFCCB',

  // ═══════════════════════════════════════════════════════════════════════════
  // MILESTONES
  // ═══════════════════════════════════════════════════════════════════════════
  milestoneBronze: '#CD7F32',
  milestoneSilver: '#C0C0C0',
  milestoneGold: '#FFD700',
  milestoneDiamond: '#B9F2FF',
  silverRank: '#C0C0C0',

  // ═══════════════════════════════════════════════════════════════════════════
  // RUN / AMBER STATES
  // ═══════════════════════════════════════════════════════════════════════════
  amberLightBg: '#FFFBEB',
  amberDarkText: '#92400E',
  dangerMid: '#EF4444',
  dangerLightBg: '#FEF2F2',
  darkSurface: '#1F2937',

  // ═══════════════════════════════════════════════════════════════════════════
  // MISC TOKENS
  // ═══════════════════════════════════════════════════════════════════════════
  shadowBlack: '#000000',
  purpleStripe: '#7C6BC4',
  blueStripe: '#2563EB',
  buttonDisabledBg: '#C4C0B8',
  buttonDisabledText: '#888888',
  rankGoldBg: '#FEF3C7',
  activityOrange: '#E8845F',
  borderFocus: '#E8845F',

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKWARD COMPATIBILITY ALIASES (lowercase — for gradual migration)
  // These are DIRECT properties, NOT added via Object.assign
  // ═══════════════════════════════════════════════════════════════════════════
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#999999',
  accent: '#E8845F',
  accentDark: '#D4724E',
  border: '#E8E5DF',
  success: '#3D7A5A',
  tabInactive: '#AAAAAA',
  tabActive: '#E8845F',
  white: '#FFFFFF',
  black: '#111111',
  navyDark: '#111111',
  surfaceSubtle: '#FFF0ED',
  surfaceMuted: '#F7F5F0',
  accentLight: '#FFF0ED',
  accentSoft: '#FFF0ED',
  successLight: '#EBF5EE',
  successSoft: '#EBF5EE',
  dangerLight: '#FEF2F2',
  dangerSoft: '#FEF2F2',
  danger: '#DC2626',
  dangerDark: '#B91C1C',
  warning: '#F5A623',
  warningLight: '#FFFBEB',
  warningSoft: '#FFFBEB',
  pill: '#F7F5F0',
  blackBtn: '#111111',
  commitmentButtonBg: '#111111',
  exploreButtonBg: '#2D5BE3',
  modalBackdrop: 'rgba(0,0,0,0.5)',
  overlayDark: 'rgba(0,0,0,0.7)',
  surfaceWarm: '#F7F5F0',
  errorText: '#DC2626',
  difficultyEasyHeader: '#3D7A5A',
  purpleTintLight: '#F3F0FF',
  purpleTintWarm: '#EDE8FF',
  journalPurple: '#7C6BC4',
  journalStartBlue: '#2563EB',
  runOrange: '#E8845F',
  borderAlt: '#EFEFEF',
  challenge24hHeaderBg: '#2D6A4F',
  avatarPurple: '#7C6BC4',
  emeraldDark: '#065F46',
  challengeHeaderDark: '#2D3A2E',
  alertRedBorder: '#FECACA',
  inputPlaceholder: '#999999',

  // ═══════════════════════════════════════════════════════════════════════════
  // camelCase / legacy aliases (TypeScript cleanup — match references across app)
  // ═══════════════════════════════════════════════════════════════════════════
  crownGold: '#D4A017',
  moodYellow: '#FBBF24',
  journalCardBg: '#FFFFFF',
  taskIndigoAlpha: 'rgba(99,102,241,0.12)',
  taskAmberAlpha: 'rgba(245,158,11,0.12)',
  photoThumbBg: '#F3F4F6',
  confettiCyan: '#22D3EE',
  confettiPurple: '#A78BFA',
  borderDark: '#111111',
  grayDarker: '#374151',
  dangerDarkest: '#991B1B',
  overlayDarker: 'rgba(0,0,0,0.75)',
  grayMuted: '#9CA3AF',
  cardSelectedBg: '#FFF0EA',
  skeletonBg: '#E8E5DF',
  avatarPurpleText: '#5B21B6',
  journalPurpleVivid: '#6D28D9',
  journalPurpleLight: '#EDE9FE',
  photoPinkBg: '#FCE7F3',
  runGreenBg: '#EBF5EE',
  chipGrayBg: '#F3F4F6',
  checkinBlueBg: '#EEF0F8',
  surfaceAlt: '#F5F3F0',
  avatarColor1: '#E8845F',
  avatarColor2: '#2D8A4E',
  avatarColor3: '#7B61FF',
  avatarColor4: '#00897B',
  avatarColor5: '#C4960C',
  avatarColor6: '#D94040',
  avatarColor7: '#7C6BC4',
  avatarColor8: '#2563EB',
  settingsPageBg: '#F5F5F5',
  switchThumbInactive: '#E8E5DF',
  settingsBackCircle: '#F3F4F6',
  difficultyExtremeText: '#DC2626',
  difficultyExtremeBg: '#FFE5E5',
  difficultyMediumText: '#C17D00',
  difficultyMediumBg: '#FFF8E8',
} as const;

/** Brand primary for special moments (e.g. join celebration CTA). */
export const GRIIT_COLORS = {
  primary: "#E8593C",
} as const;

export const DS_TYPOGRAPHY = {
  // Font sizes
  SIZE_XS: 11,
  SIZE_SM: 13,
  SIZE_BASE: 15,
  SIZE_MD: 17,
  SIZE_LG: 20,
  SIZE_XL: 24,
  SIZE_2XL: 28,
  SIZE_3XL: 34,

  // Font weights (React Native string values)
  WEIGHT_REGULAR: '400' as const,
  WEIGHT_MEDIUM: '500' as const,
  WEIGHT_SEMIBOLD: '600' as const,
  WEIGHT_BOLD: '700' as const,
  WEIGHT_EXTRABOLD: '800' as const,
  WEIGHT_BLACK: '900' as const,

  // Line heights
  LINE_TIGHT: 1.15,
  LINE_NORMAL: 1.4,
  LINE_RELAXED: 1.6,

  // ═══════════════════════════════════════════════════════════════════════════
  // NAMED TEXT STYLES (from approved reference)
  // These are DIRECT properties, NOT added via Object.assign
  // ═══════════════════════════════════════════════════════════════════════════
  wordmark: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 3, lineHeight: 28 },
  wordmarkSubtitle: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  pageTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 34 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 26 },
  cardTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 24 },
  bodySmall: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  secondary: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  metadata: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  eyebrow: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1, lineHeight: 16 },
  button: { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 },
  buttonSmall: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  statValue: { fontSize: 28, fontWeight: '700' as const },
  statLabel: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
  tabLabel: { fontSize: 11, fontWeight: '600' as const },
  /** Section titles on secondary screens (e.g. pricing) */
  sectionHeader: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 26 },
  screenTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 34 },
  screenSubtitle: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  cardSubtitle: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  ctaButton: { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 },
} as const;

export const DS_SPACING = {
  // Primary uppercase tokens
  XS: 4,
  SM: 8,
  MD: 12,
  BASE: 16,
  LG: 20,
  XL: 24,
  XXL: 32,
  SCREEN_H: 20,   // Horizontal screen padding
  SCREEN_V: 16,   // Vertical screen padding

  // ═══════════════════════════════════════════════════════════════════════════
  // LOWERCASE ALIASES (for backward compatibility)
  // These are DIRECT properties, NOT added via Object.assign
  // ═══════════════════════════════════════════════════════════════════════════
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

export const DS_RADIUS = {
  // Primary uppercase tokens
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  PILL: 100,

  // ═══════════════════════════════════════════════════════════════════════════
  // LOWERCASE ALIASES (for backward compatibility)
  // These are DIRECT properties, NOT added via Object.assign
  // ═══════════════════════════════════════════════════════════════════════════
  input: 12,
  card: 16,
  cardAlt: 16,
  pill: 100,
  button: 14,
  buttonPill: 14,
  chip: 100,
  iconButton: 22,
  centerNavButton: 100,
  searchBar: 12,
  filterPill: 100,
  ctaButton: 14,
  /** Full-width primary CTA pill (join celebration, etc.) */
  joinCta: 28,
  featuredBadge: 6,
  modal: 20,
} as const;

export const DS_SHADOWS = {
  card: {
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSubtle: {
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerButton: {
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  // Uppercase alias
  CARD: {
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  SUBTLE: {
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  BUTTON: {
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  CENTER_BTN: {
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const DS_MEASURES = {
  TAB_BAR_HEIGHT: 80,
  CENTER_BUTTON_SIZE: 54,
  CENTER_BTN_SIZE: 54,
  CTA_HEIGHT: 56,
  CTA_HEIGHT_COMPACT: 52,
  INPUT_HEIGHT: 56,
  SEARCH_HEIGHT: 44,
  FILTER_PILL_HEIGHT: 36,
  HEADER_HEIGHT: 56,
  PROGRESS_BAR_HEIGHT: 3,
  PROGRESS_BAR_H: 3,
  AVATAR_SM: 28,
  AVATAR_MD: 44,
  AVATAR_LG: 72,
  ICON_SM: 16,
  ICON_MD: 20,
  ICON_LG: 24,
  ICON_XL: 36,
  TASK_ICON_CONTAINER: 36,
  STAT_ICON_SIZE: 20,
  /** camelCase alias */
  progressBarHeight: 3,
  ctaHeight: 56,
} as const;

export const DS_BORDERS = {
  width: 1,
  widthStrong: 2,
  color: '#E8E5DF',
  colorStrong: '#111111',
} as const;

// Type exports
export type DSColors = typeof DS_COLORS;
export type DSTypography = typeof DS_TYPOGRAPHY;
export type DSSpacing = typeof DS_SPACING;
export type DSRadius = typeof DS_RADIUS;
export type DSShadows = typeof DS_SHADOWS;
export type DSMeasures = typeof DS_MEASURES;

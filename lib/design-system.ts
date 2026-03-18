/**
 * GRIIT Design System v2 — Complete UI Redesign
 * Source of truth for all colors, typography, spacing, and radius values.
 * NO raw hex values should exist outside this file.
 */

export const DS_COLORS = {
  // Backgrounds
  BG_PRIMARY: '#F0EEE8',        // Warm off-white — main app background (matches target screenshots)
  BG_CARD: '#FFFFFF',           // Pure white card surfaces
  BG_CARD_TINTED: '#F7F5F0',   // Slightly warm card variant
  BG_HEADER_DEFAULT: '#E8593C', // GRIIT orange-red — hero headers for challenge detail
  BG_DARK: '#111111',           // Near-black for overlays / dark mode elements

  // Brand
  ACCENT_PRIMARY: '#E8593C',    // GRIIT orange-red — primary CTAs, active states, icons
  ACCENT_SECONDARY: '#D44E33',  // Darker orange for pressed states
  ACCENT_GREEN: '#3D7A5A',      // Success / completion states (keep muted, not neon)
  ACCENT_GREEN_BG: '#EBF5EE',   // Light green background for completed cards
  ACCENT_GREEN_ICON: '#4A9068', // Green icon tint

  // Text
  TEXT_PRIMARY: '#111111',      // Near-black — headings, body
  TEXT_SECONDARY: '#666666',    // Subtext, labels, metadata
  TEXT_TERTIARY: '#767676',     // Placeholder, disabled — WCAG AA contrast (4.5:1 on #F0EEE8)
  TEXT_ON_ACCENT: '#FFFFFF',    // White text on colored backgrounds
  TEXT_ORANGE: '#E8593C',       // Orange text for stats, highlights

  // UI Elements
  BORDER_DEFAULT: '#E8E5DF',    // Subtle card border
  BORDER_CARD: '#EFEFEF',       // Card inner border
  DIVIDER: '#EEEBE5',           // Section dividers
  SHADOW: 'rgba(0,0,0,0.06)',   // Card shadow color

  // Stats / Rank
  STREAK_ICON: '#E8593C',       // Flame icon
  SCORE_ICON: '#666666',        // Trending arrow
  RANK_DOT: '#AAAAAA',          // Neutral dot for rank

  // Tab bar
  TAB_ACTIVE: '#E8593C',
  TAB_INACTIVE: '#AAAAAA',
  TAB_BG: '#FFFFFF',

  // Live feed
  LIVE_DOT: '#E8593C',

  // Misc
  TRANSPARENT: 'transparent',

  // Additional UI colors for compatibility
  WHITE: '#FFFFFF',
  BLACK: '#111111',
  SUCCESS_LIGHT: '#E8F5E9',
  WARNING: '#F5A623',
  WARNING_LIGHT: '#FFFBEB',
  DANGER: '#DC2626',
  DANGER_LIGHT: '#FEF2F2',

  // Category colors
  CATEGORY_FITNESS: '#E8593C',
  CATEGORY_MIND: '#7C6BC4',
  CATEGORY_DISCIPLINE: '#111111',

  // Difficulty badges
  DIFFICULTY_EASY_BG: '#EBF5EE',
  DIFFICULTY_EASY_TEXT: '#3D7A5A',
  DIFFICULTY_MEDIUM_BG: '#FFF8E8',
  DIFFICULTY_MEDIUM_TEXT: '#C17D00',
  DIFFICULTY_HARD_BG: '#FFF0ED',
  DIFFICULTY_HARD_TEXT: '#E8593C',
  DIFFICULTY_EXTREME_BG: '#FFE5E5',
  DIFFICULTY_EXTREME_TEXT: '#DC2626',

  // Featured badge
  FEATURED_BG: '#FFF0ED',
  FEATURED_TEXT: '#E8593C',

  // Timer
  TIMER_BG: '#FFF0ED',
  TIMER_TEXT: '#E8593C',

  // Explore button
  EXPLORE_BUTTON_BG: '#2D5BE3',
  EXPLORE_BUTTON_TEXT: '#FFFFFF',

  // Task icons
  TASK_ICON_BG: '#FFF0ED',
  TASK_ICON_COLOR: '#E8593C',

  // Modal/overlay
  MODAL_BACKDROP: 'rgba(0,0,0,0.5)',
  OVERLAY_DARK: 'rgba(0,0,0,0.7)',

  // Input
  INPUT_PLACEHOLDER: '#999999',
  INPUT_BG: '#FFFFFF',
  INPUT_BORDER: '#E8E5DF',
  INPUT_BORDER_FOCUS: '#E8593C',

  // Switch/toggle
  SWITCH_TRACK_ON: '#E8593C',
  SWITCH_TRACK_OFF: '#E8E5DF',
  SWITCH_THUMB: '#FFFFFF',

  // Avatar
  AVATAR_BORDER: '#FFFFFF',

  // Skeleton loading
  SKELETON_BG: '#E8E5DF',

  // Green completed states
  COMPLETED_BORDER: '#C5DFD0',
  COMPLETED_PROGRESS_BG: '#C5DFD0',

  // Quick context card icons
  ICON_BG_BLUE: '#EEF0F8',
  ICON_COLOR_BLUE: '#4A6FA5',

  // Streak tinted bg
  STREAK_TINTED_BG: '#FFF0ED',

  // Purple stripe (for variety in cards)
  PURPLE_STRIPE: '#7C6BC4',
  BLUE_STRIPE: '#2563EB',

  // Phase 6 cleanup tokens
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
  DARK_GREEN_HEADER: '#2D3A2E',
  PRESSED_ORANGE: '#D2734A',
  GRAY_CARD_BG: '#F3F4F6',
  SCORE_ARROW: '#666666',
  CATEGORY_PEACH: '#F5D5C0',
  PAYWALL_BULLET: '#E8593C',
  SHARE_CARD_BG: '#000000',
  PROFILE_HEADER_BG: '#F5F3F0',
  DIFFICULTY_MEDIUM: '#F5A623',

  // Avatar colors for InitialCircle
  AVATAR_COLOR_1: '#E8845F',
  AVATAR_COLOR_2: '#2D8A4E',
  AVATAR_COLOR_3: '#7B61FF',
  AVATAR_COLOR_4: '#00897B',
  AVATAR_COLOR_5: '#C4960C',
  AVATAR_COLOR_6: '#D94040',
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
};

export const DS_SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  BASE: 16,
  LG: 20,
  XL: 24,
  XXL: 32,
  SCREEN_H: 20,   // Horizontal screen padding
  SCREEN_V: 16,   // Vertical screen padding
};

export const DS_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  PILL: 100,
};

export const DS_SHADOWS = {
  card: {
    shadowColor: DS_COLORS.SHADOW,
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
  centerButton: {
    shadowColor: DS_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const DS_MEASURES = {
  TAB_BAR_HEIGHT: 80,
  CENTER_BUTTON_SIZE: 54,
  CTA_HEIGHT: 56,
  CTA_HEIGHT_COMPACT: 52,
  INPUT_HEIGHT: 56,
  SEARCH_HEIGHT: 44,
  FILTER_PILL_HEIGHT: 36,
  HEADER_HEIGHT: 56,
  PROGRESS_BAR_HEIGHT: 3,
  AVATAR_SM: 28,
  AVATAR_MD: 44,
  AVATAR_LG: 72,
  ICON_SM: 16,
  ICON_MD: 20,
  ICON_LG: 24,
  ICON_XL: 36,
  TASK_ICON_CONTAINER: 36,
  STAT_ICON_SIZE: 20,
} as const;

// Backward compatibility aliases (mapped to new tokens)
// These allow gradual migration from old token names
export const DS_COLORS_COMPAT = {
  // Old names → new values
  background: DS_COLORS.BG_PRIMARY,
  surface: DS_COLORS.BG_CARD,
  card: DS_COLORS.BG_CARD,
  textPrimary: DS_COLORS.TEXT_PRIMARY,
  textSecondary: DS_COLORS.TEXT_SECONDARY,
  textMuted: DS_COLORS.TEXT_TERTIARY,
  accent: DS_COLORS.ACCENT_PRIMARY,
  border: DS_COLORS.BORDER_DEFAULT,
  success: DS_COLORS.ACCENT_GREEN,
  tabInactive: DS_COLORS.TAB_INACTIVE,
  tabActive: DS_COLORS.TAB_ACTIVE,
  white: DS_COLORS.WHITE,
  black: DS_COLORS.BLACK,
  navyDark: DS_COLORS.TEXT_PRIMARY,
  surfaceSubtle: DS_COLORS.STREAK_TINTED_BG,
  surfaceMuted: DS_COLORS.BG_CARD_TINTED,
  accentLight: DS_COLORS.STREAK_TINTED_BG,
  accentSoft: DS_COLORS.STREAK_TINTED_BG,
  successLight: DS_COLORS.SUCCESS_LIGHT,
  successSoft: DS_COLORS.SUCCESS_LIGHT,
  dangerLight: DS_COLORS.DANGER_LIGHT,
  dangerSoft: DS_COLORS.DANGER_LIGHT,
  danger: DS_COLORS.DANGER,
  dangerDark: '#B91C1C',
  warning: DS_COLORS.WARNING,
  warningLight: DS_COLORS.WARNING_LIGHT,
  warningSoft: DS_COLORS.WARNING_LIGHT,
  chipFill: DS_COLORS.BG_CARD_TINTED,
  pill: DS_COLORS.BG_CARD_TINTED,
  blackBtn: DS_COLORS.BLACK,
  commitmentButtonBg: DS_COLORS.BLACK,
  exploreButtonBg: DS_COLORS.EXPLORE_BUTTON_BG,
  modalBackdrop: DS_COLORS.MODAL_BACKDROP,
  overlayDark: DS_COLORS.OVERLAY_DARK,
  surfaceWarm: DS_COLORS.BG_CARD_TINTED,
  errorText: DS_COLORS.DANGER,
  milestoneGold: DS_COLORS.DIFFICULTY_MEDIUM_TEXT,
  // Challenge detail tokens
  difficultyEasyHeader: DS_COLORS.ACCENT_GREEN,
  purpleTintLight: '#F3F0FF',
  purpleTintWarm: '#EDE8FF',
  journalPurple: '#7C6BC4',
  journalStartBlue: '#2563EB',
  runOrange: DS_COLORS.ACCENT_PRIMARY,
  borderAlt: DS_COLORS.BORDER_CARD,
  challenge24hHeaderBg: DS_COLORS.HEADER_GRADIENT_DAILY_START,
  avatarPurple: '#7C6BC4',
  linkBlue: '#2563EB',
  emeraldDark: '#065F46',
  shadowBlack: '#000000',
} as const;

// Merge compatibility aliases into DS_COLORS for backward compatibility
Object.assign(DS_COLORS, DS_COLORS_COMPAT);

// Typography compatibility
export const DS_TYPOGRAPHY_COMPAT = {
  wordmark: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 3, lineHeight: 28 },
  wordmarkSubtitle: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  pageTitle: { fontSize: DS_TYPOGRAPHY.SIZE_2XL, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.5, lineHeight: 34 },
  sectionTitle: { fontSize: DS_TYPOGRAPHY.SIZE_LG, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, letterSpacing: -0.2, lineHeight: 26 },
  cardTitle: { fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, letterSpacing: -0.2 },
  body: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM, lineHeight: 24 },
  bodySmall: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR, lineHeight: 22 },
  secondary: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR, lineHeight: 20 },
  metadata: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM, lineHeight: 18 },
  eyebrow: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, letterSpacing: 1, lineHeight: 16 },
  button: { fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, lineHeight: 22 },
  buttonSmall: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, lineHeight: 18 },
  statValue: { fontSize: DS_TYPOGRAPHY.SIZE_2XL, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  statLabel: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, letterSpacing: 0.5 },
};

Object.assign(DS_TYPOGRAPHY, DS_TYPOGRAPHY_COMPAT);

// Spacing compatibility
export const DS_SPACING_COMPAT = {
  xs: DS_SPACING.XS,
  sm: DS_SPACING.SM,
  md: DS_SPACING.MD,
  lg: DS_SPACING.BASE,
  xl: DS_SPACING.LG,
  xxl: DS_SPACING.XL,
  xxxl: DS_SPACING.XXL,
  section: 40,
  screenHorizontal: DS_SPACING.SCREEN_H,
  screenHorizontalAlt: DS_SPACING.SCREEN_H,
  screenTopPadding: DS_SPACING.SCREEN_V,
  sectionGap: DS_SPACING.MD,
  sectionGapLarge: DS_SPACING.XXL,
  cardPadding: DS_SPACING.BASE,
  cardGap: DS_SPACING.MD,
  inputLabelGap: DS_SPACING.SM,
  listItemGap: DS_SPACING.MD,
};

Object.assign(DS_SPACING, DS_SPACING_COMPAT);

// Radius compatibility
export const DS_RADIUS_COMPAT = {
  input: DS_RADIUS.MD,
  card: DS_RADIUS.LG,
  cardAlt: DS_RADIUS.LG,
  pill: DS_RADIUS.PILL,
  button: 14,
  buttonPill: 14,
  chip: DS_RADIUS.PILL,
  iconButton: 22,
  centerNavButton: DS_RADIUS.PILL,
  searchBar: DS_RADIUS.MD,
  filterPill: DS_RADIUS.PILL,
  ctaButton: 14,
  featuredBadge: 6,
  modal: DS_RADIUS.XL,
};

Object.assign(DS_RADIUS, DS_RADIUS_COMPAT);

// Borders compatibility
export const DS_BORDERS = {
  width: 1,
  widthStrong: 2,
  color: DS_COLORS.BORDER_DEFAULT,
  colorStrong: DS_COLORS.TEXT_PRIMARY,
} as const;

// Type exports
export type DSColors = typeof DS_COLORS;
export type DSTypography = typeof DS_TYPOGRAPHY;
export type DSSpacing = typeof DS_SPACING;
export type DSRadius = typeof DS_RADIUS;
export type DSShadows = typeof DS_SHADOWS;
export type DSMeasures = typeof DS_MEASURES;

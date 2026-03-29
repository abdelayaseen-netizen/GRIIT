/**
 * GRIIT design tokens — aligned with lib/design-system.ts v3.
 * Use across Home, Discover, Challenge Detail, Profile, Settings, and bottom nav.
 * All imports use STATIC property names that exist at compile time.
 */

import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS, DS_MEASURES } from "@/lib/design-system";

export const GRIIT_COLORS = {
  // Core backgrounds (from approved reference)
  background: DS_COLORS.BG_PAGE,
  cardBackground: DS_COLORS.BG_CARD,
  cardBackgroundTinted: DS_COLORS.BG_CARD_TINTED,
  
  // Accent colors
  primaryAccent: DS_COLORS.ACCENT,
  primaryAccentDark: DS_COLORS.ACCENT_DARK,
  primaryAccentLight: DS_COLORS.ACCENT_TINT,
  primaryAccentBorder: DS_COLORS.ACCENT_TINT_BORDER,
  
  // Green / success
  secondaryGreen: DS_COLORS.GREEN,
  secondaryGreenLight: DS_COLORS.GREEN_BG,
  secondaryGreenIcon: DS_COLORS.GREEN_ICON,
  
  // Text colors
  textPrimary: DS_COLORS.TEXT_PRIMARY,
  textSecondary: DS_COLORS.TEXT_SECONDARY,
  textMuted: DS_COLORS.TEXT_MUTED,
  textOnDark: DS_COLORS.TEXT_ON_DARK,
  
  // UI elements
  warningAmber: DS_COLORS.WARNING,
  warningAmberBg: DS_COLORS.WARNING_BG,
  errorRed: DS_COLORS.DANGER,
  errorRedBg: DS_COLORS.DANGER_BG,
  borderLight: DS_COLORS.BORDER,
  divider: DS_COLORS.DIVIDER,
  
  // Basic
  white: DS_COLORS.WHITE,
  black: DS_COLORS.BLACK,
  
  // Task / component backgrounds
  peachBackground: DS_COLORS.ACCENT_TINT,
  peachBorder: DS_COLORS.ACCENT_TINT_BORDER,
  greenLightBg: DS_COLORS.GREEN_BG,
  chipSelectedBg: DS_COLORS.BLACK,
  chipOutlineBorder: DS_COLORS.BORDER,
  
  // Overlays
  overlayDark: DS_COLORS.OVERLAY_DARK,
  overlayModal: DS_COLORS.MODAL_BACKDROP,
  
  // Challenge headers
  challengeHeaderDark: DS_COLORS.CHALLENGE_HEADER_DARK,
  challengeHeaderGreen: DS_COLORS.HEADER_GREEN,
  challengeHeaderOrange: DS_COLORS.HEADER_ORANGE,
  
  // Alert states
  alertRedBg: DS_COLORS.DANGER_BG,
  alertRedBorder: DS_COLORS.alertRedBorder,
  
  // Tab bar
  tabActive: DS_COLORS.TAB_ACTIVE,
  tabInactive: DS_COLORS.TAB_INACTIVE,
  tabBg: DS_COLORS.TAB_BG,
  
  // Live feed
  liveDot: DS_COLORS.LIVE_DOT,
  streakIcon: DS_COLORS.STREAK_ICON,
  
  // Difficulty badges
  difficultyEasyBg: DS_COLORS.DIFFICULTY_EASY_BG,
  difficultyEasyText: DS_COLORS.DIFFICULTY_EASY_TEXT,
  difficultyMediumBg: DS_COLORS.DIFFICULTY_MEDIUM_BG,
  difficultyMediumText: DS_COLORS.DIFFICULTY_MEDIUM_TEXT,
  difficultyHardBg: DS_COLORS.DIFFICULTY_HARD_BG,
  difficultyHardText: DS_COLORS.DIFFICULTY_HARD_TEXT,
  difficultyExtremeBg: DS_COLORS.DIFFICULTY_EXTREME_BG,
  difficultyExtremeText: DS_COLORS.DIFFICULTY_EXTREME_TEXT,
  
  // Featured / timer
  featuredBg: DS_COLORS.FEATURED_BG,
  featuredText: DS_COLORS.FEATURED_TEXT,
  timerBg: DS_COLORS.TIMER_BG,
  timerText: DS_COLORS.TIMER_TEXT,
  
  // Explore button
  exploreBtnBg: DS_COLORS.EXPLORE_BTN_BG,
  exploreBtnText: DS_COLORS.EXPLORE_BTN_TEXT,
  
  // Input
  inputBg: DS_COLORS.INPUT_BG,
  inputBorder: DS_COLORS.INPUT_BORDER,
  inputBorderFocus: DS_COLORS.INPUT_BORDER_FOCUS,
  inputPlaceholder: DS_COLORS.INPUT_PLACEHOLDER,
  
  // Skeleton
  skeletonBg: DS_COLORS.SKELETON_BG,
  
  // Completed states
  completedBorder: DS_COLORS.COMPLETED_BORDER,
  progressBg: DS_COLORS.PROGRESS_BG,
  
  // Category colors
  categoryFitness: DS_COLORS.CATEGORY_FITNESS,
  categoryMind: DS_COLORS.CATEGORY_MIND,
  categoryDiscipline: DS_COLORS.CATEGORY_DISCIPLINE,
  
  // Avatar colors
  avatarBorder: DS_COLORS.AVATAR_BORDER,
  avatar1: DS_COLORS.AVATAR_1,
  avatar2: DS_COLORS.AVATAR_2,
  avatar3: DS_COLORS.AVATAR_3,
  avatar4: DS_COLORS.AVATAR_4,
  avatar5: DS_COLORS.AVATAR_5,
  avatar6: DS_COLORS.AVATAR_6,
  
  // Stripes
  purpleStripe: DS_COLORS.PURPLE_STRIPE,
  blueStripe: DS_COLORS.BLUE_STRIPE,
} as const;

export const GRIIT_SPACING = {
  screenPadding: DS_SPACING.SCREEN_H,
  cardPadding: DS_SPACING.cardPadding,
  sectionGap: DS_SPACING.sectionGap,
  cardGap: DS_SPACING.cardGap,
  xs: DS_SPACING.XS,
  sm: DS_SPACING.SM,
  md: DS_SPACING.MD,
  lg: DS_SPACING.BASE,
  xl: DS_SPACING.XXL,
  section: DS_SPACING.section,
} as const;

export const GRIIT_RADII = {
  card: DS_RADIUS.card,
  buttonPill: DS_RADIUS.buttonPill,
  chip: 20,
  input: DS_RADIUS.input,
  avatar: 999,
  modalCard: DS_RADIUS.cardAlt,
  contentOverlap: DS_RADIUS.card,
  sm: DS_RADIUS.SM,
  md: DS_RADIUS.MD,
  lg: DS_RADIUS.LG,
  xl: DS_RADIUS.XL,
  pill: DS_RADIUS.PILL,
} as const;

export const GRIIT_TYPOGRAPHY = {
  // From wordmark style
  logoSize: DS_TYPOGRAPHY.wordmark.fontSize,
  logoLetterSpacing: DS_TYPOGRAPHY.wordmark.letterSpacing,
  
  // From wordmarkSubtitle style
  subtitleSize: DS_TYPOGRAPHY.wordmarkSubtitle.fontSize,
  
  // From sectionTitle style
  sectionHeader: DS_TYPOGRAPHY.sectionTitle.fontSize,
  sectionHeaderSm: 12,
  sectionHeaderLetterSpacing: 1.5,
  
  // From cardTitle style
  cardTitle: DS_TYPOGRAPHY.cardTitle.fontSize,
  
  // From secondary style
  cardBody: DS_TYPOGRAPHY.secondary.fontSize,
  
  // From statValue style
  statNumber: DS_TYPOGRAPHY.statValue.fontSize,
  
  // From statLabel style
  statLabel: DS_TYPOGRAPHY.statLabel.fontSize,
  
  // From button style
  buttonText: DS_TYPOGRAPHY.button.fontSize,
  
  // From tabLabel style
  tabLabel: DS_TYPOGRAPHY.tabLabel.fontSize,
  
  // Font sizes
  xs: DS_TYPOGRAPHY.SIZE_XS,
  sm: DS_TYPOGRAPHY.SIZE_SM,
  base: DS_TYPOGRAPHY.SIZE_BASE,
  md: DS_TYPOGRAPHY.SIZE_MD,
  lg: DS_TYPOGRAPHY.SIZE_LG,
  xl: DS_TYPOGRAPHY.SIZE_XL,
  xxl: DS_TYPOGRAPHY.SIZE_2XL,
  xxxl: DS_TYPOGRAPHY.SIZE_3XL,
} as const;

export const GRIIT_FONTS = {
  logoAndChallenge: undefined as string | undefined,
  body: undefined as string | undefined,
} as const;

export const GRIIT_SHADOWS = {
  card: DS_SHADOWS.card,
  button: DS_SHADOWS.button,
  inputFocused: {
    shadowColor: DS_COLORS.ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  centerButton: DS_SHADOWS.centerButton,
} as const;

export const GRIIT_MEASURES = {
  tabBarHeight: DS_MEASURES.TAB_BAR_HEIGHT,
  centerButtonSize: DS_MEASURES.CENTER_BUTTON_SIZE,
  ctaHeight: DS_MEASURES.CTA_HEIGHT,
  ctaHeightCompact: DS_MEASURES.CTA_HEIGHT_COMPACT,
  inputHeight: DS_MEASURES.INPUT_HEIGHT,
  searchHeight: DS_MEASURES.SEARCH_HEIGHT,
  filterPillHeight: DS_MEASURES.FILTER_PILL_HEIGHT,
  headerHeight: DS_MEASURES.HEADER_HEIGHT,
  progressBarHeight: DS_MEASURES.PROGRESS_BAR_HEIGHT,
  avatarSm: DS_MEASURES.AVATAR_SM,
  avatarMd: DS_MEASURES.AVATAR_MD,
  avatarLg: DS_MEASURES.AVATAR_LG,
  iconSm: DS_MEASURES.ICON_SM,
  iconMd: DS_MEASURES.ICON_MD,
  iconLg: DS_MEASURES.ICON_LG,
  iconXl: DS_MEASURES.ICON_XL,
  taskIconContainer: DS_MEASURES.TASK_ICON_CONTAINER,
  statIconSize: DS_MEASURES.STAT_ICON_SIZE,
} as const;

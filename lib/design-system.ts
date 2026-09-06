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
  BG_HEADER_DEFAULT: '#BB471D',

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCENT COLORS — darkened from #E8845F to #BB471D so {WHITE on ACCENT}
  // measures 5.2:1, clearing WCAG AA 4.5:1. (Prior 2.66:1 fail.) Verified by
  // tests/design-system-contrast.test.ts. The earlier "v2 brand.primary
  // #D85A30" only hits 3.87:1 and was insufficient.
  // ═══════════════════════════════════════════════════════════════════════════
  ACCENT: '#BB471D',            // GRIIT orange — primary CTAs, active nav, icons
  ACCENT_DARK: '#9E3A14',       // Pressed state
  ACCENT_TINT: '#FAECE7',       // Light orange bg for task icons, badges
  ACCENT_TINT_BORDER: '#F5C4B4', // Border for orange-tint containers

  // Profile v2 — 30-day streak heatmap ramp (hue-locked to ACCENT)
  HEATMAP_L0: '#EEE9E0',
  HEATMAP_L1: '#F2D4C0',
  HEATMAP_L2: '#E0A282',
  HEATMAP_L3: '#BB471D',
  HEATMAP_L4: '#9E3A14',
  HEATMAP_TODAY_RING: '#1A1A1A',

  // Legacy uppercase
  ACCENT_PRIMARY: '#BB471D',
  ACCENT_SECONDARY: '#9E3A14',

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
  // TEXT COLORS — TERTIARY/MUTED darkened from #8A8A8A to #8A8A8A so the pair
  // {TEXT_TERTIARY, BG_PAGE} clears WCAG large-text minimum 3.0:1 (was 2.61).
  // ═══════════════════════════════════════════════════════════════════════════
  TEXT_PRIMARY: '#111111',      // Headings and body
  TEXT_SECONDARY: '#666666',    // Subtext, labels, metadata
  TEXT_MUTED: '#8A8A8A',        // Placeholders, disabled — V2 text.tertiary
  TEXT_ON_DARK: '#FFFFFF',      // Text on dark/colored backgrounds

  // Legacy
  TEXT_TERTIARY: '#8A8A8A',
  TEXT_ORANGE: '#BB471D',
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
  TAB_ACTIVE: '#BB471D',
  TAB_INACTIVE: '#AAAAAA',
  TAB_BG: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVE / STREAK (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  LIVE_DOT: '#BB471D',
  STREAK_ICON: '#BB471D',

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
  CATEGORY_FITNESS: '#BB471D',
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
  DIFFICULTY_HARD_TEXT: '#BB471D',
  DIFFICULTY_EXTREME_BG: '#FFE5E5',
  DIFFICULTY_EXTREME_TEXT: '#DC2626',
  DIFFICULTY_MEDIUM: '#F5A623',

  // Celebration / share (task complete overlay)
  CELEB_BG: '#050505',
  CELEB_BONUS_AMBER: '#854F0B',
  CELEB_BONUS_AMBER_BG: '#FAEEDA',
  CELEB_BONUS_GREEN: '#0F6E56',
  CELEB_BONUS_GREEN_BG: '#E1F5EE',
  CELEB_BONUS_PURPLE: '#534AB7',
  CELEB_BONUS_PURPLE_BG: '#EEEDFE',

  // Verification badges (activity feed)
  BADGE_HARD_RED: '#A32D2D',
  BADGE_HARD_BG: '#FCEBEB',
  BADGE_HR_AMBER: '#854F0B',
  BADGE_HR_BG: '#FAEEDA',
  BADGE_LOC_GREEN: '#0F6E56',
  BADGE_LOC_BG: '#E1F5EE',
  BADGE_PHOTO_BLUE: '#185FA5',
  BADGE_PHOTO_BG: '#E6F1FB',

  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED / TIMER (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  FEATURED_BG: '#FFF0ED',
  FEATURED_TEXT: '#BB471D',
  TIMER_BG: '#FFF0ED',
  TIMER_TEXT: '#BB471D',

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK ICONS (from approved reference)
  // ═══════════════════════════════════════════════════════════════════════════
  TASK_ICON_BG: '#FFF0ED',
  TASK_ICON_COLOR: '#BB471D',

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
  INPUT_BORDER_FOCUS: '#BB471D',
  INPUT_PLACEHOLDER: '#8A8A8A',

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
  AVATAR_1: '#BB471D',
  AVATAR_2: '#2D8A4E',
  AVATAR_3: '#7B61FF',
  AVATAR_4: '#00897B',
  AVATAR_5: '#C4960C',
  AVATAR_6: '#D94040',
  AVATAR_COLOR_1: '#BB471D',
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
  SWITCH_TRACK_ON: '#BB471D',
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
  PAYWALL_BULLET: '#BB471D',
  SHARE_CARD_BG: '#000000',
  PROFILE_HEADER_BG: '#F5F3F0',
  SCORE_ICON: '#666666',
  RANK_DOT: '#AAAAAA',

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE REDESIGN — tokens (no raw hex in profile screens)
  // ═══════════════════════════════════════════════════════════════════════════
  PRIMARY: '#E8593C',
  SURFACE: '#F1EFE8',
  PROFILE_PAGE_BG: '#F2F1EC',
  PROFILE_TEXT_PRIMARY: '#2C2C2A',
  PROFILE_TEXT_SECONDARY: '#888780',
  PROFILE_TEXT_MUTED: '#B4B2A9',
  PROFILE_BORDER_ALT: '#E8E6DF',
  PROFILE_TIER_STARTER_BG: '#FFF3F0',
  PROFILE_TIER_STARTER_TEXT: '#993C1D',
  PROFILE_TIER_BUILDER_BG: '#E1F5EE',
  PROFILE_TIER_BUILDER_TEXT: '#0F6E56',
  PROFILE_TIER_WARRIOR_BG: '#EEEDFE',
  PROFILE_TIER_WARRIOR_TEXT: '#534AB7',
  PROFILE_STAT_CORAL_BG: '#FFF3F0',
  PROFILE_STAT_AMBER_BG: '#FAEEDA',
  PROFILE_STAT_TEAL_BG: '#E1F5EE',
  PROFILE_STAT_BLUE_BG: '#E6F1FB',
  PROFILE_STAT_CORAL_ICON: '#E8593C',
  PROFILE_STAT_AMBER_ICON: '#BA7517',
  PROFILE_STAT_TEAL_ICON: '#1D9E75',
  PROFILE_STAT_BLUE_ICON: '#378ADD',
  PROFILE_NEXT_BADGE_BG: '#F1EFE8',
  PROFILE_SUCCESS: '#4CAF50',

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
  centerButtonBg: '#BB471D',
  DISCOVER_CORAL: '#E8593C',
  DISCOVER_BLUE: '#5B7FD4',
  DISCOVER_GREEN: '#4CAF50',
  /** Discover titles, list headings — was hardcoded #1A1A1A */
  DISCOVER_INK: '#1A1A1A',
  /** Row dividers / subtle separators — was #F5F2EB */
  DISCOVER_DIVIDER: '#F5F2EB',
  /** Secondary meta text — was #BBB */
  DISCOVER_META_SILVER: '#BBBBBB',
  /** Muted labels (search, descriptions) — was #777 */
  DISCOVER_LABEL_MUTED: '#777777',
  /** Hero featured card & CTA dark panels — was #1A1410 */
  DISCOVER_HERO_DARK_BG: '#1A1410',
  /** Avatar ring on hero social cluster (on dark gradient) */
  DISCOVER_HERO_AVATAR_RING: 'rgba(255,255,255,0.35)',
  /** Difficulty pill tints (Popular/Daily/Team cards) */
  DISCOVER_DIFF_TINT_EASY: '#F0FAF2',
  DISCOVER_DIFF_TINT_HARD: '#FFF5F0',
  DISCOVER_DIFF_TINT_MED: '#F0F4FF',
  /** Category stripe backgrounds (Popular row rotation) */
  DISCOVER_STRIPE_WARM: '#3A1A10',
  DISCOVER_STRIPE_COOL: '#1A2940',
  DISCOVER_STRIPE_GREEN: '#1B3A1B',
  DISCOVER_STRIPE_PURPLE: '#2A1A3A',
  DISCOVER_STRIPE_AMBER: '#3A2A10',
  DISCOVER_ACCENT_PURPLE: '#9C27B0',
  DISCOVER_ACCENT_ORANGE: '#FF9800',
  /** Team challenge card — duo vs solo icon treatments */
  TEAM_CARD_ICON_BG_DUO: '#E8F5E9',
  TEAM_CARD_ICON_BG_SOLO: '#FFF3ED',
  TEAM_CARD_ICON_GREEN: '#2E7D32',
  TEAM_CARD_ICON_CORAL: '#D4532A',
  /** Trophy / soft surfaces */
  TROPHY_ICON_WRAP_BG: '#F9F6F1',
  /** Progress bars (profile, next unlock) — was #F0EDE6 */
  PROGRESS_TRACK_WARM: '#F0EDE6',
  /** Next-unlock promo surface — was #FFFBF7 */
  NEXT_UNLOCK_SURFACE: '#FFFBF7',
  NEXT_UNLOCK_ICON_BOX: '#FFF3ED',
  /** Settings-style labels — was #444 */
  LIST_LABEL_GRAY: '#444444',
  /** Chevron / inactive icons — was #CCC */
  CHEVRON_MUTED: '#CCCCCC',
  /** Filter chip inactive — was #555555 */
  FILTER_LABEL_MUTED: '#555555',
  /** Community header action — was #555 */
  COMMUNITY_ACTION_GRAY: '#555555',
  /** Discover v3 borders — was #E0DCD4 */
  DISCOVER_BORDER_SOFT: '#E0DCD4',
  /** Discover v3 secondary label — was #777 (same as DISCOVER_LABEL_MUTED; alias for readability) */
  DISCOVER_V3_LABEL: '#777777',
  /** Discover v3 inline search border — matches default BORDER */
  DISCOVER_V3_SEARCH_BORDER: '#E8E5DF',
  /** Team compact row left accent (Material blue) */
  DISCOVER_V3_TEAM_ROW_ACCENT: '#2196F3',
  /** Lucide stroke on neutral discover icons */
  DISCOVER_V3_ICON_MUTED: '#888888',
  /** Hard difficulty left border on compact rows */
  DISCOVER_V3_ROW_HARD_BORDER: '#C62828',

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVER V3 — Streak risk banner (loss-aversion red tint)
  // ═══════════════════════════════════════════════════════════════════════════
  DANGER_BG_SUBTLE: '#FCEBEB',
  DANGER_BORDER_SUBTLE: 'rgba(163,45,45,0.15)',
  DANGER_TEXT_PRIMARY: '#501313',
  DANGER_TEXT_SECONDARY: '#791F1F',
  DANGER_ACCENT: '#A32D2D',

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVER V3 — Featured card dark surface + photo overlays
  // ═══════════════════════════════════════════════════════════════════════════
  FEATURED_DARK_BG: '#1a1a1a',
  FEATURED_OVERLAY_BADGE: 'rgba(255,255,255,0.15)',
  FEATURED_OVERLAY_ATTRIBUTION: 'rgba(0,0,0,0.45)',
  FEATURED_TEXT_PRIMARY: '#ffffff',
  FEATURED_TEXT_SECONDARY: 'rgba(255,255,255,0.65)',

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVER V3 — Category icon tile palette (Body / Mind / Faith / Focus)
  // ═══════════════════════════════════════════════════════════════════════════
  CATEGORY_BODY_TINT: '#FAECE7',
  CATEGORY_MIND_TINT: '#EAF3DE',
  CATEGORY_FAITH_TINT: '#E1F5EE',
  CATEGORY_FOCUS_TINT: '#FBEAF0',
  CATEGORY_BODY_ICON: '#993C1D',
  CATEGORY_MIND_ICON: '#3B6D11',
  CATEGORY_FAITH_ICON: '#0F6E56',
  CATEGORY_FOCUS_ICON: '#993556',

  // ═══════════════════════════════════════════════════════════════════════════
  // ONBOARDING (migrated from constants/onboarding-theme.ts)
  // ═══════════════════════════════════════════════════════════════════════════
  ONBOARDING_BG_PAGE: '#F5F1EB',
  ONBOARDING_BG_SECONDARY: '#FAF8F5',
  ONBOARDING_ACCENT_LIGHT: '#FFF7ED',
  ONBOARDING_TEXT_SECONDARY: '#7A7A6D',
  ONBOARDING_TEXT_TERTIARY: '#B0ACA3',
  ONBOARDING_SUCCESS: '#2D7A4F',
  ONBOARDING_WARNING: '#E8A230',
  ONBOARDING_BORDER: '#E8E4DD',
  ONBOARDING_COMMITMENT_BTN: '#2D2D2D',

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVE ACTIVITY (iOS lock screen + Dynamic Island — lib/live-activity.ts)
  // Always dark surface (Apple HIG); tokens here are render-on-dark only.
  // ═══════════════════════════════════════════════════════════════════════════
  LIVE_ACTIVITY_BG: '#1A1A1A',
  LIVE_ACTIVITY_TITLE: '#FFFFFF',
  LIVE_ACTIVITY_SUBTITLE: '#B0B0B0',
  LIVE_ACTIVITY_LABEL: '#FFFFFF',

  // ═══════════════════════════════════════════════════════════════════════════
  // DARK THEME FOUNDATION (dark palette tokens in DS_COLORS — app is light-first)
  // ═══════════════════════════════════════════════════════════════════════════
  DARK_BG_PAGE: '#1A1A1A',
  DARK_BG_CARD: '#2D2D2D',
  DARK_TEXT_PRIMARY: '#F0EDE6',
  DARK_TEXT_SECONDARY: '#B0ADA8',
  DARK_TEXT_TERTIARY: '#888884',
  DARK_TEXT_MUTED: '#6B6B68',
  DARK_BORDER: '#3D3D3D',
  DARK_PILL_SURFACE: '#3D3D3D',
  DARK_STREAK_PLATINUM: '#B0ADA8',

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE FLOW COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  createErrorText: '#DC2626',
  createErrorBg: '#FEF2F2',
  createChallengeGreen: '#10B981',
  /** Hard mode photo-proof banner (create wizard) */
  CREATE_HARD_WARNING_BG: '#FFF8E1',
  CREATE_HARD_WARNING_BORDER: '#FFE082',
  CREATE_HARD_WARNING_TEXT: '#7A5C00',
  /** Aliases for create redesign (map to existing surfaces) */
  TEXT_HINT: '#8A8A8A',
  BORDER_LIGHT: '#EEEBE5',
  CARD_BG: '#FFFFFF',
  WARM_CREAM: '#F2F1EC',

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
  activityOrange: '#BB471D',
  borderFocus: '#BB471D',

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKWARD COMPATIBILITY ALIASES (lowercase — for gradual migration)
  // These are DIRECT properties, NOT added via Object.assign
  // ═══════════════════════════════════════════════════════════════════════════
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#8A8A8A',
  accent: '#BB471D',
  accentDark: '#9E3A14',
  border: '#E8E5DF',
  success: '#3D7A5A',
  tabInactive: '#AAAAAA',
  tabActive: '#BB471D',
  white: '#FFFFFF',
  black: '#111111',
  navyDark: '#111111',
  surfaceSubtle: '#FFF0ED',
  surfaceMuted: '#F7F5F0',
  accentLight: '#FFF0ED',
  accentSoft: '#FFF0ED',
  /** Softer peach on accent backgrounds (challenge detail secondary on orange) */
  accentMuted: '#E8A87C',
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
  runOrange: '#BB471D',
  borderAlt: '#EFEFEF',
  challenge24hHeaderBg: '#2D6A4F',
  avatarPurple: '#7C6BC4',
  emeraldDark: '#065F46',
  challengeHeaderDark: '#2D3A2E',
  alertRedBorder: '#FECACA',
  inputPlaceholder: '#8A8A8A',

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
  avatarColor1: '#BB471D',
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

  // ═══════════════════════════════════════════════════════════════════════════
  // FEED (social post cards — all hex centralized; components import only DS_COLORS)
  // ═══════════════════════════════════════════════════════════════════════════
  FEED_USERNAME: '#2C2C2A',
  FEED_META_MUTED: '#B4B2A9',
  FEED_DAY_PILL_BG: '#FFF3F0',
  FEED_DAY_PILL_TEXT: '#993C1D',
  FEED_MENU_DOTS: '#C4C3BC',
  FEED_RESPECT_ACTIVE_BG: '#FFF3F0',
  FEED_RESPECT_ACTIVE_TEXT: '#993C1D',
  FEED_ENGAGEMENT_MUTED: '#888780',
  FEED_COMMENT_BORDER: '#F5F3EE',
  FEED_COMMENT_BODY: '#5F5E5A',
  FEED_PROGRESS_LABEL: '#993C1D',
  FEED_PROGRESS_TRACK: '#F0EDE6',
  FEED_PLACEHOLDER_WATER: '#D4E0D0',
  FEED_PLACEHOLDER_COLD: '#C8D8E8',
  FEED_PLACEHOLDER_GENERAL: '#E8DDD4',
  FEED_TAB_INACTIVE_BG: '#EDEAE3',
  FEED_TAB_ACTIVE_BG: '#2C2C2A',
  FEED_TAB_ACTIVE_TEXT: '#F9F6F1',
  FEED_LIVE_LABEL: '#0F6E56',
  FEED_MILESTONE_SURFACE: '#FAEEDA',
  FEED_MILESTONE_ICON_SURFACE: '#FAC775',
  FEED_MILESTONE_TITLE: '#633806',
  FEED_MILESTONE_SUBTITLE: '#854F0B',
  FEED_MILESTONE_STAR: '#854F0B',
  FEED_CTA_ICON_BG: 'rgba(232,89,60,0.12)',
  FEED_GRADIENT_END: 'rgba(0,0,0,0.6)',
  FEED_CAPTION_TAG: 'rgba(255,255,255,0.8)',
  FEED_STREAK_BADGE: '#E8593C',
  FEED_SHARE_CHEVRON: '#5F5E5A',
  FEED_AVATAR_RING: '#FFFFFF',
  FEED_BADGE_GREEN: '#1D9E75',
  FEED_RESPECT_ICON_FILL: '#E8593C',

  /** Daily bonus quest card (home) — borders / timer track; no raw rgba in components */
  DAILY_BONUS_BORDER: 'rgba(245,166,35,0.12)',
  DAILY_BONUS_TIMER_TRACK: 'rgba(245,166,35,0.15)',

  // ═══════════════════════════════════════════════════════════════════════════
  // RGBA ALIASES (components — no inline rgba outside this file)
  // ═══════════════════════════════════════════════════════════════════════════
  OVERLAY_WHITE_4: 'rgba(255,255,255,0.04)',
  OVERLAY_WHITE_6: 'rgba(255,255,255,0.06)',
  OVERLAY_WHITE_8: 'rgba(255,255,255,0.08)',
  OVERLAY_WHITE_15: 'rgba(255,255,255,0.15)',
  OVERLAY_WHITE_18: 'rgba(255,255,255,0.18)',
  OVERLAY_WHITE_22: 'rgba(255,255,255,0.22)',
  TEXT_ON_DARK_40: 'rgba(255,255,255,0.4)',
  TEXT_ON_DARK_45: 'rgba(255,255,255,0.45)',
  TEXT_ON_DARK_50: 'rgba(255,255,255,0.5)',
  TEXT_ON_DARK_60: 'rgba(255,255,255,0.6)',
  TEXT_ON_DARK_70: 'rgba(255,255,255,0.7)',
  OVERLAY_BLACK_08: 'rgba(0,0,0,0.08)',
  OVERLAY_BLACK_10: 'rgba(0,0,0,0.1)',
  OVERLAY_BLACK_20: 'rgba(0,0,0,0.2)',
  OVERLAY_BLACK_25: 'rgba(0,0,0,0.25)',
  OVERLAY_BLACK_30: 'rgba(0,0,0,0.3)',
  OVERLAY_BLACK_40: 'rgba(0,0,0,0.4)',
  OVERLAY_BLACK_45: 'rgba(0,0,0,0.45)',
  OVERLAY_BLACK_85: 'rgba(0,0,0,0.85)',
  CHALLENGE_HEADER_GREEN_SOFT_6: 'rgba(46,125,50,0.06)',
  CHALLENGE_HEADER_GREEN_SOFT_12: 'rgba(46,125,50,0.12)',
  CHALLENGE_HEADER_GREEN_SOFT_15: 'rgba(46,125,50,0.15)',
  CHALLENGE_HEADER_ORANGE_SOFT_8: 'rgba(232,115,58,0.08)',
  CHALLENGE_HEADER_ORANGE_SOFT_14: 'rgba(232,115,58,0.14)',
  CHALLENGE_HEADER_ORANGE_SOFT_15: 'rgba(232,115,58,0.15)',
  CHALLENGE_HEADER_ORANGE_SOFT_20: 'rgba(232,115,58,0.20)',
  HERO_CARD_PRIMARY_GLOW_25: 'rgba(232,89,60,0.25)',
  HERO_CARD_AMBER_GLOW_10: 'rgba(232,137,58,0.1)',
  CHIP_BG_DARK_ON_LIGHT: 'rgba(0,0,0,0.15)',
  TIMER_DANGER_OVERLAY_15: 'rgba(239, 68, 68, 0.15)',

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARE CARDS / SHEET (components/share — no raw hex in share UI)
  // ═══════════════════════════════════════════════════════════════════════════
  SHARE_CARD_CREAM: '#F5F0E8',
  SHARE_GRADIENT_START: '#1A0E08',
  SHARE_TRANSPARENT_DAY_TEXT: '#FF6B4A',
  SHARE_SHEET_CHECKER_LIGHT: '#E8E8E8',
  SHARE_SHEET_CHECKER_DARK: '#CFCFCF',
  SHARE_WATERMARK_MUTED: 'rgba(255,255,255,0.25)',
  SHARE_ACCENT_15: 'rgba(232, 89, 60, 0.15)',
  SHARE_GREEN_15: 'rgba(61, 122, 90, 0.15)',
  SHARE_DAY_PILL_ORANGE_30: 'rgba(232, 89, 60, 0.3)',
  SHARE_RECAP_ACCENT_30: 'rgba(232,89,60,0.3)',
  SHARE_SEPARATOR_08: 'rgba(0,0,0,0.08)',
  TEXT_ON_DARK_30: 'rgba(255,255,255,0.3)',
  TEXT_ON_DARK_35: 'rgba(255,255,255,0.35)',
  OVERLAY_BLACK_50: 'rgba(0,0,0,0.5)',
  OVERLAY_BLACK_12: 'rgba(0, 0, 0, 0.12)',
} as const;

/** Brand + screen tokens (challenge detail bg matches app-wide warm page). */
export const GRIIT_COLORS = {
  primary: DS_COLORS.DISCOVER_CORAL,
  /** Brand accent for share cards / wordmark (alias of primary CTA orange). */
  primaryAccent: DS_COLORS.ACCENT,
  background: DS_COLORS.TROPHY_ICON_WRAP_BG,
  textSecondary: DS_COLORS.textSecondary,
  error: DS_COLORS.danger,
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
  /** Alias — small elevation (matches SUBTLE). */
  sm: {
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

const CHALLENGE_CATEGORY_COLORS = {
  discipline: {
    header: '#2B3A2E',
    subtitleText: '#E8D5B5',
    tagBorder: 'rgba(232,89,60,0.25)',
  },
  fitness: {
    header: '#1B4D6E',
    subtitleText: '#A8CEE4',
    tagBorder: 'rgba(168,206,228,0.3)',
  },
  nutrition: {
    header: '#5C3D2E',
    subtitleText: '#D4B89A',
    tagBorder: 'rgba(212,184,154,0.3)',
  },
  mindfulness: {
    header: '#4A3B5C',
    subtitleText: '#C4B5D6',
    tagBorder: 'rgba(196,181,214,0.3)',
  },
  outdoor: {
    header: '#3A4F3A',
    subtitleText: '#A8C4A8',
    tagBorder: 'rgba(168,196,168,0.3)',
  },
  productivity: {
    header: '#5C4B32',
    subtitleText: '#C4B08A',
    tagBorder: 'rgba(196,176,138,0.3)',
  },
} as const;

const DEFAULT_CATEGORY_COLOR = CHALLENGE_CATEGORY_COLORS.discipline;

export function getCategoryColors(category: string) {
  const key = String(category ?? "").toLowerCase().trim();
  return CHALLENGE_CATEGORY_COLORS[key as keyof typeof CHALLENGE_CATEGORY_COLORS] ?? DEFAULT_CATEGORY_COLOR;
}

// ============================================================================
//
//  V2 TOKENS — additive install (PR#1 of design system v2 migration)
//
//  The v1 tokens above remain untouched and active. The v2 tokens below are
//  appended verbatim from docs/design/design-system.ts (per the spec at
//  docs/design/DESIGN_SYSTEM_v2.md), with three rename adjustments to avoid
//  identifier collisions with v1:
//
//    v2 DS_COLORS   →  DS_COLORS_V2
//    v2 DS_RADIUS   →  DS_RADIUS_V2
//    v2 DS_SPACING  →  DS_SPACING_V2
//
//  All other v2 token groups have no v1 collision and keep their original
//  names: DS_TYPE, DS_TOUCH, DS_SHADOW (singular — distinct from v1's
//  DS_SHADOWS plural), DS_MOTION, DS_ICON, DS_AVATAR, DS_PHOTO,
//  DS_BREAKPOINT, DS_CARD, DS_BUTTON.
//
//  Internal references inside DS_CARD and DS_BUTTON were updated to point at
//  the renamed v2 token sources (DS_COLORS_V2 / DS_RADIUS_V2 / DS_SPACING_V2).
//  References to DS_TYPE.* and DS_TOUCH.* stay as-is (no collision).
//
//  The v2 default export is intentionally dropped — consumers use named
//  imports only.
//
//  Future PRs (#2+) will migrate individual screens/components from v1 token
//  names to v2 token names. Do not delete v1 tokens until that migration is
//  complete.
//
// ============================================================================
// ============================================================================

/**
 * GRIIT design system v2 — token implementation
 *
 * This file is the source of truth for all visual tokens.
 * No raw hex, font sizes, or spacing values anywhere else in the codebase.
 *
 * See docs/DESIGN_SYSTEM_v2.md for the rules and patterns that govern these tokens.
 *
 * Verification gate (must return 0):
 *   grep -rn '#[0-9A-Fa-f]\{3,8\}' --include='*.tsx' --include='*.ts' \
 *     | grep -v design-system | grep -v node_modules | wc -l
 */

// ============================================================================
// COLOR
// ============================================================================

export const DS_COLORS_V2 = {
  // Surfaces
  surface: {
    canvas: '#F5F2ED',          // Main app background (warm cream)
    canvasDark: '#0A0A0A',      // Dark mode equivalent
    card: '#FFFFFF',            // Default card
    cardDark: '#1A1A1A',
    cardSubtle: '#FAF7F2',      // Less-prominent card
    cardSubtleDark: '#161616',

    // Always-dark surfaces (do NOT invert in dark mode)
    heroDark: '#0F0F0F',        // The signature dark surface — streak hero, trophies, etc.
    heroDarkWarm: '#262321',    // Secondary effort surface — active task, in-task screens

    // Streak hero — default state surface (slightly lighter than heroDark, matches v1 BG_DARK).
    // Used by StreakHeroV4 default/day0/secured backgrounds.
    heroNeutral: '#1A1A1A',
    // Streak hero — at-risk state surface (very dark red-tinted).
    heroDanger: '#1A0E0E',

    // Warm gradient ramp — used by HeroFeaturedCard. Three stops top->bottom.
    heroDarkWarmGradient: ['#2a2520', '#4a3a30', '#6b4a30'] as const,

    // Tinted neutral chip background. Sits on white cards where `surface.divider`
    // (#E8E4DC) is too dark and `surface.cardSubtle` (#FAF7F2) is too light.
    // Used by DailyBonusV2 progress-bar track and timer icon container.
    cardChipNeutral: '#F1EFE8',

    // Onboarding v4 structural surfaces (handoff hex, nearest-use names).
    sunken: '#EFEBE2',          // Reassurance / receipt panels
    borderWarm: '#E7E2D8',      // Default control border
    borderStrong: '#DED9CE',    // Auth button borders
    borderDashed: '#D5D0C5',    // Share-link dashed border
    track: '#E2DDD2',           // Empty progress segment, blocked CTA
    camera: '#0B0B0B',          // Task completion v2 capture / review
    warm: '#EAE6DE',            // Hover / back-button wash on light chrome

    // Dividers
    divider: '#E8E4DC',
    dividerDark: '#2A2A2A',
  },

  // Brand
  brand: {
    primary: '#DC5401',         // Daylight brand orange (locked). AA large-text (3.96:1). accentAccessible (#BB471D) for dense text.
    primaryPress: '#B44100',    // Task completion v2 pressed orange
    primaryHover: '#9E3A14',    // Pressed/hover state
    primarySoft: '#FAECE7',     // Subtle tint backgrounds (light mode only)
    primaryOnDark: '#E8693E',   // Slightly brighter for OLED compensation
    primaryText: '#FFFFFF',     // Text on brand.primary — always white
                                // NEVER use primarySoft text on primary background.
                                // That's the v1 contrast bug (2.66:1).
                                // White on #BB471D = 5.2:1 (verified by
                                // tests/design-system-contrast.test.ts)
  },

  // Text
  text: {
    primary: '#0F0F0F',
    primaryDark: '#F5F2ED',
    secondary: '#5F5E5A',
    secondaryDark: '#A8A6A0',
    tertiary: '#8A8A8A',
    body: '#4A4741',            // Task completion v2 gate / failure body
    muted: '#6B6862',           // Task completion v2 secondary copy
    mutedWarm: '#8A867E',       // Onboarding v4 meta / step label
    mutedDark: '#A8A49C',       // Self-entered / disabled ink
    tertiaryDark: '#737272',

    // On always-dark surfaces (don't invert)
    onDark: '#FFFFFF',
    onDarkSecondary: '#A8A6A0',
    onDarkTertiary: '#737272',
  },

  // Semantic
  semantic: {
    success: '#0F6E56',
    successSoft: '#EAF3DE',
    warning: '#854F0B',
    warningSoft: '#FAEEDA',
    danger: '#A32D2D',
    dangerInk: '#A4341A',       // Task completion v2 "NOT POSTED" eyebrow
    dangerSoft: '#FCEBEB',

    // At-risk state on dark hero surface — 1.5px border color.
    // Distinct from `danger` (#A32D2D), which is meant for light surfaces.
    // c-red 400 (next stop up the red ramp from danger = c-red 600).
    dangerOnDark: '#E24B4A',

    // At-risk state subtitle text on dark hero surface.
    // Lighter than `dangerOnDark` for legibility against near-black background.
    // c-red 200.
    dangerOnDarkText: '#F09595',
  },

  // Difficulty (GRIIT-specific)
  difficulty: {
    easy: { fg: '#3B6D11', bg: '#EAF3DE' },
    medium: { fg: '#854F0B', bg: '#FAEEDA' },
    hard: { fg: '#791F1F', bg: '#FCEBEB' },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Streak flame state palette (StreakFlame component, StreakHeroV4)
  // ──────────────────────────────────────────────────────────────────────────
  // Each entry below is the layered fill/stroke for a single state of the
  // SVG flame. Keep tones aligned with the brand orange ramp so the building
  // → locked → onFire progression reads as intensity, not hue shift.
  streak: {
    // Day 0 — never streaked. Cool grey (no warmth).
    day0Outer: '#555555',
    day0Inner: '#3A3A3A',
    day0Stroke: '#777777',

    // Building (1–6) and locked (7–29) and onFire (30+) share the orange ramp.
    // The variant differences are size/layer count, not color.
    flameOuter: '#BB471D',     // matches brand.primary (ACCENT)
    flameMid: '#E0A282',       // warm amber (was v1 HEATMAP_L2)
    flameStroke: '#9E3A14',    // matches brand.primaryHover (ACCENT_DARK)
    flameHotspot: '#F2D4C0',   // soft peach center (was v1 HEATMAP_L1)
    flameCenter: '#EEE9E0',    // tiny white-cream highlight (was v1 HEATMAP_L0)

    // At-risk — red flame on dark surface. Same hex as semantic.dangerOnDark/Text
    // but namespaced to streak so the StreakFlame component reads cleanly.
    atRiskOuter: '#E24B4A',
    atRiskInner: '#F09595',
    atRiskStroke: '#A32D2D',

    // Frozen — blue flame with snowflake glyph.
    frozenOuter: '#85B7EB',
    frozenInner: '#B5D4F4',
    frozenStroke: '#185FA5',

    // Secured — celebration yellow for "Streak secured" label / "+1 day stronger"
    // sub-copy on the dark hero. Distinct from `semantic.warning` (#854F0B,
    // dark amber for light surfaces).
    securedYellow: '#FCDE5A',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Heatmap (year activity grid) — 5 levels of intensity + future / today ring.
  // Mirrors v1 HEATMAP_L0..L4 hex values. Used by `YearHeatmap`.
  // ──────────────────────────────────────────────────────────────────────────
  heatmap: {
    L0: '#EEE9E0',                // empty / no activity (cream)
    L1: '#F2D4C0',                // light (peach)
    L2: '#E0A282',                // medium (warm amber)
    L3: '#BB471D',                // strong (brand orange)
    L4: '#9E3A14',                // saturated (deep brand)
    todayRing: '#1A1A1A',         // optional ring around today's cell
    /** Future cells (dates after today) — slightly lighter than L0 for legibility. */
    future: '#F7F4ED',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Overlays (rgba) — for translucent surfaces / borders on dark hero.
  // Centralized so components never inline rgba(...) strings.
  // ──────────────────────────────────────────────────────────────────────────
  overlay: {
    onDarkSurface04: 'rgba(255,255,255,0.04)',
    onDarkSurface05: 'rgba(255,255,255,0.05)',
    onDarkSurface08: 'rgba(255,255,255,0.08)',
    onDarkSurface10: 'rgba(255,255,255,0.10)',
    onDarkBorder08: 'rgba(255,255,255,0.08)',
    onDarkBorder25: 'rgba(255,255,255,0.25)',
    /** Frozen blue tint for freeze-button background on dark surface (8% of frozenOuter). */
    frozenTint08: 'rgba(133,183,235,0.08)',
    // Text on photo — dim white tones for attribution / meta lines on the
    // immersive hero / proof tiles.
    textOnPhoto100: 'rgba(255,255,255,1)',
    textOnPhoto85: 'rgba(255,255,255,0.85)',
    textOnPhoto70: 'rgba(255,255,255,0.7)',
    // Photo gradient stops — bottom-anchored linear gradient for legibility
    // on top of the proof photo. Three stops (deep / mid / clear) reused by
    // ForYouHero and grid/ProofTile.
    photoGradientDeep: 'rgba(0,0,0,0.92)',
    photoGradientStrong: 'rgba(0,0,0,0.85)',
    photoGradientMid: 'rgba(0,0,0,0.6)',
    photoGradientLight: 'rgba(0,0,0,0.4)',
    photoGradientClear: 'rgba(0,0,0,0)',
    // Pill backdrops on photo (badges, kudos chip).
    chipOnPhoto55: 'rgba(0,0,0,0.55)',
    chipOnPhoto70: 'rgba(0,0,0,0.7)',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Proof / verification — task-flow specific badges + gate states.
  // Used by `VerificationGates`, `TaskShell`, `NewTaskSheet`, the create wizard's
  // difficulty cards, and the missed-task state.
  // ──────────────────────────────────────────────────────────────────────────
  proof: {
    // Hard-mode badge (text + bg) — rendered on dark hero proof tiles, the
    // create-wizard hard-mode card, and the NewTaskSheet hard-mode toggle.
    hardFg: '#A32D2D',
    hardBg: '#FCEBEB',
    // Recommended / standard badge — paired with the standard difficulty card.
    standardFg: '#3D7A5A',
    standardBg: '#EBF5EE',
    // Verification gate states. Three statuses (pass / pending / fail) mirror
    // the icons stacked in the gates card on the task completion screen.
    gateFailBg: '#FCEBEB',
    gateFailFg: '#A32D2D',
    gatePendingBg: '#F5F5F5',
    gatePendingFg: '#888888',
    gatePassBg: '#EBF5EE',
    gatePassFg: '#3D7A5A',

    // ── task-states-v2 ──────────────────────────────────────────────────────
    // Live "● In window" / green-check rows on dark Capture + Verifying surfaces.
    // Lighter than `semantic.success` (#0F6E56) so the dot stays readable on
    // `surface.heroDark` / `surface.canvasDark`. Spec mock greens map here —
    // do not inline a fourth green.
    inWindowOnDark: '#5BA88A',
    // Soft orange glow behind the Secured check circle (brand.primary @ 30%).
    // Spec mock shades #C44A01 / #A03C02 map to brand.primary / brand.primaryHover.
    securedGlow: 'rgba(220, 84, 1, 0.30)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Type scale — locked to Apple HIG with one GRIIT-specific addition (display).
 *
 * Two weights only: 400 (regular) and 500 (medium).
 * No 600, 700, or 800. SF Pro at 500 is bold enough.
 *
 * Sentence case everywhere. ALL CAPS only in tab bar (11pt).
 */
export const DS_TYPE = {
  display: {
    fontSize: 64,
    fontWeight: '500' as const,
    lineHeight: 61, // was 0.95 (CSS multiplier; RN expects absolute pixels)
    letterSpacing: -2.56, // -0.04em at 64pt
    // STREAK HERO NUMBER ONLY. Never anywhere else.
  },
  title: {
    lg: {
      fontSize: 34,
      fontWeight: '500' as const,
      lineHeight: 36,
      letterSpacing: -0.68, // -0.02em at 34pt
    },
    md: {
      fontSize: 22,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: -0.44,
    },
    sm: {
      fontSize: 20,
      fontWeight: '500' as const,
      lineHeight: 23,
      letterSpacing: -0.2,
    },
  },
  headline: {
    fontSize: 17,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    // Minimum readable size for content. Apple HIG floor for body content.
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 13,
    letterSpacing: 0.44, // 0.04em at 11pt
    // Absolute minimum size in the entire app. Tab bar, pill text, stat labels.
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * All spacing in multiples of 4. No odd values.
 * If you need 14px, use 12 or 16. No exceptions.
 */
export const DS_SPACING_V2 = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  gutter: 28,   // Onboarding v4 page gutter (multiple of 4)
  xl: 32,
  ctaBottom: 32, // Handoff 34, snapped to nearest 4px token
  '2xl': 48,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const DS_RADIUS_V2 = {
  sm: 6,    // Pills, badges, small chips
  md: 10,   // Buttons, list rows, small cards
  lg: 14,   // Default cards, post cards
  button: 16, // Onboarding v4 CTA / auth buttons
  xl: 18,   // Hero surfaces, feature cards, modal sheets
  hero: 24, // Onboarding v4 proof / Day 1 dark cards
  full: 9999, // Avatars, circular buttons, tab pills
} as const;


// (v2 default export intentionally omitted — consumers use named imports only.)

// ============================================================================
//
//  DAYLIGHT — iOS redesign v3 token set
//
//  Source of truth: project handoff "GRIIT Daylight v3.dc.html" (Claude Design).
//  Design intent: neutral near-white canvas, pure-white cards, SF Pro throughout
//  (system font; weights 400/600), photography as the hero, ONE orange selection
//  language, calm "owned" streak. One dark screen (the streak moment).
//
//  These tokens are ADDITIVE and namespaced under DS_DAYLIGHT — they do not touch
//  v1 (DS_COLORS) or v2 (DS_COLORS_V2) tokens, so the existing contrast test
//  (tests/design-system-contrast.test.ts, which audits DS_COLORS.ACCENT etc.)
//  is unaffected. All hex for the redesign lives here, per the "no raw hex
//  outside design-system" rule.
//
//  A11Y NOTE: Daylight's accent (#DC5401) measures ~3.96:1 for white text —
//  below the WCAG AA normal-text bar (4.5:1) that the v1 ACCENT (#BB471D, 5.2:1)
//  was deliberately tuned to. It clears the AA large-text bar (3:1). CTA labels
//  use 17pt/600 (borderline "large"). `accentAccessible` (#BB471D) is provided
//  for surfaces that must clear 4.5:1 with white text.
//
// ============================================================================

export const DS_DAYLIGHT = {
  color: {
    // Canvas / backgrounds
    canvas: '#F6F6F4',          // phone screen background (neutral near-white)
    canvasDeep: '#E4E4E1',      // surrounding board / deeper neutral
    canvasSheetBackdrop: '#EDEDEB', // dimmed backdrop behind bottom sheets
    darkCanvas: '#161514',      // the one dark screen (streak moment)

    // Surfaces
    card: '#FFFFFF',
    cardBorder: '#ECECEA',
    divider: '#F0F0EE',
    dividerStrong: '#EAEAE8',
    segmentTrack: '#F0F0EE',    // segmented control / pill group track
    fieldNeutral: '#F6F6F4',    // unselected segment / inset field on a card
    pillNeutral: '#EDEDEB',     // empty day cell / neutral chip
    avatarBg: '#EAEAE8',
    avatarBgAlt: '#DCDAD6',
    handle: '#DCDAD6',          // bottom-sheet grab handle
    dashedBorder: '#D2CFCA',    // "choose from library" dashed control
    toggleOffTrack: '#E2E2DF',

    // Text (ink ramp)
    ink: '#1C1B19',             // primary text
    inkSecondary: '#57544F',    // body / secondary
    inkMuted: '#8E8B86',        // labels, metadata
    inkMuted2: '#A9A6A1',       // fainter metadata
    inkMuted3: '#B4B1AC',       // faintest (day letters, placeholders)
    inkFaint: '#8C8A85',        // section eyebrow on canvasDeep
    placeholder: '#B4B1AC',

    // Accent (single orange selection language)
    accent: '#DC5401',
    accentTint: '#FBEEE5',      // light orange bg — selected chips, badges, banners
    accentAccessible: '#BB471D', // AA-safe (5.2:1 white) fallback for dense text on orange
    accentBannerSubtext: '#9A7256', // muted brown subtext on accentTint banner

    // Icon strokes
    iconInk: '#3A3935',
    iconMuted: '#C4C1BB',
    chevronMuted: '#C4C1BB',

    // Floating glass tab bar
    tabGlassBg: 'rgba(255,255,255,0.74)',
    tabGlassBorder: 'rgba(255,255,255,0.7)',
    tabInactive: '#ABA8A3',
    centerButton: '#1C1B19',

    // Photo treatments
    photoPlaceholder: '#EFEFEC',
    photoBaseDark: '#23211f',
    photoGradientStrong: 'rgba(0,0,0,0.6)',
    photoGradientSoft: 'rgba(0,0,0,0.55)',
    textOnPhoto: '#FFFFFF',
    textOnPhotoDim: 'rgba(255,255,255,0.8)',
    glassChipOnPhotoBg: 'rgba(255,255,255,0.18)',
    glassChipOnPhotoBorder: 'rgba(255,255,255,0.3)',

    // Dark screen (streak moment)
    darkText: '#FFFFFF',
    darkBody: '#D8D4CC',
    darkMuted: '#9A968F',
    darkFaint: '#8C8579',
    darkHeroCard: '#232220',

    white: '#FFFFFF',
    black: '#0a0a0a',           // device bezel
  },

  // SF Pro = system font on iOS; null lets RN fall back to San Francisco.
  fontFamily: undefined as undefined,

  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },

  // Sizes pulled directly from the mockup.
  size: {
    statusTime: 16,
    eyebrow: 14,        // "Wednesday", "Current streak"
    dayLetter: 11,
    metaSm: 12.5,
    meta: 13,
    bodySm: 13.5,
    body: 15,
    bodyLg: 16,
    title: 17,          // row titles, CTA label
    cardTitle: 20,      // "Today's proof", section headers
    greeting: 27,       // "Morning, Marcus"
    screenTitle: 32,    // "Discover"
    streakNumber: 64,   // owned streak figure
    streakMomentNumber: 76, // dark streak-moment figure
    heroTitle: 50,
  },

  radius: {
    chip: 13,
    field: 14,
    button: 15,
    buttonLg: 16,
    card: 22,
    cardSm: 18,
    cardMd: 20,
    sheet: 30,
    glassBar: 30,
    phone: 46,
    pill: 20,
  },

  space: {
    screenH: 24,        // horizontal screen padding
    cardPad: 20,
    rowGapV: 12,
  },

  shadow: {
    card: {
      shadowColor: 'rgba(28,27,25,0.20)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 32,
      elevation: 6,
    },
    heroCard: {
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 1,
      shadowRadius: 50,
      elevation: 12,
    },
    glassBar: {
      shadowColor: 'rgba(28,27,25,0.20)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 32,
      elevation: 8,
    },
  },
} as const;

// Design of record, Sept 6 2026. Source: design/handoff/src/tokens.ts and cursor/00_READ_FIRST.md.
// Every text pair measured with the WCAG formula; ratios in comments.
export const DS_V3 = {
  color: {
    canvas: '#0F0F0F',          // tokens.ts:7
    surface: '#1A1917',         // tokens.ts:8
    border: '#2E2B27',          // tokens.ts:9
    textPrimary: '#F5F3EE',     // 17.3:1 on canvas, 15.8:1 on surface — tokens.ts:10
    textSecondary: '#A39E95',   // 7.2:1 on canvas, 6.6:1 on surface — tokens.ts:11
    brand: '#DC5401',           // fills, week strip, active outlines — tokens.ts:12
    brandText: '#E8600F',       // orange as text: 5.6:1 canvas, 5.1:1 surface — tokens.ts:13
    brandTint: '#3A1F10',       // hint grounds, selected chips, own row — tokens.ts:14
    onBrand: '#0F0F0F',         // label on a brand fill: 4.9:1 — tokens.ts:15
    danger: '#E5533D',          // 5.1:1 on canvas — tokens.ts:16
  },
  type: {
    display:    { fontSize: 34, lineHeight: 41, fontWeight: '500' as const, letterSpacing: -0.5 },
    number:     { fontSize: 64, lineHeight: 64, fontWeight: '600' as const, fontFamily: 'BarlowCondensed_600SemiBold', fontVariant: ['tabular-nums'] as const, letterSpacing: -0.64 },
    title:      { fontSize: 28, lineHeight: 34, fontWeight: '500' as const },
    heading:    { fontSize: 20, lineHeight: 25, fontWeight: '500' as const },
    body:       { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
    bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: '500' as const },
    secondary:  { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
    caption:    { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
    label:      { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.72, textTransform: 'uppercase' as const },
    stamp:      { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, fontFamily: 'BarlowCondensed_600SemiBold', letterSpacing: 0.96, textTransform: 'uppercase' as const },
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, gutter: 20, section: 32 },
  radius: {
    input: 12,
    card: 20,
    pill: 999,
    thumb: 4,                  // tokens.ts:83 contactSheet.radius; 03_media.md:62
  },
  size: {
    tap: 44,
    button: 52,
    buttonSmall: 44,
    shutter: 72,
    avatar: { xs: 32, sm: 40, md: 56, lg: 96 },
  },
  numberSize: { inline: 17, home: 64, moment: 96, mid: 160, share: 220 },
  contactSheet: { cols: 6, rows: 5, gap: 4, radius: 4, revealMs: 600, dimmed: 0.4 },
  motion: {
    count: 400,                // tokens.ts:74 motion.daySecuredMs; 00_READ_FIRST.md:81
    sheet: 600,                // tokens.ts:83 contactSheet.revealMs; 00_READ_FIRST.md:80
  },
} as const;

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

export const DS_COLORS = {
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

    // Dividers
    divider: '#E8E4DC',
    dividerDark: '#2A2A2A',
  },

  // Brand
  brand: {
    primary: '#D85A30',         // The GRIIT orange
    primaryHover: '#C04A23',    // Pressed/hover state
    primarySoft: '#FAECE7',     // Subtle tint backgrounds (light mode only)
    primaryOnDark: '#E8693E',   // Slightly brighter for OLED compensation
    primaryText: '#FFFFFF',     // Text on brand.primary — always white
                                // NEVER use primarySoft text on primary background.
                                // That's the v1 contrast bug (2.66:1).
                                // White on primary = 5.4:1 ✓
  },

  // Text
  text: {
    primary: '#0F0F0F',
    primaryDark: '#F5F2ED',
    secondary: '#5F5E5A',
    secondaryDark: '#A8A6A0',
    tertiary: '#8A8A8A',
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
    dangerSoft: '#FCEBEB',
  },

  // Difficulty (GRIIT-specific)
  difficulty: {
    easy: { fg: '#3B6D11', bg: '#EAF3DE' },
    medium: { fg: '#854F0B', bg: '#FAEEDA' },
    hard: { fg: '#791F1F', bg: '#FCEBEB' },
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
    lineHeight: 0.95,
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
export const DS_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const DS_RADIUS = {
  sm: 6,    // Pills, badges, small chips
  md: 10,   // Buttons, list rows, small cards
  lg: 14,   // Default cards, post cards
  xl: 18,   // Hero surfaces, feature cards, modal sheets
  full: 9999, // Avatars, circular buttons, tab pills
} as const;

// ============================================================================
// HIT TARGETS (Apple HIG minimum 44pt)
// ============================================================================

export const DS_TOUCH = {
  minSize: 44, // Apple HIG minimum touch target
} as const;

// ============================================================================
// SHADOWS (mostly none — surface contrast does the work)
// ============================================================================

/**
 * GRIIT v2 uses surface contrast, not shadows, to define depth.
 * The only allowed shadow is the focus ring on inputs.
 */
export const DS_SHADOW = {
  none: 'none',
  focusRing: '0 0 0 3px rgba(216, 90, 48, 0.2)', // brand.primary at 20% opacity
} as const;

// ============================================================================
// MOTION (placeholder — full spec coming in v2.1)
// ============================================================================

export const DS_MOTION = {
  // Streak counter increment
  streakIncrement: { duration: 600, easing: 'ease-out' },
  // Default page transitions
  pageTransition: { duration: 250, easing: 'ease-in-out' },
  // Pressable button press
  buttonPress: { duration: 100, easing: 'ease-out' },
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const DS_ICON = {
  xs: 14,    // Inline metadata icons
  sm: 18,    // Search, settings inline
  md: 22,    // Action row icons (respect, comment, share)
  lg: 24,    // Tab bar icons
  xl: 32,    // Photo proof camera, large emphasis icons
} as const;

// ============================================================================
// AVATARS
// ============================================================================

export const DS_AVATAR = {
  sm: 32,   // Notifications, comments
  md: 40,   // Post cards, list rows (general)
  lg: 50,   // Profile screen header
} as const;

// ============================================================================
// PHOTO RATIOS (proof submission — locked)
// ============================================================================

/**
 * Proof photos lock to 4:5 (Instagram standard).
 * Camera-only enforcement (no gallery uploads) is a separate guard in the
 * camera component — this constant is for layout / preview frames.
 */
export const DS_PHOTO = {
  proofAspectRatio: 4 / 5, // width / height — Instagram 1080×1350
  proofMaxWidth: 1080,
  proofMaxHeight: 1350,
} as const;

// ============================================================================
// BREAKPOINTS (mobile primary, but having these prevents future bugs)
// ============================================================================

export const DS_BREAKPOINT = {
  phone: 0,
  phoneLg: 414,
  tablet: 768,
} as const;

// ============================================================================
// COMPOSITE TOKENS (pre-baked combinations for common cases)
// ============================================================================

/**
 * Pre-baked card configurations. Use these in components rather than
 * composing from primitives every time.
 */
export const DS_CARD = {
  default: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.md,
  },
  subtle: {
    backgroundColor: DS_COLORS.surface.cardSubtle,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.md,
  },
  heroDark: {
    backgroundColor: DS_COLORS.surface.heroDark,
    borderRadius: DS_RADIUS.xl,
    padding: DS_SPACING.lg,
  },
  activeTask: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.md,
    borderWidth: 1.5,
    borderColor: DS_COLORS.surface.heroDarkWarm,
  },
} as const;

/**
 * Pre-baked button configurations.
 */
export const DS_BUTTON = {
  primary: {
    backgroundColor: DS_COLORS.brand.primary,
    color: DS_COLORS.brand.primaryText,
    borderRadius: DS_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    ...DS_TYPE.headline,
    fontWeight: '500' as const,
  },
  primaryOnDark: {
    backgroundColor: DS_COLORS.brand.primaryOnDark,
    color: DS_COLORS.brand.primaryText,
    borderRadius: DS_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    ...DS_TYPE.headline,
    fontWeight: '500' as const,
  },
  secondary: {
    backgroundColor: DS_COLORS.surface.card,
    color: DS_COLORS.text.primary,
    borderRadius: DS_RADIUS.md,
    borderWidth: 0.5,
    borderColor: DS_COLORS.surface.divider,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    ...DS_TYPE.headline,
    fontWeight: '500' as const,
  },
  ghostOnDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: DS_COLORS.text.onDark,
    borderRadius: DS_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    ...DS_TYPE.headline,
    fontWeight: '500' as const,
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  colors: DS_COLORS,
  type: DS_TYPE,
  spacing: DS_SPACING,
  radius: DS_RADIUS,
  touch: DS_TOUCH,
  shadow: DS_SHADOW,
  motion: DS_MOTION,
  icon: DS_ICON,
  avatar: DS_AVATAR,
  photo: DS_PHOTO,
  breakpoint: DS_BREAKPOINT,
  card: DS_CARD,
  button: DS_BUTTON,
};

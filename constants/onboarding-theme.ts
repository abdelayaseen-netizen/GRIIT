/** GRIIT Design DNA — cream bg, charcoal text, burnt orange accent, dark CTA */
export const ONBOARDING_COLORS = {
  background: '#F5F1EB',
  backgroundSecondary: '#FAF8F5',
  backgroundTertiary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  accent: '#D2734A',
  accentLight: '#FFF7ED',
  accentMuted: 'rgba(210, 115, 74, 0.15)',
  accentBorder: 'rgba(210, 115, 74, 0.3)',

  textPrimary: '#2D3A2E',
  textSecondary: '#7A7A6D',
  textTertiary: '#B0ACA3',
  textOnAccent: '#FFFFFF',

  success: '#2D7A4F',
  successMuted: 'rgba(45, 122, 79, 0.15)',
  warning: '#E8A230',

  border: '#E8E4DD',
  borderActive: '#2D3A2E',
  commitmentButtonBg: '#2D2D2D',

  /** Progress dots & disabled fills */
  DISABLED_BG: '#E8E4DD',
  WHITE: '#FFFFFF',
} as const;

export const ONBOARDING_TYPOGRAPHY = {
  heroSize: 36,
  heroLineHeight: 40,
  heroWeight: '800' as const,
  heroLetterSpacing: -1.5,

  headingSize: 28,
  headingLineHeight: 34,
  headingWeight: '700' as const,
  headingLetterSpacing: -0.8,

  subheadingSize: 18,
  subheadingLineHeight: 26,
  subheadingWeight: '600' as const,

  bodySize: 16,
  bodyLineHeight: 24,
  bodyWeight: '400' as const,

  smallSize: 14,
  smallLineHeight: 20,

  captionSize: 12,
  captionLineHeight: 16,

  fontFamily: 'System',
} as const;

export const ONBOARDING_SPACING = {
  screenPadding: 24,
  sectionGap: 32,
  cardGap: 12,
  elementGap: 16,
  buttonHeight: 56,
  buttonRadius: 16,
  cardRadius: 16,
  chipRadius: 12,
  progressDotSize: 8,
  progressDotGap: 8,
} as const;

export const GOAL_OPTIONS = [
  {
    id: 'physical_toughness' as const,
    emoji: '💪',
    title: 'Physical toughness',
    subtitle: 'Push your body to the limit',
  },
  {
    id: 'mental_discipline' as const,
    emoji: '🧠',
    title: 'Mental discipline',
    subtitle: 'Build an unbreakable mind',
  },
  {
    id: 'daily_habits' as const,
    emoji: '⚡',
    title: 'Daily habits',
    subtitle: 'Stack habits that stick',
  },
  {
    id: 'reading_learning' as const,
    emoji: '📖',
    title: 'Reading & learning',
    subtitle: 'Feed your mind every day',
  },
  {
    id: 'cold_exposure' as const,
    emoji: '🧊',
    title: 'Cold exposure',
    subtitle: 'Embrace the discomfort',
  },
  {
    id: 'no_excuses' as const,
    emoji: '🔥',
    title: 'No excuses',
    subtitle: 'All of the above',
  },
] as const;

export const INTENSITY_OPTIONS = [
  {
    id: 'beginner' as const,
    title: 'Building up',
    subtitle: "I'm starting my discipline journey",
    emoji: '🌱',
    description: '2-3 tasks per day, forgiving streak rules',
  },
  {
    id: 'intermediate' as const,
    title: 'I push myself',
    subtitle: 'I already have some discipline',
    emoji: '⚡',
    description: '4-5 tasks per day, standard challenges',
  },
  {
    id: 'extreme' as const,
    title: 'No mercy',
    subtitle: 'I want the hardest challenges',
    emoji: '🔥',
    description: '75 Hard, extreme protocols, zero rest days',
  },
] as const;

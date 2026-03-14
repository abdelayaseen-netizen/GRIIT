export const ONBOARDING_COLORS = {
  background: '#0A0A0A',
  backgroundSecondary: '#141414',
  backgroundTertiary: '#1C1C1E',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',

  accent: '#E8593C',
  accentLight: '#FF7A5C',
  accentMuted: 'rgba(232, 89, 60, 0.15)',
  accentBorder: 'rgba(232, 89, 60, 0.3)',

  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textOnAccent: '#FFFFFF',

  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',

  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(232, 89, 60, 0.5)',
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

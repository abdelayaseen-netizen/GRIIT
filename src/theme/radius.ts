/**
 * Rounded corners. Rork: cards ~22, buttons ~22, pills for chips.
 */
export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export type Radius = typeof radius;

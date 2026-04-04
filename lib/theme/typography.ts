import { DS_TYPOGRAPHY } from "@/lib/design-system";
/**
 * Typography tokens. Rork: big bold headlines + clean body.
 * No screen should hardcode fontSize/fontWeight after refactor.
 */
export const typography = {
  h0: { fontSize: 40, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.8, lineHeight: 44 },
  h1: { fontSize: 34, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.6, lineHeight: 38 },
  h2: { fontSize: 28, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.4, lineHeight: 32 },
  h3: { fontSize: 22, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.2, lineHeight: 26 },

  body: { fontSize: 16, fontWeight: "500" as const, lineHeight: 22 },
  body2: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },

  caption: { fontSize: 12, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, letterSpacing: 1.2, lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, letterSpacing: 1.0, lineHeight: 14 },
} as const;

export type Typography = typeof typography;

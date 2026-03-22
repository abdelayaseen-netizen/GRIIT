import { DS_COLORS, GRIIT_COLORS } from "@/lib/design-system";

/** Single selection style for challenge creation (orange system only). */
export const CREATE_SELECTION = {
  border: GRIIT_COLORS.primary,
  background: DS_COLORS.ACCENT_TINT,
  text: GRIIT_COLORS.primary,
} as const;

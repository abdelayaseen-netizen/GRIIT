/**
 * Soft shadows only. Rork: no harsh shadows.
 */
import { DS_COLORS } from "@/lib/design-system";

export const shadows = {
  card: {
    shadowColor: DS_COLORS.shadowBlack,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  button: {
    shadowColor: DS_COLORS.shadowBlack,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

export type Shadows = typeof shadows;

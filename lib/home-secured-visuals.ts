import { DS_V3 } from "@/lib/design-system";

/** Server `getSecuredDateKeys` only. Checkins are not an input. */
export function homeSecuredToday(keys: string[], todayKey: string): boolean {
  return keys.includes(todayKey);
}

/**
 * CTA, task circle, and today's week square all read this one boolean.
 */
export function homeProofFilled(securedToday: boolean): {
  posted: boolean;
  circleFill: string;
  todaySquareFilled: boolean;
} {
  return {
    posted: securedToday,
    circleFill: securedToday ? DS_V3.color.brand : DS_V3.color.border,
    todaySquareFilled: securedToday,
  };
}

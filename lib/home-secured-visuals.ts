import { DS_COLORS_V2, DS_V3 } from "@/lib/design-system";

/**
 * CTA, task circle, and today's week square all read this one boolean.
 * `securedToday` is date-keys ∪ posted-from-checkins — not a new flag.
 */
export function homeProofFilled(securedToday: boolean): {
  posted: boolean;
  circleFill: string;
  todaySquareFilled: boolean;
} {
  return {
    posted: securedToday,
    circleFill: securedToday ? DS_COLORS_V2.brand.primary : DS_V3.color.border,
    todaySquareFilled: securedToday,
  };
}

export function homeSecuredToday(input: {
  dateKeysSaySecured: boolean;
  postedFromCheckins: boolean;
}): boolean {
  return input.dateKeysSaySecured || input.postedFromCheckins;
}

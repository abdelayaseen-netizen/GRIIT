import { DS_V3 } from "@/lib/design-system";

export const TAB_BAR_PILL_HEIGHT = DS_V3.space.xs * 16;
export const TAB_BAR_CLEARANCE = 96;

/** Scroll padding so the last row clears the overlay tab bar. */
export function tabBarContentPad(_bottomInset?: number): number {
  return TAB_BAR_CLEARANCE;
}

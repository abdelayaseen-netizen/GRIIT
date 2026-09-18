import { DS_V3 } from "@/lib/design-system";

export const TAB_BAR_PILL_HEIGHT = DS_V3.space.xs * 16;

/** Scroll padding so the last row clears the overlay tab bar. */
export function tabBarContentPad(bottomInset: number): number {
  return TAB_BAR_PILL_HEIGHT + Math.max(bottomInset, DS_V3.space.md) + DS_V3.space.gutter;
}

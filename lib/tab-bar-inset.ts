import { DS_V3 } from "@/lib/design-system";

export const TAB_BAR_PILL_HEIGHT = DS_V3.space.xs * 16;
/** Floor for phones without a home indicator (pill 64 + dock 12 + one gutter). */
export const TAB_BAR_CLEARANCE = 96;

/**
 * Scroll padding so the last row clears the overlay tab bar.
 * Build 90 06.4: the dock sits on `max(bottomInset, space.md)` (components/ds/TabBar.tsx),
 * so on a phone with a 34pt home indicator the pill's top edge is 98pt up and a fixed 96
 * left the last line (the "Everyone is on until you follow 3 people." hint) behind it.
 * Pill + dock + one gutter of air, never below the old floor.
 */
export function tabBarContentPad(bottomInset?: number): number {
  const dock = Math.max(bottomInset ?? 0, DS_V3.space.md);
  return Math.max(TAB_BAR_CLEARANCE, TAB_BAR_PILL_HEIGHT + dock + DS_V3.space.gutter);
}

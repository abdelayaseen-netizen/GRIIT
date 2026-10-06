/** v48 safe-area floors. Measured on 393 × 852. Runtime insets win when they are larger. */
export const SAFE = {
  top: 59,
  bottom: 34,
  tabBar: 49,
  tabTotal: 83,
  gutter: 16,
  stickyGap: 12,
  toastBottom: 95,
  scrollEndClearance: 83 + 16,
  sheetTopMin: 59 + 12,
} as const;

export type ScreenEdge = "top" | "bottom" | "left" | "right";

export function screenPadding(
  insets: { top: number; bottom: number; left: number; right: number },
  edges: readonly ScreenEdge[],
): { paddingTop: number; paddingBottom: number; paddingLeft: number; paddingRight: number } {
  return {
    paddingTop: edges.includes("top") ? Math.max(insets.top, SAFE.top) : 0,
    paddingBottom: edges.includes("bottom") ? Math.max(insets.bottom, SAFE.bottom) : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  };
}

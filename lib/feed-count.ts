/** Heart / comment counts render only when someone has engaged. */
export function showFeedCount(n: number): boolean {
  return n > 0;
}

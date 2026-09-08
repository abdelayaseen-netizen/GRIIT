export const DOUBLE_TAP_TOGGLES_LIKE = true; // false = instagram behaviour, double-tap only likes
export const DOUBLE_TAP_WINDOW_MS = 300;

export function shouldLikeOnDoubleTap(currentlyLiked: boolean): boolean {
  return DOUBLE_TAP_TOGGLES_LIKE || !currentlyLiked;
}

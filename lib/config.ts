/**
 * App config: deep link base URL and store URLs.
 * Swap DEEP_LINK_BASE_URL when production domain is ready.
 */
/** Base URL for deep links and web fallback. Set EXPO_PUBLIC_DEEP_LINK_BASE_URL to override. */
const DEEP_LINK_BASE_URL =
  (typeof process !== "undefined" && (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_DEEP_LINK_BASE_URL) ||
  "https://griit.app";

export { DEEP_LINK_BASE_URL };

/** App Store search fallback when no app ID (opens App Store search for "GRIIT"). */
const APP_STORE_SEARCH_FALLBACK = "https://apps.apple.com/us/search?term=GRIIT";

/** Play Store URL; use env override if package changes. */
// NOTE: Bundle ID uses "grit" (single I) for App Store continuity. Brand name is GRIIT (double I).
const PLAY_STORE_PACKAGE = (typeof process !== "undefined" && (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_PLAY_STORE_PACKAGE) || "app.grit.challenge_tracker";

/** App Store / Play Store URLs for share flows. Set EXPO_PUBLIC_APPLE_APP_ID when live. */
export const APP_STORE_URLS = {
  ios: (typeof process !== "undefined" && (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_APPLE_APP_ID)
    ? `https://apps.apple.com/app/id${(process.env as Record<string, string>).EXPO_PUBLIC_APPLE_APP_ID}`
    : APP_STORE_SEARCH_FALLBACK,
  android: `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`,
  default: DEEP_LINK_BASE_URL,
} as const;

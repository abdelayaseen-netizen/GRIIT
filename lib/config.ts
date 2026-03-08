/**
 * App config: deep link base URL and store URLs.
 * Swap DEEP_LINK_BASE_URL when production domain is ready.
 */
/** Base URL for deep links and web fallback. Set EXPO_PUBLIC_DEEP_LINK_BASE_URL to override. */
const DEEP_LINK_BASE_URL =
  (typeof process !== "undefined" && (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_DEEP_LINK_BASE_URL) ||
  "https://griit.app";

export { DEEP_LINK_BASE_URL };

/** App Store / Play Store URLs for share flows. Update iOS id when live. */
export const APP_STORE_URLS = {
  ios: "https://apps.apple.com/app/griit/idXXXXXX",
  android: "https://play.google.com/store/apps/details?id=app.grit.challenge_tracker",
  default: DEEP_LINK_BASE_URL,
} as const;

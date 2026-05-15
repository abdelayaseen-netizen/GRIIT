/**
 * App config: deep link base URL.
 * Swap DEEP_LINK_BASE_URL when production domain is ready.
 */
/** Base URL for deep links and web fallback. Set EXPO_PUBLIC_DEEP_LINK_BASE_URL to override. */
const DEEP_LINK_BASE_URL =
  (typeof process !== "undefined" && (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_DEEP_LINK_BASE_URL) ||
  "https://griit.app";

export { DEEP_LINK_BASE_URL };

/*
 * Image perf: react-native-fast-image is not a dependency; the app relies on expo-image and
 * React Native Image in places. If remote image decode shows up in profiling, evaluate FastImage
 * or heavier caching — not done in the clean-code pass to avoid new packages.
 */

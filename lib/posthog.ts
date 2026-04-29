/**
 * PostHog analytics client for React Native.
 * Uses the React Native PostHog SDK.
 * Set EXPO_PUBLIC_POSTHOG_API_KEY in env. Missing key = no crash, no tracking.
 */

import PostHog from "posthog-react-native";

const API_KEY = (process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "").trim();
const HOST = "https://us.i.posthog.com";

/** Single client instance; null when no API key (use with PostHogProvider when non-null). */
export const posthog: PostHog | null = API_KEY
  ? (() => {
      try {
        const client = new PostHog(API_KEY, { host: HOST });
        if (__DEV__) {
          console.log(
            "[PostHog] Initialized with key:",
            API_KEY.slice(0, 8) + "...",
            "host:",
            HOST
          );
        }
        return client;
      } catch {
        return null;
      }
    })()
  : null;

export function getPostHog(): PostHog | null {
  return posthog;
}

export function isPostHogEnabled(): boolean {
  return posthog !== null;
}

export function resetPostHog(): void {
  if (posthog) {
    try {
      posthog.reset();
    } catch {
      // ignore
    }
  }
}

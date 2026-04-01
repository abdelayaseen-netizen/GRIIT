/**
 * PostHog analytics client for React Native.
 * Uses the React Native PostHog SDK.
 * Set EXPO_PUBLIC_POSTHOG_API_KEY in env. Missing key = no crash, no tracking.
 */

import PostHog from "posthog-react-native";

const API_KEY = (process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "").trim();
const HOST = "https://us.i.posthog.com";

let client: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (!API_KEY) return null;
  if (!client) {
    try {
      client = new PostHog(API_KEY, { host: HOST });
    } catch {
      return null;
    }
  }
  return client;
}

export function isPostHogEnabled(): boolean {
  return !!API_KEY && client !== null;
}

export function resetPostHog(): void {
  if (client) {
    try {
      client.reset();
    } catch {
      // ignore
    }
  }
}

/**
 * PostHog analytics client. Uses posthog-js for Expo/React Native compatibility.
 * Set EXPO_PUBLIC_POSTHOG_API_KEY in env. Missing key = no crash, no tracking.
 */

import posthog from "posthog-js";

const API_KEY = (process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "").trim();
const HOST = "https://us.i.posthog.com";

let initialized = false;

export function getPostHog() {
  if (!API_KEY) return null;
  if (!initialized) {
    try {
      posthog.init(API_KEY, {
        ...({ host: HOST } as Record<string, unknown>),
        person_profiles: "identified_only",
      });
      initialized = true;
    } catch (err) {
      if (__DEV__) console.warn("[PostHog] init failed:", err);
      return null;
    }
  }
  return posthog;
}

export function isPostHogEnabled(): boolean {
  return !!API_KEY && initialized;
}

export function resetPostHog(): void {
  if (initialized) {
    try {
      posthog.reset();
    } catch {
      // ignore
    }
  }
}

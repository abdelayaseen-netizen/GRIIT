/**
 * App config: optional web deep-link base. griit.app is not ours — never default to it.
 */
import { facebookAppId as facebookAppIdFromEnv } from "@/lib/share-sticker";

export const APP_SCHEME = "griit";

function readDeepLinkBase(): string | null {
  const raw =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)?.EXPO_PUBLIC_DEEP_LINK_BASE_URL
      : undefined;
  const trimmed = (raw ?? "").trim().replace(/\/$/, "");
  if (!trimmed) return null;
  if (!/^https:\/\//i.test(trimmed)) return null;
  return trimmed;
}

/** https origin when EXPO_PUBLIC_DEEP_LINK_BASE_URL is set. Otherwise null. */
export const DEEP_LINK_BASE_URL = readDeepLinkBase();

/** Web origin for invite links. Null until a domain is set. Never griit.app. */
export const INVITE_BASE = DEEP_LINK_BASE_URL;

/** Meta App ID for Instagram Stories. Set EXPO_PUBLIC_FACEBOOK_APP_ID. Never a hardcoded id. */
export function facebookAppId(): string {
  return facebookAppIdFromEnv();
}

/*
 * Image perf: react-native-fast-image is not a dependency; the app relies on expo-image and
 * React Native Image in places. If remote image decode shows up in profiling, evaluate FastImage
 * or heavier caching — not done in the clean-code pass to avoid new packages.
 */

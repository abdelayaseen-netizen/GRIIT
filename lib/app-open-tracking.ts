/**
 * HAS_LAUNCHED read and last_app_open_at / recordOpen.
 * Callers fire these; they must not be awaited on the render path.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { trackAppOpened, trackColdStart, trackUserReturnedAfterLapse } from "@/lib/analytics";

export const LAST_APP_OPEN_AT_KEY = "griit:last_app_open_at";

export async function readHasLaunched(): Promise<boolean> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
  return v === "true";
}

export function daysSinceSignupFromCreatedAt(
  profileCreatedAt: string | null,
  nowMs = Date.now()
): number | undefined {
  if (!profileCreatedAt) return undefined;
  const createdAtMs = Date.parse(profileCreatedAt);
  if (Number.isNaN(createdAtMs)) return undefined;
  return Math.max(0, Math.floor((nowMs - createdAtMs) / (1000 * 60 * 60 * 24)));
}

export async function recordAppOpen(input: {
  profileCreatedAt: string | null;
  coldStartMs: number;
  trackColdStart: boolean;
}): Promise<void> {
  try {
    if (input.trackColdStart) {
      trackColdStart({ cold_start_ms: input.coldStartMs });
    }
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const daysSinceSignup = daysSinceSignupFromCreatedAt(input.profileCreatedAt, nowMs);
    const lastOpenRaw = await AsyncStorage.getItem(LAST_APP_OPEN_AT_KEY);
    if (lastOpenRaw) {
      const lastOpenMs = Date.parse(lastOpenRaw);
      if (!Number.isNaN(lastOpenMs)) {
        const lapseDays = Math.floor((nowMs - lastOpenMs) / (1000 * 60 * 60 * 24));
        if (lapseDays >= 3) {
          trackUserReturnedAfterLapse({ lapse_days: lapseDays, days_since_signup: daysSinceSignup });
        }
      }
    }
    trackAppOpened({ days_since_signup: daysSinceSignup });
    await AsyncStorage.setItem(LAST_APP_OPEN_AT_KEY, nowIso);
  } catch {
    // non-fatal
  }
}

/**
 * In-app review prompt. Ask after positive moments (7th day secured, challenge completed).
 * Throttled to once per 30 days. Never after failure (paywall dismiss, missed day).
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_STORAGE_KEY = "@griit/review_last_request";
const THROTTLE_DAYS = 30;

export type RequestReviewContext = {
  /** Current streak after this secure (e.g. 7 for 7th day). */
  streak?: number;
  /** True when user just completed a full challenge (day === totalDays). */
  challengeJustCompleted?: boolean;
};

/**
 * Call after 7th day secured or after completing a challenge. Shows native review dialog
 * at most once per 30 days. No-op on web or if StoreReview is unavailable.
 */
export async function requestReviewIfAppropriate(context: RequestReviewContext): Promise<void> {
  if (Platform.OS === "web") return;

  const shouldAsk = (context.streak === 7 && context.streak > 0) || context.challengeJustCompleted === true;
  if (!shouldAsk) return;

  try {
    const last = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
    if (last) {
      const lastTime = parseInt(last, 10);
      if (!Number.isNaN(lastTime) && Date.now() - lastTime < THROTTLE_DAYS * 24 * 60 * 60 * 1000) {
        return; // Within throttle window
      }
    }

    const { StoreReview } = await import("expo-store-review");
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_STORAGE_KEY, Date.now().toString());
  } catch {
    // Silently ignore (simulator may not support; or user dismissed)
  }
}

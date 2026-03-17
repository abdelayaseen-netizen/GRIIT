/**
 * In-app review prompt. Ask after positive moments (day secured, challenge completed, milestone).
 * Throttled to once per 30 days. Never after failure (paywall dismiss, missed day).
 */

import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { track } from "@/lib/analytics";

const REVIEW_PROMPT_KEY = "griit_last_review_prompt";
const MIN_DAYS_BETWEEN_PROMPTS = 30;
const MIN_DAYS_SECURED_BEFORE_PROMPT = 7;

export type ReviewTrigger = "day_secured" | "challenge_completed" | "milestone";

/**
 * Check if we should prompt for a review and do it if appropriate.
 * Call this after positive moments (day secured, challenge completed, milestone hit).
 *
 * Rules:
 * - User must have secured at least 7 days total
 * - At least 30 days since last prompt
 * - StoreReview must be available on platform
 */
export async function maybePromptForReview(
  totalDaysSecured: number,
  trigger: ReviewTrigger
): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    if (totalDaysSecured < MIN_DAYS_SECURED_BEFORE_PROMPT) return;

    const lastPrompt = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    if (lastPrompt) {
      const daysSince = (Date.now() - parseInt(lastPrompt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < MIN_DAYS_BETWEEN_PROMPTS) return;
    }

    track({ name: "review_prompted", total_days_secured: totalDaysSecured, trigger });
    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, Date.now().toString());
  } catch (error) {
    // error swallowed — handle in UI
  }
}

/**
 * Check if we should prompt on specific positive moments.
 */
export function shouldPromptOnMilestone(
  totalDaysSecured: number,
  milestoneDays: number
): boolean {
  const promptMilestones = [7, 30, 100];
  return (
    promptMilestones.includes(milestoneDays) &&
    totalDaysSecured >= MIN_DAYS_SECURED_BEFORE_PROMPT
  );
}

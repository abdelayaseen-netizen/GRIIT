import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";
import { parseTargetStreak } from "@/lib/onboarding-v2-target-streak-parse";

export { parseTargetStreak, TARGET_STREAK_MIN, TARGET_STREAK_MAX } from "@/lib/onboarding-v2-target-streak-parse";

export async function writeTargetStreak(userId: string, days: number): Promise<void> {
  const target = parseTargetStreak(days);
  if (target == null) return;
  try {
    await supabase
      .from("profiles")
      .update({ target_streak: target, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } catch (e) {
    captureError(e, "OnboardingV2WriteTargetStreak");
  }
}

export async function readTargetStreak(userId: string): Promise<number | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("target_streak")
      .eq("user_id", userId)
      .maybeSingle();
    const raw =
      data && typeof data === "object" ? (data as { target_streak?: unknown }).target_streak : null;
    return parseTargetStreak(raw);
  } catch (e) {
    captureError(e, "OnboardingV2ReadTargetStreak");
    return null;
  }
}

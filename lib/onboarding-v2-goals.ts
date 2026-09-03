import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";
import type { OnboardingGoal } from "@/store/onboardingStore";
import { mergeGoalsIntoAnswers, parseGoalsFromAnswers } from "@/lib/onboarding-v2-goals-core";

export { mergeGoalsIntoAnswers, parseGoalsFromAnswers } from "@/lib/onboarding-v2-goals-core";

export async function writeOnboardingGoals(userId: string, goals: OnboardingGoal[]): Promise<void> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_answers")
      .eq("user_id", userId)
      .maybeSingle();
    const existing =
      data && typeof data === "object" && "onboarding_answers" in data
        ? ((data as { onboarding_answers?: Record<string, unknown> | null }).onboarding_answers ?? {})
        : {};
    const merged = mergeGoalsIntoAnswers(
      existing && typeof existing === "object" ? existing : {},
      goals
    );
    await supabase
      .from("profiles")
      .update({ onboarding_answers: merged, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } catch (e) {
    captureError(e, "OnboardingV2WriteGoals");
  }
}

export async function readOnboardingGoals(userId: string): Promise<OnboardingGoal[]> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_answers")
      .eq("user_id", userId)
      .maybeSingle();
    const answers =
      data && typeof data === "object"
        ? (data as { onboarding_answers?: unknown }).onboarding_answers
        : null;
    return parseGoalsFromAnswers(answers);
  } catch (e) {
    captureError(e, "OnboardingV2ReadGoals");
    return [];
  }
}

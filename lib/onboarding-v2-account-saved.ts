import { GOAL_LABELS } from "@/lib/goal-challenge-map";
import { reminderTimeText, type ReminderCustom, type ReminderPresetId } from "@/lib/onboarding-v2-reminders";
import type { OnboardingGoal } from "@/store/onboardingStore";

export function accountSavedLines(input: {
  challengeTitle: string | null | undefined;
  targetStreak: number | null | undefined;
  remindersEnabled: boolean;
  reminderPreset: ReminderPresetId;
  reminderCustom: ReminderCustom | null;
  goals: readonly OnboardingGoal[];
}): string[] {
  const lines: string[] = [];
  const title = input.challengeTitle?.trim();
  if (title) lines.push(`${title}, joined`);
  if (input.targetStreak != null) lines.push(`${input.targetStreak} day target`);
  if (input.remindersEnabled) {
    lines.push(`Reminder at ${reminderTimeText(input.reminderPreset, input.reminderCustom)}`);
  }
  if (input.goals.length > 0) {
    lines.push(input.goals.map((g) => GOAL_LABELS[g]).join(", "));
  }
  return lines;
}

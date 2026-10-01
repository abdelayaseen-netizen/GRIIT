import { reminderTimeText, type ReminderCustom, type ReminderPresetId } from "@/lib/onboarding-v2-reminders";
import {
  accountSavedChallengeLine,
  accountSavedLineDays,
  accountSavedReminder,
} from "@/lib/onboarding-v42-copy";

export function accountSavedLines(input: {
  challengeTitle: string | null | undefined;
  durationDays?: number | null;
  targetStreak: number | null | undefined;
  remindersEnabled: boolean;
  reminderPreset: ReminderPresetId;
  reminderCustom: ReminderCustom | null;
}): string[] {
  const lines: string[] = [];
  const title = input.challengeTitle?.trim();
  const n = input.durationDays ?? input.targetStreak;
  if (title && n) lines.push(accountSavedChallengeLine(title, n));
  if (input.targetStreak != null) lines.push(accountSavedLineDays(input.targetStreak));
  if (input.remindersEnabled) {
    lines.push(accountSavedReminder(reminderTimeText(input.reminderPreset, input.reminderCustom)));
  }
  return lines;
}

import { reminderTimeText, type ReminderCustom, type ReminderPresetId } from "@/lib/onboarding-v2-reminders";

export type DayOneTask = {
  id?: string;
  title?: string | null;
  type?: string | null;
  task_type?: string | null;
  order_index?: number | null;
  photo_required?: boolean;
  require_photo_proof?: boolean;
  require_location?: boolean;
};

/** Map a challenge_tasks / API task row to the Day 1 proof chip. */
export function proofTypeLabel(task: DayOneTask): "PHOTO" | "GPS" | "TIMER" {
  const raw = `${task.type ?? ""} ${task.task_type ?? ""}`.toLowerCase();
  if (task.require_location || raw.includes("location") || raw.includes("gps") || raw.includes("run")) {
    return "GPS";
  }
  if (raw.includes("timer") || raw.includes("timed")) return "TIMER";
  return "PHOTO";
}

export function sortDayOneTasks(tasks: readonly DayOneTask[], limit = 3): DayOneTask[] {
  return [...tasks]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .slice(0, limit);
}

export function receiptChallengeLine(title: string | null | undefined): string {
  const t = title?.trim();
  return t ? t : "Your challenge";
}

export function receiptReminderLine(
  enabled: boolean,
  preset: ReminderPresetId,
  custom: ReminderCustom | null
): string {
  return enabled ? `Reminder at ${reminderTimeText(preset, custom)}` : "Reminders off";
}

export function receiptGoalsLine(count: number): string {
  const n = Number.isFinite(count) && count > 0 ? count : 0;
  return `${n} goals selected`;
}

export function circleLabel(invitedCount: number): string {
  if (invitedCount > 0) return `${invitedCount} invited`;
  return "Just you";
}

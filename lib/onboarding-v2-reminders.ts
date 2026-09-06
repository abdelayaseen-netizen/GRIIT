/**
 * Onboarding v2 reminder clock — pure formatters and presets.
 * Screens persist the chosen preset/custom; this module never touches I/O.
 */

export type ReminderPresetId = "am6" | "am8" | "pm12" | "pm7" | "custom";
export type ReminderMinute = "00" | "15" | "30" | "45";
export type ReminderMeridiem = "AM" | "PM";

export type ReminderCustom = {
  h: number;
  m: ReminderMinute;
  mer: ReminderMeridiem;
};

export const REMINDER_PRESETS: {
  id: Exclude<ReminderPresetId, "custom">;
  h: number;
  m: ReminderMinute;
  mer: ReminderMeridiem;
}[] = [
  { id: "am6", h: 6, m: "00", mer: "AM" },
  { id: "am8", h: 8, m: "00", mer: "AM" },
  { id: "pm12", h: 12, m: "00", mer: "PM" },
  { id: "pm7", h: 7, m: "00", mer: "PM" },
];

export const DEFAULT_CUSTOM_DRAFT: ReminderCustom = { h: 6, m: "30", mer: "AM" };

export function clampReminderHour(h: number): number {
  if (!Number.isFinite(h)) return 6;
  const n = Math.round(h);
  if (n < 1) return 1;
  if (n > 12) return 12;
  return n;
}

export function resolveReminderClock(
  preset: ReminderPresetId,
  custom: ReminderCustom | null
): ReminderCustom {
  if (preset === "custom" && custom) {
    return { h: clampReminderHour(custom.h), m: custom.m, mer: custom.mer };
  }
  const found = REMINDER_PRESETS.find((p) => p.id === preset);
  if (found) return { h: found.h, m: found.m, mer: found.mer };
  return { h: 6, m: "00", mer: "AM" };
}

/** Long form for receipt / Day 1: "6:00 AM", "6:45 AM". */
export function formatReminderTimeLong(clock: ReminderCustom): string {
  return `${clampReminderHour(clock.h)}:${clock.m} ${clock.mer}`;
}

/** Notification timestamp: drops :00 and lowercases meridiem — "6am", "6:45am". */
export function formatReminderTimeShort(clock: ReminderCustom): string {
  const h = clampReminderHour(clock.h);
  const mer = clock.mer.toLowerCase();
  if (clock.m === "00") return `${h}${mer}`;
  return `${h}:${clock.m}${mer}`;
}

export function reminderTimeText(
  preset: ReminderPresetId,
  custom: ReminderCustom | null
): string {
  return formatReminderTimeLong(resolveReminderClock(preset, custom));
}

export function reminderTimeShort(
  preset: ReminderPresetId,
  custom: ReminderCustom | null
): string {
  return formatReminderTimeShort(resolveReminderClock(preset, custom));
}

/** 24h "HH:MM" for the existing local scheduler. No new DB column. */
export function reminderTime24h(
  preset: ReminderPresetId,
  custom: ReminderCustom | null
): string {
  const clock = resolveReminderClock(preset, custom);
  let hour = clock.h % 12;
  if (clock.mer === "PM") hour += 12;
  return `${hour.toString().padStart(2, "0")}:${clock.m}`;
}

const MINUTES: ReminderMinute[] = ["00", "15", "30", "45"];

/** Inverse of `reminderTime24h` — map a stored "HH:MM" back onto the shared presets. */
export function parseReminderTime24h(hhmm: string): {
  preset: ReminderPresetId;
  custom: ReminderCustom | null;
} {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return { preset: "am6", custom: null };
  const hour24 = Number(m[1]);
  const rawMin = m[2] ?? "00";
  const minute: ReminderMinute = (MINUTES as readonly string[]).includes(rawMin)
    ? (rawMin as ReminderMinute)
    : "00";
  const mer: ReminderMeridiem = hour24 >= 12 ? "PM" : "AM";
  let h = hour24 % 12;
  if (h === 0) h = 12;
  const custom: ReminderCustom = { h, m: minute, mer };
  const match = REMINDER_PRESETS.find((p) => p.h === h && p.m === minute && p.mer === mer);
  if (match) return { preset: match.id, custom: null };
  return { preset: "custom", custom };
}

export function notificationBody(challengeName: string | null | undefined, taskCount: number): string {
  const name = challengeName?.trim() ? challengeName.trim() : "Day 1";
  const n = Number.isFinite(taskCount) && taskCount > 0 ? taskCount : 0;
  return `${name} isn't logged yet. ${n} tasks left.`;
}

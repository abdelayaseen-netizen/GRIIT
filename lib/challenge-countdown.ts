import { calendarDayFromStartAt } from "@/lib/home-day-total";

/** Calendar Day n for countdown copy. Null when start_at is missing — do not schedule. */
export function challengeCountdownFromStart(args: {
  startAt?: string | null;
  timeZone: string;
  todayKey: string;
  durationDays: number;
}): { day: number; daysLeft: number } | null {
  if (!args.startAt) return null;
  const day = calendarDayFromStartAt(
    args.startAt,
    args.timeZone,
    args.todayKey,
    args.durationDays,
  );
  const daysLeft = args.durationDays - day;
  if (daysLeft <= 0 || daysLeft > 5) return null;
  return { day, daysLeft };
}

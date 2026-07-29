/**
 * Schedule-window evaluation for task-states-v2 Ready / Capture chips.
 *
 * Algorithm mirrors server `assertHardModeScheduleWindow`
 * (`backend/lib/checkin-complete-gates.ts`) and client tile soft-lock
 * `getTileWindowState` (`app/challenge/active/[activeChallengeId].tsx`).
 * HH:mm start/end in the given IANA timezone (viewer TZ fallback).
 */

export type ScheduleWindowStatus = "in_window" | "out_of_window" | "none";

export type ScheduleWindowEvaluation = {
  status: ScheduleWindowStatus;
  /** Spec chip copy: "In window" | "Out of window". Null when no window configured. */
  chipLabel: "In window" | "Out of window" | null;
};

function minutesFromHHMM(hhmm: string): number | null {
  const parts = hhmm.split(":").map(Number);
  const h = parts[0];
  const m = parts[1];
  if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function currentMinutesInTimeZone(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(now);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return h * 60 + m;
}

/**
 * Evaluate whether `now` falls inside [start, end] (inclusive), supporting
 * overnight wrap (e.g. 22:00–02:00). Returns `none` when either bound is missing.
 */
export function evaluateScheduleWindow(opts: {
  start?: string | null;
  end?: string | null;
  timeZone?: string | null;
  now?: Date;
}): ScheduleWindowEvaluation {
  const start = typeof opts.start === "string" ? opts.start.trim() : "";
  const end = typeof opts.end === "string" ? opts.end.trim() : "";
  if (!start || !end) {
    return { status: "none", chipLabel: null };
  }

  const startMin = minutesFromHHMM(start);
  const endMin = minutesFromHHMM(end);
  if (startMin == null || endMin == null) {
    return { status: "none", chipLabel: null };
  }

  const tz =
    (typeof opts.timeZone === "string" && opts.timeZone.trim()) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";
  const now = opts.now ?? new Date();
  const current = currentMinutesInTimeZone(now, tz);

  let isOpen: boolean;
  if (startMin <= endMin) {
    isOpen = current >= startMin && current <= endMin;
  } else {
    isOpen = current >= startMin || current <= endMin;
  }

  return isOpen
    ? { status: "in_window", chipLabel: "In window" }
    : { status: "out_of_window", chipLabel: "Out of window" };
}

/** Format HH:mm bounds for gate row sublabel, e.g. "07:00 – 08:00". */
export function formatScheduleWindowRange(
  start?: string | null,
  end?: string | null
): string | null {
  const s = typeof start === "string" ? start.trim() : "";
  const e = typeof end === "string" ? end.trim() : "";
  if (!s || !e) return null;
  return `${s} – ${e}`;
}

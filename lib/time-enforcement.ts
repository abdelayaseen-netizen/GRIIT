import type { TimeEnforcementConfig } from "@/types";

export interface TimeWindow {
  start: Date;
  end: Date;
}

export type TimeWindowStatus = "before" | "active" | "missed";

export interface TimeWindowState {
  status: TimeWindowStatus;
  windowStart: Date;
  windowEnd: Date;
  minutesUntilOpen: number;
  minutesRemaining: number;
  formattedTimeLeft: string;
}

function parseHHMM(time: string): { hours: number; minutes: number } {
  const parts = time.split(":");
  const h = parts[0] ?? "0";
  const m = parts[1] ?? "0";
  return {
    hours: parseInt(h, 10) || 0,
    minutes: parseInt(m, 10) || 0,
  };
}

export function formatTimeHHMM(time: string): string {
  const { hours, minutes } = parseHHMM(time);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function computeTimeWindow(
  config: TimeEnforcementConfig,
  now: Date = new Date(),
  isHardMode: boolean = false
): TimeWindow | null {
  if (!config.timeEnforcementEnabled || !config.anchorTimeLocal) return null;

  const { hours, minutes } = parseHHMM(config.anchorTimeLocal);

  const anchor = new Date(now);
  anchor.setHours(hours, minutes, 0, 0);

  const useHardWindow =
    isHardMode &&
    config.hardWindowStartOffsetMin != null &&
    config.hardWindowEndOffsetMin != null;

  const startOffset = useHardWindow
    ? config.hardWindowStartOffsetMin!
    : config.windowStartOffsetMin ?? 0;
  const endOffset = useHardWindow
    ? config.hardWindowEndOffsetMin!
    : config.windowEndOffsetMin ?? 60;

  const start = new Date(anchor.getTime() + startOffset * 60000);
  const end = new Date(anchor.getTime() + endOffset * 60000);

  return { start, end };
}

export function getTimeWindowState(
  config: TimeEnforcementConfig,
  now: Date = new Date(),
  isHardMode: boolean = false
): TimeWindowState | null {
  const window = computeTimeWindow(config, now, isHardMode);
  if (!window) return null;

  const nowMs = now.getTime();
  const startMs = window.start.getTime();
  const endMs = window.end.getTime();

  let status: TimeWindowStatus;
  let minutesUntilOpen = 0;
  let minutesRemaining = 0;

  if (nowMs < startMs) {
    status = "before";
    minutesUntilOpen = Math.ceil((startMs - nowMs) / 60000);
  } else if (nowMs >= startMs && nowMs <= endMs) {
    status = "active";
    minutesRemaining = Math.ceil((endMs - nowMs) / 60000);
  } else {
    status = "missed";
  }

  let formattedTimeLeft = "";
  if (status === "before") {
    formattedTimeLeft = formatMinutesHuman(minutesUntilOpen);
  } else if (status === "active") {
    formattedTimeLeft = formatMinutesHuman(minutesRemaining);
  }

  return {
    status,
    windowStart: window.start,
    windowEnd: window.end,
    minutesUntilOpen,
    minutesRemaining,
    formattedTimeLeft,
  };
}

function formatMinutesHuman(mins: number): string {
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function computeWindowSummary(
  anchorTime: string,
  startOffset: number,
  endOffset: number
): string {
  const { hours, minutes } = parseHHMM(anchorTime);
  const anchorMs = hours * 3600000 + minutes * 60000;

  const startMs = anchorMs + startOffset * 60000;
  const endMs = anchorMs + endOffset * 60000;

  return `${msToTimeString(startMs)} – ${msToTimeString(endMs)}`;
}

function msToTimeString(ms: number): string {
  let totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 0) totalMinutes += 1440;
  if (totalMinutes >= 1440) totalMinutes -= 1440;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function validateTimeEnforcement(config: Partial<TimeEnforcementConfig>): {
  valid: boolean;
  error?: string;
} {
  if (!config.timeEnforcementEnabled) return { valid: true };

  if (!config.anchorTimeLocal || config.anchorTimeLocal.trim() === "") {
    return { valid: false, error: "Target time is required" };
  }

  const parts = config.anchorTimeLocal.split(":");
  if (parts.length !== 2) {
    return { valid: false, error: "Time must be in HH:mm format" };
  }
  const h = parseInt(parts[0] ?? "", 10);
  const m = parseInt(parts[1] ?? "", 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return { valid: false, error: "Invalid time value" };
  }

  if (config.windowStartOffsetMin == null || config.windowEndOffsetMin == null) {
    return { valid: false, error: "Window start and end offsets are required" };
  }

  if (config.windowEndOffsetMin <= config.windowStartOffsetMin) {
    return { valid: false, error: "Window end must be after window start" };
  }

  const windowLength = config.windowEndOffsetMin - config.windowStartOffsetMin;
  if (windowLength > 1440) {
    return { valid: false, error: "Window cannot exceed 24 hours" };
  }

  if (
    config.hardWindowStartOffsetMin != null &&
    config.hardWindowEndOffsetMin != null
  ) {
    if (config.hardWindowEndOffsetMin <= config.hardWindowStartOffsetMin) {
      return { valid: false, error: "Hard mode window end must be after start" };
    }
    if (
      config.hardWindowStartOffsetMin < config.windowStartOffsetMin ||
      config.hardWindowEndOffsetMin > config.windowEndOffsetMin
    ) {
      return {
        valid: false,
        error: "Hard mode window must be equal or stricter than normal window",
      };
    }
  }

  if (
    config.timezoneMode === "CHALLENGE_TIMEZONE" &&
    (!config.challengeTimezone || config.challengeTimezone.trim() === "")
  ) {
    return { valid: false, error: "Challenge timezone is required when locked" };
  }

  return { valid: true };
}

/**
 * Photo verification response shaper for checkins.complete.
 * Rows are facts the server actually evaluated — never client fiction.
 */

import type { VerificationRow } from "./verification-row";

export type PhotoVerificationRow = VerificationRow;

export type PhotoVerification = {
  rows: PhotoVerificationRow[];
};

export type ScheduleWindowEval = {
  hasWindow: boolean;
  passed: boolean;
  /** HH:MM (24h) of `now` in the task timezone. */
  checkedAtHHMM: string;
};

function minutesFromHHMM(hhmm: string): number | null {
  const parts = hhmm.split(":").map(Number);
  const h = parts[0];
  const m = parts[1];
  if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function currentMinutesInTimeZone(now: Date, timeZone: string): { minutes: number; hhmm: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(now);
  let h = parts.find((p) => p.type === "hour")?.value ?? "00";
  if (h === "24") h = "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  const hhmm = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  return { minutes: parseInt(h, 10) * 60 + parseInt(m, 10), hhmm };
}

/** Evaluate schedule window against server clock (same rules as assertHardModeScheduleWindow). */
export function evaluateScheduleWindowServer(opts: {
  start?: string | null;
  end?: string | null;
  timeZone?: string | null;
  now?: Date;
}): ScheduleWindowEval {
  const start = typeof opts.start === "string" ? opts.start.trim() : "";
  const end = typeof opts.end === "string" ? opts.end.trim() : "";
  const tz =
    (typeof opts.timeZone === "string" && opts.timeZone.trim()) || "UTC";
  const now = opts.now ?? new Date();
  const { minutes: current, hhmm } = currentMinutesInTimeZone(now, tz);

  if (!start || !end) {
    return { hasWindow: false, passed: true, checkedAtHHMM: hhmm };
  }

  const startMin = minutesFromHHMM(start);
  const endMin = minutesFromHHMM(end);
  if (startMin == null || endMin == null) {
    return { hasWindow: false, passed: true, checkedAtHHMM: hhmm };
  }

  let passed: boolean;
  if (startMin <= endMin) {
    passed = current >= startMin && current <= endMin;
  } else {
    passed = current >= startMin || current <= endMin;
  }

  return { hasWindow: true, passed, checkedAtHHMM: hhmm };
}

export function formatTakenWindowLabel(hhmm: string, inside: boolean): string {
  return inside
    ? `Taken ${hhmm} — inside the window`
    : `Taken ${hhmm} — outside the window`;
}

/**
 * Build photo verifying rows from server-evaluated facts.
 * - Time row only when a window was configured/evaluated.
 * - In-app row only when proof_payload_json.captured_in_app === true.
 */
export function buildPhotoVerification(opts: {
  window: ScheduleWindowEval;
  photoPresent: boolean;
  proofPayload?: { capturedAt: string; captured_in_app: boolean } | null;
}): PhotoVerification {
  const rows: PhotoVerificationRow[] = [];

  if (opts.window.hasWindow) {
    rows.push({
      key: "time_window",
      label: formatTakenWindowLabel(
        opts.window.checkedAtHHMM,
        opts.window.passed
      ),
      verified: opts.window.passed,
      role: "check",
    });
  }

  // Client-claimed in-app capture — no server signal validates it. Record, not a check.
  if (opts.proofPayload?.captured_in_app === true && opts.photoPresent) {
    rows.push({
      key: "camera_in_app",
      label: "Shot in-app, not from the library",
      verified: true,
      role: "record",
    });
  }

  return { rows };
}

/** Verbatim confirmation lines — README §6. */

export function verificationLine(args: {
  kind: "photo" | "timer" | "run" | "workout" | "journal" | "counter" | "water" | "reading" | "checkin" | "manual" | "simple";
  timeLabel?: string;
  durationLabel?: string;
  startedAtLabel?: string;
  distanceLabel?: string;
  words?: number;
  gpsMeters?: number;
  accuracyM?: number;
}): string {
  switch (args.kind) {
    case "photo":
      return `Captured live in the app · ${args.timeLabel ?? ""}`.trim();
    case "timer":
      return `Timer ran ${args.durationLabel ?? ""} · started ${args.startedAtLabel ?? ""}`.trim();
    case "run":
      return `Photo captured live · ${args.distanceLabel ?? ""} and ${args.durationLabel ?? ""} self-entered`;
    case "workout":
      return `Photo captured live · ${args.durationLabel ?? ""} self-entered`;
    case "journal":
      return `Word count met · ${args.words ?? 0} words`;
    case "counter":
    case "water":
    case "reading":
      return "Self-entered count · nothing was checked";
    case "checkin":
      return `GPS ${args.gpsMeters ?? 0} m from the saved location · ±${args.accuracyM ?? 0} m accuracy`;
    default:
      return "Nothing was checked. You said you did it.";
  }
}

export function failedUploadCopy(): { eyebrow: string; headline: string; body: string; retryNote: string } {
  return {
    eyebrow: "NOT POSTED",
    headline: "Upload didn't go through",
    body: "Your photo is saved on this device. The day is not secured yet. Retry when you have signal — the capture keeps its original timestamp.",
    retryNote: "Retry will secure today's date, not the capture date.",
  };
}

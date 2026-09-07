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

export type FailureScreenCopy = {
  kind: "upload" | "validation";
  eyebrow: string;
  headline: string;
  body: string;
  retryNote?: string;
  primaryLabel: string;
  primaryAction: "retry" | "back";
};

export function failureErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const code = (err as { data?: { code?: unknown } }).data?.code;
  return typeof code === "string" ? code : undefined;
}

/** Failure UI. Never claims a saved photo unless `hasLocalPhoto` is true. */
export function failureScreenCopy(args: {
  errorCode?: string | null;
  message?: string | null;
  hasLocalPhoto: boolean;
}): FailureScreenCopy {
  if (args.errorCode === "BAD_REQUEST") {
    const message = args.message?.trim();
    return {
      kind: "validation",
      eyebrow: "NOT POSTED",
      headline: "Couldn't post",
      body: message || "This task could not be completed.",
      primaryLabel: "Go back",
      primaryAction: "back",
    };
  }
  if (args.hasLocalPhoto) {
    const upload = failedUploadCopy();
    return {
      kind: "upload",
      ...upload,
      primaryLabel: "Retry now",
      primaryAction: "retry",
    };
  }
  return {
    kind: "upload",
    eyebrow: "NOT POSTED",
    headline: "Upload didn't go through",
    body: args.message?.trim() || "The day is not secured yet. Try again when you have signal.",
    primaryLabel: "Retry now",
    primaryAction: "retry",
  };
}

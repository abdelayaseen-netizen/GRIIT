/**
 * Pure utility functions for the task-completion flow.
 *
 * Extracted from components/task/VerifyingOverlay.tsx so they can be
 * imported and tested in a Node environment without pulling in React Native.
 *
 * Honest-cut rule: rows in the Verifying overlay are populated ONLY from
 * gates that are actually evaluated client-side. "motion", "presence",
 * "liveness", "GPS route", and "distance" are never shown — they are not
 * evaluated. Tests in tests/flows/task-flow.test.ts assert this invariant.
 */

export type VerifyingRow = {
  /** Short label e.g. "Within time window" */
  label: string;
  /** Contextual detail e.g. "07:42" or "not from library" */
  detail?: string;
};

/**
 * Build the row list for the VerifyingOverlay from gate flags that were
 * actually evaluated client-side. Gates absent from config produce no row.
 */
export function buildVerifyingRows(opts: {
  hasTimeWindow: boolean;
  submitTimeLabel: string;
  hasCameraOnly: boolean;
  hasLocation: boolean;
}): VerifyingRow[] {
  const rows: VerifyingRow[] = [];
  if (opts.hasTimeWindow) {
    rows.push({ label: "Within time window", detail: opts.submitTimeLabel });
  }
  if (opts.hasCameraOnly) {
    rows.push({ label: "Live camera", detail: "not from library" });
  }
  if (opts.hasLocation) {
    rows.push({ label: "On location" });
  }
  return rows;
}

/** Per-type success line shown at the bottom of the VerifyingOverlay card. */
export function getTypeSuccessLine(taskTypeRaw: string): string {
  switch (taskTypeRaw) {
    case "photo":
      return "Photo proof submitted";
    case "timer":
      return "Session time recorded";
    case "run":
      return "Run entry submitted";
    case "workout":
      return "Workout logged";
    case "journal":
      return "Journal entry saved";
    case "counter":
      return "Daily target recorded";
    case "water":
      return "Daily water logged";
    case "reading":
      return "Reading pages logged";
    case "checkin":
      return "Location confirmed";
    default:
      return "Task completed";
  }
}

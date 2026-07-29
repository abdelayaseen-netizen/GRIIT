/**
 * Gate rows + subtype + helper for Journal · Ready (task-states-v2).
 * Only gates that apply from real task config — honest cut. No camera.
 */
import { formatScheduleWindowRange } from "@/lib/schedule-window";

export type JournalReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const JOURNAL_READY_HELPER = "No camera — words only." as const;

export const JOURNAL_READY_SUBTYPE_FALLBACK = "Journal" as const;

/**
 * Header subtype: subtype → label → unit_label → "Journal".
 */
export function resolveJournalReadySubtype(config: {
  subtype?: string | null;
  label?: string | null;
  unit_label?: string | null;
}): string {
  for (const key of ["subtype", "label", "unit_label"] as const) {
    const v = config[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return JOURNAL_READY_SUBTYPE_FALLBACK;
}

/** Word-floor gate label — real min_words only. */
export function formatJournalWordFloorLabel(minWords: number): string {
  const n = Math.max(1, Math.round(minWords));
  return `${n} words · Minimum length`;
}

export function buildJournalReadyGates(config: {
  schedule_window_start?: string | null;
  schedule_window_end?: string | null;
  min_words?: number | null;
}): JournalReadyGateData[] {
  const gates: JournalReadyGateData[] = [];

  const range = formatScheduleWindowRange(
    config.schedule_window_start,
    config.schedule_window_end
  );
  if (range) {
    gates.push({
      key: "time",
      label: "Time window",
      sublabel: range,
    });
  }

  const floor =
    typeof config.min_words === "number" && config.min_words > 0
      ? Math.round(config.min_words)
      : 0;
  if (floor > 0) {
    gates.push({
      key: "word_floor",
      label: formatJournalWordFloorLabel(floor),
    });
  }

  return gates;
}

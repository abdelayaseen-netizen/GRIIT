/**
 * Journal verification response shaper for checkins.complete.
 * Facts persist in verification_gates.journal_log (not proof_payload_json).
 * No camera rows — journal is words-only.
 */

import type { ScheduleWindowEval } from "./photo-verification";
import type { VerificationRow } from "./verification-row";

export type JournalVerificationRow = VerificationRow;

export type JournalVerification = {
  rows: JournalVerificationRow[];
};

export type JournalLogFacts = {
  word_count: number;
  /** null when no word floor was configured. */
  floor_min: number | null;
};

export function formatSavedWindowLabel(hhmm: string, inside: boolean): string {
  return inside
    ? `Saved ${hhmm} — inside the window`
    : `Saved ${hhmm} — outside the window`;
}

/**
 * Word-count row copy:
 * - floor > 0 → "{n} words · {floor} word floor" (names the floor; does not claim it was met)
 * - no floor → "{n} words"
 */
export function formatJournalWordLabel(log: JournalLogFacts): string {
  const n = Math.max(0, Math.round(log.word_count));
  const floor =
    typeof log.floor_min === "number" && log.floor_min > 0
      ? Math.round(log.floor_min)
      : null;
  if (floor != null) {
    return `${n} words · ${floor} word floor`;
  }
  return `${n} words`;
}

export function formatJournalSecuredMeta(wordCount: number): string {
  const n = Math.max(0, Math.round(wordCount));
  return `${n} words`;
}

export function buildJournalVerification(opts: {
  window: ScheduleWindowEval;
  journalLog?: JournalLogFacts | null;
}): JournalVerification {
  const rows: JournalVerificationRow[] = [];

  if (opts.window.hasWindow) {
    rows.push({
      key: "time_window",
      label: formatSavedWindowLabel(
        opts.window.checkedAtHHMM,
        opts.window.passed
      ),
      verified: opts.window.passed,
      role: "check",
    });
  }

  if (
    opts.journalLog &&
    Number.isFinite(opts.journalLog.word_count) &&
    opts.journalLog.word_count >= 0
  ) {
    rows.push({
      key: "word_count",
      label: formatJournalWordLabel(opts.journalLog),
      verified: true,
      role: "record",
    });
  }

  return { rows };
}

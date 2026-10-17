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

/** A word has at least this many letters. Punctuation-only tokens count as 0. */
export const JOURNAL_WORD_MIN_LETTERS = 2;
/** The same word counts at most this many times per entry, case-insensitive. */
export const JOURNAL_WORD_REPEAT_CAP = 3;
/** One-letter words that still count ("I went to a park" is 5 words). */
export const JOURNAL_ONE_LETTER_WORDS: ReadonlySet<string> = new Set(["i", "a"]);

const LETTER_RE = /\p{L}/gu;
const NON_LETTER_EDGE_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/**
 * The one journal word rule. The client (`lib/task-flow-state.ts` wordCount)
 * and `checkins.complete` both call this, so the server rejects what the client rejects.
 */
export function countJournalWords(text: string): number {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return 0;
  const seen = new Map<string, number>();
  let total = 0;
  for (const token of trimmed.split(/\s+/)) {
    const letters = token.match(LETTER_RE);
    if (!letters) continue;
    const key = token.replace(NON_LETTER_EDGE_RE, "").toLowerCase();
    if (letters.length < JOURNAL_WORD_MIN_LETTERS && !JOURNAL_ONE_LETTER_WORDS.has(key)) continue;
    const used = seen.get(key) ?? 0;
    if (used >= JOURNAL_WORD_REPEAT_CAP) continue;
    seen.set(key, used + 1);
    total += 1;
  }
  return total;
}

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

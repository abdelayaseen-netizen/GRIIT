export const WRITE_PLACEHOLDER = "Write here";
export const WRITE_WORDS_LABEL = "Words";
export const WRITE_FOOTER_CAPTION = "Nothing is secured until the server says so.";

export function writeStepHeader(day: number): string {
  return `Day ${day} · Write`;
}

export function writeHonestyLine(target: number): string {
  return `${target} words. Counted, not read.`;
}

export function writeCounterLabel(written: number, target: number): string {
  return `${written} of ${target}`;
}

export function writeCounterMet(written: number, target: number): boolean {
  return written >= target;
}

/** Fill 0–1; stays at 1 once the target is met so extra words still count in the label. */
export function writeCounterFill(written: number, target: number): number {
  if (target <= 0) return written > 0 ? 1 : 0;
  return Math.min(1, written / target);
}

export function writeCtaLabel(written: number, target: number): string {
  const remaining = target - written;
  if (remaining <= 0) return "Post";
  if (remaining === 1) return "Write 1 more word";
  return `Write ${remaining} more words`;
}

export function writeCtaEnabled(written: number, target: number): boolean {
  return writeCounterMet(written, target);
}

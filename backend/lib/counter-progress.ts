/**
 * Counter progress upsert rules (task-states-v2).
 * Absolute value, count-up only within a day — stale lower writes no-op.
 */

export type CounterProgressDecision =
  | { action: "reject_completed"; storedValue: number | null }
  | { action: "noop_stale"; storedValue: number }
  | { action: "write"; nextValue: number };

/**
 * Decide whether an incoming absolute count may update a pending row.
 * - completed → reject (no further saveProgress)
 * - incoming < stored → noop (stale / delayed write)
 * - else → write
 */
export function decideCounterProgressWrite(opts: {
  existingStatus: string | null | undefined;
  existingValue: number | null | undefined;
  incomingValue: number;
}): CounterProgressDecision {
  const incoming = Math.max(0, opts.incomingValue);
  if (opts.existingStatus === "completed") {
    return {
      action: "reject_completed",
      storedValue:
        typeof opts.existingValue === "number" ? opts.existingValue : null,
    };
  }
  const stored =
    typeof opts.existingValue === "number" && Number.isFinite(opts.existingValue)
      ? opts.existingValue
      : 0;
  if (incoming < stored) {
    return { action: "noop_stale", storedValue: stored };
  }
  return { action: "write", nextValue: incoming };
}

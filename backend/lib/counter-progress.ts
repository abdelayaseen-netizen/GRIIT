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

/** Build 92 03.5: one log of a day that adds up (a run's distance, a count). */
export type PartialLogIn = {
  distance_km?: number;
  duration_min?: number;
  entry_mode?: string;
};

export type PartialLogDecision =
  | { action: "reject_completed"; storedValue: number | null }
  | { action: "write"; nextValue: number; payload: Record<string, unknown> & { partial_logs: unknown[] } };

/**
 * Add mode: the incoming value joins today's pending total and the log is appended to
 * `proof_payload_json.partial_logs`. A completed row rejects. Nothing is stale here — a
 * smaller second log still adds. Other keys on the payload are kept.
 */
export function decidePartialLogWrite(opts: {
  existingStatus: string | null | undefined;
  existingValue: number | null | undefined;
  existingPayload: unknown;
  incomingValue: number;
  log: PartialLogIn;
  at: string;
}): PartialLogDecision {
  const incoming = Math.max(0, opts.incomingValue);
  if (opts.existingStatus === "completed") {
    return {
      action: "reject_completed",
      storedValue: typeof opts.existingValue === "number" ? opts.existingValue : null,
    };
  }
  const stored =
    typeof opts.existingValue === "number" && Number.isFinite(opts.existingValue) ? opts.existingValue : 0;
  const base =
    opts.existingPayload && typeof opts.existingPayload === "object" && !Array.isArray(opts.existingPayload)
      ? (opts.existingPayload as Record<string, unknown>)
      : {};
  const prior = Array.isArray(base.partial_logs) ? base.partial_logs : [];
  const entry: Record<string, unknown> = { value: incoming, at: opts.at };
  if (typeof opts.log.distance_km === "number") entry.distance_km = opts.log.distance_km;
  if (typeof opts.log.duration_min === "number") entry.duration_min = opts.log.duration_min;
  if (typeof opts.log.entry_mode === "string") entry.entry_mode = opts.log.entry_mode;
  return {
    action: "write",
    nextValue: Math.round((stored + incoming) * 1000) / 1000,
    payload: { ...base, partial_logs: [...prior, entry] },
  };
}

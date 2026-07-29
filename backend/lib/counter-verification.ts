/**
 * Counter verification response shaper for checkins.complete.
 * Facts persist in verification_gates.counter_log.
 */

export type CounterVerificationRow = {
  key: string;
  label: string;
  verified: boolean;
};

export type CounterVerification = {
  rows: CounterVerificationRow[];
};

export type CounterLogFacts = {
  count: number;
  target: number;
  unit_plural: string;
};

export const COUNTED_BEFORE_MIDNIGHT_LABEL =
  "Counted before midnight reset" as const;

export function formatCounterTargetMetLabel(log: CounterLogFacts): string {
  const n = Math.max(0, Math.round(log.count));
  const t = Math.max(0, Math.round(log.target));
  const unit = log.unit_plural.trim() || "units";
  return `${n} of ${t} ${unit} · target met`;
}

export function formatCounterSecuredMeta(log: CounterLogFacts): string {
  const n = Math.max(0, Math.round(log.count));
  const t = Math.max(0, Math.round(log.target));
  const unit = log.unit_plural.trim() || "units";
  return `${n} of ${t} ${unit}`;
}

export function buildCounterVerification(opts: {
  counterLog?: CounterLogFacts | null;
}): CounterVerification {
  const rows: CounterVerificationRow[] = [
    {
      key: "midnight",
      label: COUNTED_BEFORE_MIDNIGHT_LABEL,
      verified: true,
    },
  ];

  if (
    opts.counterLog &&
    Number.isFinite(opts.counterLog.count) &&
    Number.isFinite(opts.counterLog.target) &&
    opts.counterLog.target > 0
  ) {
    rows.push({
      key: "target",
      label: formatCounterTargetMetLabel(opts.counterLog),
      verified: opts.counterLog.count >= opts.counterLog.target,
    });
  }

  return { rows };
}

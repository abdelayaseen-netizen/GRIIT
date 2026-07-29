/**
 * Gate rows + subtype + helper for Counter/Water/Reading · Ready (task-states-v2).
 * No time-window gate — counters are all-day / midnight-reset types.
 */

export type CounterReadyGateData = {
  key: string;
  label: string;
  sublabel?: string;
};

export const COUNTER_READY_SUBTYPE_FALLBACK = "Counter" as const;

export const COUNTER_READY_HELPER =
  "Tap up to your daily target." as const;

export const READING_READY_HELPER =
  "Reading adds an optional page photo." as const;

export const COUNTER_ALL_DAY_GATE_LABEL =
  "All day · Resets at midnight" as const;

/**
 * Header subtype: subtype → label → unit_label → variant fallback.
 */
export function resolveCounterReadySubtype(
  config: {
    subtype?: string | null;
    label?: string | null;
    unit_label?: string | null;
  },
  variant: "counter" | "water" | "reading"
): string {
  for (const key of ["subtype", "label", "unit_label"] as const) {
    const v = config[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  if (variant === "water") return "Water";
  if (variant === "reading") return "Reading";
  return COUNTER_READY_SUBTYPE_FALLBACK;
}

export function counterUnitPlural(variant: "counter" | "water" | "reading"): string {
  if (variant === "water") return "cups";
  if (variant === "reading") return "pages";
  return "units";
}

export function formatCounterTargetGateLabel(
  target: number,
  unitPlural: string
): string {
  const n = Math.max(1, Math.round(target));
  return `Target · ${n} ${unitPlural} · Tap each one`;
}

export function buildCounterReadyGates(opts: {
  target: number;
  variant: "counter" | "water" | "reading";
}): CounterReadyGateData[] {
  const gates: CounterReadyGateData[] = [
    {
      key: "all_day",
      label: COUNTER_ALL_DAY_GATE_LABEL,
    },
  ];

  const target =
    typeof opts.target === "number" && opts.target > 0
      ? Math.round(opts.target)
      : 0;
  if (target > 0) {
    gates.push({
      key: "target",
      label: formatCounterTargetGateLabel(
        target,
        counterUnitPlural(opts.variant)
      ),
    });
  }

  return gates;
}

export function counterReadyHelper(
  variant: "counter" | "water" | "reading"
): string {
  return variant === "reading" ? READING_READY_HELPER : COUNTER_READY_HELPER;
}

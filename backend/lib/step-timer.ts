/**
 * Build 90 01b.1: per-step wall-clock timing for a request. Each awaited Supabase /
 * storage / RPC call is wrapped in `step(name, fn)`; `finish()` returns the map for one
 * log line. A repeated name gets `#2`, `#3`. `gapMs` is the time no step covered
 * (CPU, serialisation), so steps + gap = total.
 */
export type StepTimer = {
  /** PromiseLike so a Supabase query builder (a thenable) can be passed as is. */
  step<T>(name: string, run: () => PromiseLike<T>): Promise<T>;
  finish(): { steps: Record<string, number>; totalMs: number; gapMs: number };
};

export function createStepTimer(now: () => number = () => Date.now()): StepTimer {
  const startedAt = now();
  const steps: Record<string, number> = {};
  const seen = new Map<string, number>();
  let covered = 0;
  const key = (name: string) => {
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    return n === 1 ? name : `${name}#${n}`;
  };
  return {
    async step(name, run) {
      const k = key(name);
      const t0 = now();
      try {
        return await run();
      } finally {
        const ms = now() - t0;
        steps[k] = ms;
        covered += ms;
      }
    },
    finish() {
      const totalMs = now() - startedAt;
      return { steps, totalMs, gapMs: Math.max(0, totalMs - covered) };
    },
  };
}

export function medianMs(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const hi = sorted[mid] ?? 0;
  const lo = sorted[mid - 1] ?? hi;
  return sorted.length % 2 ? hi : (lo + hi) / 2;
}

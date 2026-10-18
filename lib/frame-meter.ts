// Build 92 chunk 07.1 · JS frame-time meter for the scroll-freeze gate (dev harness only).
import { useCallback, useEffect, useRef, useState } from "react";

export const FRAME_BUDGET_MS = 50;

export type FrameSummary = {
  frames: number;
  maxMs: number;
  over50: number;
  avgMs: number;
};

/** Summarises requestAnimationFrame deltas (ms). Pure, unit-tested. */
export function summarizeFrames(deltas: readonly number[], budgetMs = FRAME_BUDGET_MS): FrameSummary {
  if (deltas.length === 0) return { frames: 0, maxMs: 0, over50: 0, avgMs: 0 };
  let max = 0;
  let over = 0;
  let sum = 0;
  for (const d of deltas) {
    if (d > max) max = d;
    if (d > budgetMs) over += 1;
    sum += d;
  }
  return {
    frames: deltas.length,
    maxMs: Math.round(max * 10) / 10,
    over50: over,
    avgMs: Math.round((sum / deltas.length) * 10) / 10,
  };
}

export function frameSummaryLine(s: FrameSummary): string {
  return `${s.frames} frames · max ${s.maxMs} ms · ${s.over50} over ${FRAME_BUDGET_MS} ms · avg ${s.avgMs} ms`;
}

/** Records rAF deltas for `durationMs` after `start()`; `summary` is set when the window ends. */
export function useFrameMeter(durationMs = 10_000) {
  const [summary, setSummary] = useState<FrameSummary | null>(null);
  const [running, setRunning] = useState(false);
  const deltas = useRef<number[]>([]);
  const raf = useRef<number | null>(null);

  const start = useCallback(() => {
    deltas.current = [];
    setSummary(null);
    setRunning(true);
    // The tap that starts the meter re-renders the screen; the window opens after that frame settles
    // so the numbers measure the scroll, not the button press.
    const begin = () => {
    const t0 = Date.now();
    let last = t0;
    const tick = () => {
      const now = Date.now();
      deltas.current.push(now - last);
      last = now;
      if (now - t0 >= durationMs) {
        setSummary(summarizeFrames(deltas.current));
        setRunning(false);
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    };
    setTimeout(begin, 300);
  }, [durationMs]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return { start, running, summary };
}

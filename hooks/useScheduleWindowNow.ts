/**
 * Live clock for schedule-window evaluation — same 30s tick GatesCard used.
 * Own the tick in one place and pass `now` into GatesCard so Ready CTA + chip
 * share one eval loop (no second polling hack).
 */
import { useEffect, useState } from "react";

export function useScheduleWindowNow(opts?: {
  /** When false, freeze at mount time (no interval). */
  enabled?: boolean;
  /** Injectable clock for tests / controlled parents. */
  now?: Date;
}): Date {
  const enabled = opts?.enabled !== false;
  const nowProp = opts?.now;
  const [tickNow, setTickNow] = useState(() => nowProp ?? new Date());

  useEffect(() => {
    if (nowProp) {
      setTickNow(nowProp);
      return;
    }
    if (!enabled) return;
    const id = setInterval(() => setTickNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [nowProp, enabled]);

  return tickNow;
}

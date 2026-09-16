import { useCallback, useEffect, useState } from "react";

export const RESEND_LOCK_MS = 60_000;

export function resendSecondsLeft(
  startedAt: number | null,
  now: number,
  lockMs = RESEND_LOCK_MS
): number {
  if (startedAt == null) return 0;
  return Math.max(0, Math.ceil((startedAt + lockMs - now) / 1000));
}

export function resendIsLocked(secondsLeft: number): boolean {
  return secondsLeft > 0;
}

export function useResendCountdown(lockMs = RESEND_LOCK_MS) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const start = useCallback(() => {
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
  }, []);

  useEffect(() => {
    if (startedAt == null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const secondsLeft = resendSecondsLeft(startedAt, now, lockMs);
  return { secondsLeft, locked: resendIsLocked(secondsLeft), start };
}

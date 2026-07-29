/**
 * Counter tap → checkins.saveProgress (absolute value).
 * Optimistic local count; on failure keep local + "not saved yet"; retry on next tap / AppState active.
 * Hydration: server pending value wins over local zero (caller sets initial from todayCheckins).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";

const DEBOUNCE_MS = 300;

export type UseCounterProgressArgs = {
  activeChallengeId: string;
  taskId: string;
  enabled: boolean;
  /** Hydrated from todayCheckins pending value — server wins. */
  initialValue: number;
};

export type UseCounterProgressReturn = {
  count: number;
  setCountOptimistic: (next: number) => void;
  /** True when last saveProgress failed or a write is still pending ack. */
  notSavedYet: boolean;
  flush: () => Promise<void>;
};

export function useCounterProgress({
  activeChallengeId,
  taskId,
  enabled,
  initialValue,
}: UseCounterProgressArgs): UseCounterProgressReturn {
  const [count, setCount] = useState(initialValue);
  const [notSavedYet, setNotSavedYet] = useState(false);
  const countRef = useRef(count);
  const lastAckedRef = useRef(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  // Server hydration wins when initialValue changes (mount / refetch).
  useEffect(() => {
    setCount(initialValue);
    countRef.current = initialValue;
    lastAckedRef.current = initialValue;
    setNotSavedYet(false);
  }, [initialValue]);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const persist = useCallback(async () => {
    if (!enabled || !activeChallengeId || !taskId) return;
    const value = countRef.current;
    if (value === lastAckedRef.current && !notSavedYet) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const result = await trpcMutate<{
        value?: number;
        stale?: boolean;
      }>(TRPC.checkins.saveProgress, {
        activeChallengeId,
        taskId,
        value,
      });
      const serverValue =
        typeof result?.value === "number" ? result.value : value;
      // Stale no-op returns higher stored — adopt server (count-up truth).
      if (result?.stale && serverValue > countRef.current) {
        setCount(serverValue);
        countRef.current = serverValue;
      }
      lastAckedRef.current = serverValue;
      setNotSavedYet(false);
    } catch (err) {
      captureError(err, "CounterSaveProgress");
      setNotSavedYet(true);
    } finally {
      inFlightRef.current = false;
      // If user tapped again while in flight, schedule another write.
      if (countRef.current !== lastAckedRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          void persist();
        }, DEBOUNCE_MS);
      }
    }
  }, [enabled, activeChallengeId, taskId, notSavedYet]);

  const schedulePersist = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void persist();
    }, DEBOUNCE_MS);
  }, [enabled, persist]);

  const setCountOptimistic = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.round(next));
      // Count-up only for persisted taps — ignore local decrements for v2.
      if (n < countRef.current) return;
      setCount(n);
      countRef.current = n;
      schedulePersist();
    },
    [schedulePersist]
  );

  const flush = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await persist();
  }, [persist]);

  // Retry on foreground when last write failed.
  useEffect(() => {
    if (!enabled) return;
    const onChange = (state: AppStateStatus) => {
      if (state === "active" && notSavedYet) {
        void persist();
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [enabled, notSavedYet, persist]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { count, setCountOptimistic, notSavedYet, flush };
}

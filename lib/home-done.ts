/**
 * Build 92 10.3 (P3-17, P3-18): Home when today is secured, and save errors that give the real
 * reason. A retry is offered only when one can work (a closed window can't be retried today).
 */
import { OPTIMISTIC_SAVE_ERROR } from "@/lib/optimistic-home";
import { isWindowClosedError } from "@/lib/task-flow-window";
import { isOfflineError } from "@/lib/finish-flow";

export const HOME_DONE = {
  line: "Today is secured. See you tomorrow.",
  fold: (n: number) => `${n} done`,
  show: "Show",
} as const;

export function homeSaveError(rawMessage: string, closedAt?: string | null): { message: string; retry: boolean } {
  const msg = rawMessage ?? "";
  if (isWindowClosedError(msg)) {
    const at = (closedAt ?? "").trim();
    return {
      message: at ? `This task’s window closed at ${at}. It opens tomorrow.` : "This task’s window closed. It opens tomorrow.",
      retry: false,
    };
  }
  if (isOfflineError(msg)) return { message: "Couldn’t save. No connection. Try again", retry: true };
  return { message: OPTIMISTIC_SAVE_ERROR, retry: true };
}

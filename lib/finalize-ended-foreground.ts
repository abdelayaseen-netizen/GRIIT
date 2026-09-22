import { queryClient } from "@/lib/query-client";
import { homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
import { captureError } from "@/lib/sentry";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { shouldPresentEndScreen, type UnseenEndingRow } from "@/lib/challenge-end";

let inFlight = false;

export async function runFinalizeEndedOnForeground(input: {
  userId: string;
  pathname: string;
  openEnd: () => void;
}): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    await trpcMutate(TRPC.challenges.finalizeEnded);
    await queryClient.invalidateQueries({ queryKey: homeBootstrapQueryKey(input.userId) });
    if (!shouldPresentEndScreen(input.pathname)) return;
    const unseen = await trpcQuery<UnseenEndingRow[]>(TRPC.challenges.listUnseenEndings);
    if (unseen.length > 0) input.openEnd();
  } catch (e) {
    captureError(e, "finalizeEnded.foreground");
  } finally {
    inFlight = false;
  }
}

type ForegroundFn = () => void;
let registered: ForegroundFn | null = null;

export function setFinalizeEndedForegroundHandler(fn: ForegroundFn | null): void {
  registered = fn;
}

export function notifyAppBecameActive(): void {
  registered?.();
}

import { queryClient } from "@/lib/query-client";
import { captureError } from "@/lib/sentry";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { shouldPresentEndScreen, type UnseenEndingRow } from "@/lib/challenge-end";
import { refreshHomeBootstrap } from "@/lib/home-bootstrap-refresh";

let inFlight = false;
/** Build 90 04.7: a run that happened away from Home owes one unseen-endings check on arrival. */
let homeCheckPending = false;

async function presentUnseenEndings(openEnd: () => void): Promise<void> {
  const unseen = await trpcQuery<UnseenEndingRow[]>(TRPC.challenges.listUnseenEndings);
  if (unseen.length > 0) openEnd();
}

export async function runFinalizeEndedOnForeground(input: {
  userId: string;
  pathname: string;
  openEnd: () => void;
}): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    try {
      await trpcMutate(TRPC.challenges.finalizeEnded);
      // Build 90 01b.3: skip when bootstrap just loaded (guest start, sign-in, join).
      await refreshHomeBootstrap(queryClient, { freshAfter: Date.now() - 10_000 });
    } catch (e) {
      captureError(e, "finalizeEnded.foreground");
    }
    if (!shouldPresentEndScreen(input.pathname)) {
      homeCheckPending = true;
      return;
    }
    homeCheckPending = false;
    try {
      await presentUnseenEndings(input.openEnd);
    } catch (e) {
      // Was an unhandled rejection (a 429 here surfaced as a dev red box).
      captureError(e, "finalizeEnded.unseen");
    }
  } finally {
    inFlight = false;
  }
}

/**
 * Build 90 04.7: on a route change only the unseen check, and only when the last foreground
 * run could not do it. Posting finalizeEnded and refetching the bootstrap on every
 * navigation cost three more requests per finish.
 */
export async function checkUnseenEndingsOnHome(input: { pathname: string; openEnd: () => void }): Promise<void> {
  if (!homeCheckPending || !shouldPresentEndScreen(input.pathname)) return;
  homeCheckPending = false;
  try {
    await presentUnseenEndings(input.openEnd);
  } catch (e) {
    captureError(e, "finalizeEnded.homeCheck");
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

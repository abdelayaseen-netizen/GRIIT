/**
 * Capture ProofShareCard as image and open native share sheet. Fire-and-forget markAsShared.
 */
import type { RefObject } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import type { ShareCardProofProps } from "@/components/ShareCard";

type CaptureRef = { capture?: () => Promise<string> } | null;

export type ShareCompletionOptions = ShareCardProofProps & {
  /** Ref to ViewShot wrapping ProofShareCard. */
  ref: RefObject<CaptureRef>;
  /** Check-in id to mark as shared (fire-and-forget). */
  completionId?: string | null;
};

async function logShareError(message: string, err: unknown) {
  if (__DEV__) {
    // error swallowed — handle in UI
  }
}

export async function shareCompletion(options: ShareCompletionOptions): Promise<void> {
  const { ref, completionId } = options;
  try {
    if (!ref?.current?.capture) return;
    const uri = await ref.current.capture();
    if (!uri) return;
    const filename = FileSystem.cacheDirectory + `griit-proof-${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: filename });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filename, { mimeType: "image/png" });
    } else {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.saveToLibraryAsync(filename);
      }
    }
    if (completionId) {
      trpcMutate(TRPC.checkins.markAsShared, { completionId }).catch((e) =>
        logShareError("markAsShared", e)
      );
    }
  } catch (e) {
    logShareError("shareCompletion", e);
  }
}

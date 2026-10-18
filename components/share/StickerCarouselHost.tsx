/**
 * Build 92 05.5: the one host for the sticker carousel. A toast's "Share" (01.4) and
 * Day secured's "Share" (02.3) call `openStickerCarousel`; this mounts at the root layout,
 * beside the stack, so the sheet presents over any pushed screen. (Hosted inside the tabs
 * layout it did nothing from Day secured: that screen sits above the tabs in the root stack
 * and the tabs' view is detached while covered.)
 */
import React, { useEffect, useState } from "react";
import ShareSystemSheet from "@/components/share/ShareSystemSheet";
import { useApp } from "@/contexts/AppContext";
import { registerStickerCarousel } from "@/lib/sticker-carousel";
import { shareCardFromToast, type TaskCompleteToast } from "@/lib/task-complete-toast";

export default function StickerCarouselHost() {
  const { profile } = useApp();
  const [toast, setToast] = useState<TaskCompleteToast | null>(null);

  useEffect(() => {
    registerStickerCarousel((next) => setToast(next));
    return () => registerStickerCarousel(null);
  }, []);

  return (
    <ShareSystemSheet
      visible={toast != null}
      onDismiss={() => setToast(null)}
      moment={toast?.photoUri ? "photo_proof" : "self_reported"}
      card={
        toast
          ? shareCardFromToast(toast, profile?.username)
          : { challenge: "", username: profile?.username, cameraSeal: false }
      }
    />
  );
}

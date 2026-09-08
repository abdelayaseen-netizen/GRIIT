import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { DOUBLE_TAP_WINDOW_MS } from "@/lib/feed-interaction";

export function useDoubleTap(handlers: {
  onSingleTap?: () => void;
  onDoubleTap: () => void;
}) {
  const { onSingleTap, onDoubleTap } = handlers;

  return useMemo(() => {
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(DOUBLE_TAP_WINDOW_MS)
      .runOnJS(true)
      .onEnd(() => {
        onDoubleTap();
      });

    const singleTap = Gesture.Tap()
      .numberOfTaps(1)
      .runOnJS(true)
      .onEnd(() => {
        onSingleTap?.();
      });

    return Gesture.Exclusive(doubleTap, singleTap);
  }, [onSingleTap, onDoubleTap]);
}

/**
 * DisplayNumber — 01_components.md "DisplayNumber" and Motion
 * Laws: 2 (Barlow Condensed 600, the only weight above 500), 19 (400ms count up
 * is one of two animated moments). Reduce Motion cuts to the final value and
 * skips the haptic. Spec sizes: inline | home | moment | mid | share.
 */
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Text, type TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { DS_V3 } from "@/lib/design-system";

const DAY_SECURED_MS = DS_V3.motion.count;

export type DisplayNumberSize = "inline" | "home" | "moment" | "mid" | "share";

export type DisplayNumberProps = {
  value: number | string;
  size?: DisplayNumberSize;
  onInk?: boolean;
  animateFrom?: number;
  haptic?: boolean;
};

function letterSpacingFor(size: DisplayNumberSize) {
  if (size === "inline") return 1;
  if (size === "home") return DS_V3.type.number.letterSpacing;
  return DS_V3.type.number.letterSpacing * 3;
}

export default function DisplayNumber({
  value,
  size = "home",
  onInk,
  animateFrom,
  haptic,
}: DisplayNumberProps) {
  void onInk;
  const numeric = typeof value === "number" ? value : null;
  const shouldAnimate = numeric != null && animateFrom != null;
  const [shown, setShown] = useState<string | number>(
    shouldAnimate ? animateFrom : value
  );
  const progress = useSharedValue(0);
  const fired = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || numeric == null || animateFrom == null) {
      setShown(value);
      return;
    }

    let cancelled = false;
    fired.current = false;
    const from = animateFrom;
    const to = numeric;

    const apply = (n: number) => {
      if (!cancelled) setShown(n);
    };

    const finish = () => {
      if (cancelled || fired.current) return;
      fired.current = true;
      apply(to);
      if (haptic) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        apply(to);
        return;
      }
      progress.value = 0;
      progress.value = withTiming(1, { duration: DAY_SECURED_MS }, (done) => {
        if (done) {
          runOnJS(finish)();
        }
      });
      const start = Date.now();
      const tick = () => {
        if (cancelled) return;
        const p = Math.min(1, (Date.now() - start) / DAY_SECURED_MS);
        apply(Math.round(from + (to - from) * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldAnimate, numeric, animateFrom, value, haptic, progress]);

  const face: TextStyle = {
    fontWeight: DS_V3.type.number.fontWeight,
    fontFamily: DS_V3.type.number.fontFamily,
    fontVariant: ["tabular-nums"],
    fontSize: DS_V3.numberSize[size],
    lineHeight: DS_V3.numberSize[size],
    letterSpacing: letterSpacingFor(size),
    color: DS_V3.color.textPrimary,
  };

  return <Text style={face}>{shown}</Text>;
}

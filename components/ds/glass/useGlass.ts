/**
 * Build 92 01.1 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/useGlass.ts.
 * Glass is on only with FLAGS.LIQUID_GLASS, on iOS 26+, with Reduce Transparency off.
 */
import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { FLAGS } from "@/lib/feature-flags";
import { glassEnabled } from "@/lib/glass";

export function useReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((v) => {
        if (live) setReduce(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (live) setReduce(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

export function useGlassEnabled(): boolean {
  const reduceTransparency = useReduceTransparency();
  return glassEnabled({
    flag: FLAGS.LIQUID_GLASS,
    os: Platform.OS,
    osVersion: Platform.Version,
    reduceTransparency,
  });
}

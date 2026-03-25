import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

interface SkeletonBaseProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBase({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonBaseProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduceMotion]);

  if (reduceMotion) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            width: width as ViewStyle["width"],
            height,
            borderRadius,
            opacity: 0.55,
          },
          style,
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as ViewStyle["width"],
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DS_COLORS.skeletonBg,
  },
});

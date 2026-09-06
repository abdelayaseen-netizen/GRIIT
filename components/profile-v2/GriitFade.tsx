import React from "react";
import { Animated } from "react-native";

/** Spec: 300ms rise + fade, 8px, keyed on screen and data/tab pair. */
export function GriitFade({
  fadeKey,
  children,
}: {
  fadeKey: string;
  children: React.ReactNode;
}) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(8)).current;
  React.useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeKey, opacity, translateY]);
  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

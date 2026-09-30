/**
 * Solid canvas strip over the status-bar inset. Scroll content can pass
 * underneath; the clock and battery stay on ink, not on moving rows.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";

export default function StatusBarBacking() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      style={[styles.bar, { height: insets.top }]}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DS_V3.color.canvas,
    zIndex: 20,
  },
});

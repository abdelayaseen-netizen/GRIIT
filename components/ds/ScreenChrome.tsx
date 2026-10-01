/**
 * G1. Solid canvas band the height of the top safe area, drawn above the
 * scroll view. No blur. Content can scroll behind it and is cut at the clock.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";

export default function ScreenChrome({ children }: { children: React.ReactNode }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={styles.body}>{children}</View>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        style={[styles.band, { height: top }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { flex: 1 },
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: DS_V3.color.canvas,
    zIndex: 10,
  },
});

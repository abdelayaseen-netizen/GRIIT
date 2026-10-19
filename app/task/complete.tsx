import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { TaskFlowV2 } from "@/components/task-v2/TaskFlowV2";
import { JOINED_TOAST } from "@/lib/first-day";
import { DS_V3 } from "@/lib/design-system";

const TOAST_MS = 3000;

/** Build 92 09.2 (P3-06): the first task after a one-tap Join says "You're in. Day 1 is today." once. */
function JoinedToast() {
  const { joined } = useLocalSearchParams<{ joined?: string }>();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(joined === "1");
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), TOAST_MS);
    return () => clearTimeout(t);
  }, [visible]);
  if (!visible) return null;
  const toast = (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + DS_V3.space.sm }]}>
      <Text style={styles.toast} accessibilityLiveRegion="polite" testID="joined-toast">
        {JOINED_TOAST}
      </Text>
    </View>
  );
  // The first step can be a native-modal Sheet (photo optional); only a full-window overlay sits above it.
  return Platform.OS === "ios" ? <FullWindowOverlay>{toast}</FullWindowOverlay> : toast;
}

export default function TaskCompleteScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <TaskFlowV2 />
      </ErrorBoundary>
      <JoinedToast />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    alignItems: "center",
  },
  toast: {
    overflow: "hidden",
    paddingHorizontal: DS_V3.space.lg,
    paddingVertical: DS_V3.space.md,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.border,
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: "600",
  },
});

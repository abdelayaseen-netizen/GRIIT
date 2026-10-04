/**
 * Non-last task toast. Sits 12 above the tab bar, dismisses in 4s or on swipe.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { CameraSeal } from "@/components/feed/CameraSeal";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import {
  clearTaskCompleteFlash,
  dismissTaskToast,
  subscribeTaskToast,
  taskCompleteFlashId,
  type TaskCompleteToast,
} from "@/lib/task-complete-toast";

const LIFE_MS = 4000;

export function useTaskCompleteFlash(): string | null {
  const [id, setId] = React.useState<string | null>(null);
  useEffect(() => subscribeTaskToast(() => setId(taskCompleteFlashId())), []);
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      clearTaskCompleteFlash();
      setId(null);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);
  return id;
}

export default function TaskCompleteToast({ onShare }: { onShare?: (toast: TaskCompleteToast) => void }) {
  const [toast, setToast] = React.useState<TaskCompleteToast | null>(null);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => subscribeTaskToast(setToast), []);

  useEffect(() => {
    if (!toast) return;
    slide.setValue(24);
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => dismissTaskToast(), LIFE_MS);
    return () => clearTimeout(timer);
  }, [toast, slide]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) slide.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > 24) dismissTaskToast();
        else Animated.spring(slide, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  if (!toast) return null;

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[styles.wrap, { bottom: tabBarContentPad() + 12, transform: [{ translateY: slide }] }]}
    >
      <View style={styles.thumb}>
        {toast.photoUri ? (
          <Image source={{ uri: toast.photoUri }} style={styles.thumb} />
        ) : (
          <Check size={22} color={DS_V3.color.brandText} />
        )}
        {toast.cameraSeal ? (
          <View style={styles.seal}>
            <CameraSeal onPress={() => undefined} size={16} />
          </View>
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
        <Text style={styles.body} numberOfLines={1}>{toast.body}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share"
        onPress={() => onShare?.(toast)}
        style={styles.pill}
      >
        <Text style={styles.pillTxt}>Share</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 16,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DS_V3.color.brandTint,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  seal: { position: "absolute", top: -2, right: -2 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: DS_V3.color.textPrimary },
  body: { fontSize: 12, lineHeight: 16, color: DS_V3.color.textSecondary },
  pill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  pillTxt: { fontSize: 13, lineHeight: 16, fontWeight: "500", color: DS_V3.color.onBrand },
});

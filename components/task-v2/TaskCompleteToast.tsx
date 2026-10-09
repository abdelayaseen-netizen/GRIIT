/**
 * Non-last task toast. Sits 12 above the tab bar, dismisses in 4s or on swipe.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { ShareChoice } from "@/components/ds/ShareChoice";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import {
  clearTaskCompleteFlash,
  dismissTaskToast,
  subscribeTaskToast,
  taskCompleteFlashId,
  type TaskCompleteToast,
} from "@/lib/task-complete-toast";

const LIFE_MS = 4000;
const PHOTO_LIFE_MS = 8000;
const UNDO_MS = 6000;

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

export default function TaskCompleteToast({
  onShare,
  onShareFeed,
  onUndoFeed,
}: {
  onShare?: (toast: TaskCompleteToast) => void;
  onShareFeed?: (toast: TaskCompleteToast) => Promise<void> | void;
  onUndoFeed?: (toast: TaskCompleteToast) => Promise<void> | void;
}) {
  const [toast, setToast] = React.useState<TaskCompleteToast | null>(null);
  const [shared, setShared] = React.useState(false);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => subscribeTaskToast((next) => {
    setShared(false);
    setToast(next);
  }), []);

  useEffect(() => {
    if (!toast) return;
    slide.setValue(24);
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const life = shared ? UNDO_MS : toast.cameraSeal ? PHOTO_LIFE_MS : LIFE_MS;
    const timer = setTimeout(() => dismissTaskToast(), life);
    return () => clearTimeout(timer);
  }, [toast, slide, shared]);

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
      style={[
        styles.wrap,
        toast.cameraSeal ? styles.wrapPhoto : null,
        { bottom: tabBarContentPad() + 12, transform: [{ translateY: slide }] },
      ]}
    >
      {toast.cameraSeal ? null : (
      <View style={styles.thumb}>
        {toast.photoUri ? (
          <Image source={{ uri: toast.photoUri }} style={styles.thumb} />
        ) : (
          <Check size={22} color={DS_V3.color.textPrimary} />
        )}
      </View>
      )}
      {toast.cameraSeal ? (
        <View style={styles.choice}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          {toast.body ? <Text style={styles.body} numberOfLines={1}>{toast.body}</Text> : null}
          <ShareChoice
            state={shared ? "shared" : "unanswered"}
            isPhoto
            photoUri={toast.photoUri}
            onShare={() => {
              void Promise.resolve(onShareFeed?.(toast)).then(() => setShared(true));
            }}
            onKeep={() => dismissTaskToast()}
            onUndo={() => {
              void Promise.resolve(onUndoFeed?.(toast)).then(() => {
                setShared(false);
                dismissTaskToast();
              });
            }}
            onRetry={() => {
              void Promise.resolve(onShareFeed?.(toast)).then(() => setShared(true));
            }}
          />
        </View>
      ) : (
        <>
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
            <Text style={styles.body} numberOfLines={1}>{toast.body}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share as a card"
            onPress={() => onShare?.(toast)}
            style={styles.pill}
          >
            <Text style={styles.pillTxt}>Share</Text>
          </Pressable>
        </>
      )}
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
  wrapPhoto: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  choice: { gap: 8, width: "100%" },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DS_V3.color.surface,
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
    backgroundColor: DS_V3.color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pillTxt: { fontSize: 13, lineHeight: 16, fontWeight: "500", color: DS_V3.color.onBrand },
});

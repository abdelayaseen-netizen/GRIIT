/**
 * The one toast system (build 92 01.4, P0-09 / P0-12).
 * Chrome glass (or the solid fallback), 70 pt above the tab bar, 4 s, wraps up to 3 lines,
 * announced to VoiceOver, dismisses on swipe down. An optional action; "Share" opens the
 * sticker carousel. Error toasts never offer Retry unless the caller wires one that can work.
 */
import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { GlassSurface } from "@/components/ds/glass";
import { DS_V3 } from "@/lib/design-system";
import { SHARE } from "@/lib/copy";
import { GLASS_RADIUS, GLASS_STATE, TOAST_LIFE_MS, TOAST_MAX_LINES, glassInset } from "@/lib/glass";
import { openStickerCarousel } from "@/lib/sticker-carousel";
import { toastBottomOffset } from "@/lib/tab-bar-inset";
import {
  clearTaskCompleteFlash,
  dismissTaskToast,
  runToastAction,
  subscribeTaskToast,
  taskCompleteFlashId,
  type TaskCompleteToast,
} from "@/lib/task-complete-toast";

const LIFE_MS = TOAST_LIFE_MS;
const PHOTO_LIFE_MS = TOAST_LIFE_MS;
const UNDO_MS = TOAST_LIFE_MS;

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
  onShareFeed,
  onUndoFeed,
}: {
  onShareFeed?: (toast: TaskCompleteToast) => Promise<void> | void;
  onUndoFeed?: (toast: TaskCompleteToast) => Promise<void> | void;
}) {
  const [toast, setToast] = React.useState<TaskCompleteToast | null>(null);
  const [shared, setShared] = React.useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inset = glassInset(width);

  useEffect(() => subscribeTaskToast((next) => {
    setShared(false);
    setToast(next);
    if (next) {
      AccessibilityInfo.announceForAccessibility([next.title, next.body].filter(Boolean).join(" "));
    }
  }), []);

  useEffect(() => {
    if (!toast) return;
    slide.setValue(24);
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const life = toast.lifeMs ?? (shared ? UNDO_MS : toast.cameraSeal ? PHOTO_LIFE_MS : LIFE_MS);
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
      testID="toast-saved"
      accessibilityRole="alert"
      style={[
        styles.wrap,
        {
          left: inset,
          right: inset,
          bottom: toastBottomOffset(insets.bottom),
          transform: [{ translateY: slide }],
        },
      ]}
    >
      <GlassSurface kind="chrome" style={styles.surface}>
      <View style={styles.thumb}>
        {toast.photoUri ? (
          <Image source={{ uri: toast.photoUri }} style={styles.thumb} />
        ) : (
          <Check size={22} color={DS_V3.color.textPrimary} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={toast.body ? TOAST_MAX_LINES - 1 : TOAST_MAX_LINES}>
          {toast.title}
        </Text>
        {toast.body ? <Text style={styles.body} numberOfLines={1}>{toast.body}</Text> : null}
      </View>
      {toast.cameraSeal ? (
        <Pressable
          testID="toast-share"
          accessibilityRole="button"
          accessibilityLabel={shared ? "Undo share" : SHARE.cta}
          onPress={() => {
            if (shared) {
              setShared(false);
              void Promise.resolve(onUndoFeed?.(toast)).finally(() => dismissTaskToast());
              return;
            }
            setShared(true);
            void Promise.resolve(onShareFeed?.(toast)).catch(() => setShared(false));
          }}
          style={styles.pill}
        >
          <Text style={styles.pillTxt}>{shared ? "Undo" : "Share"}</Text>
        </Pressable>
      ) : toast.actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toast.actionLabel}
          onPress={() => {
            runToastAction();
            dismissTaskToast();
          }}
          style={styles.pill}
        >
          <Text style={styles.pillTxt}>{toast.actionLabel}</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share"
          onPress={() => openStickerCarousel(toast)} // Build 92 01.4: the sticker carousel (stub until chunk 05)
          style={styles.pill}
        >
          <Text style={styles.pillTxt}>Share</Text>
        </Pressable>
      )}
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    zIndex: 20,
  },
  surface: {
    minHeight: 52,
    borderRadius: GLASS_RADIUS.toast,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 8,
    overflow: "hidden",
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GLASS_STATE.secondaryFill,
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
    backgroundColor: DS_V3.color.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  pillTxt: { fontSize: 13, lineHeight: 16, fontWeight: "500", color: DS_V3.color.canvas },
});

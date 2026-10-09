/**
 * Stories-style proof viewer. Tasks move sideways, days move vertically.
 */
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Image } from "expo-image";
import { Check, Heart, Lock, MessageCircle, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { proofsDateLabel } from "@/lib/proofs-grid";
import { neighborUris, step, type Gesture as ViewerGesture, type Pos, type ViewerDay } from "@/lib/proof-viewer";

export function ProofViewer({
  days,
  pos,
  onPos,
  onClose,
  countLabel,
  dateLabel,
}: {
  days: ViewerDay[];
  pos: Pos;
  onPos: (next: Pos) => void;
  onClose: () => void;
  countLabel?: string;
  dateLabel?: string;
}) {
  const { width } = useWindowDimensions();
  const day = days[pos.day];
  const task = day?.tasks[pos.task];
  const photo = task?.photos[pos.photo];
  const drag = useSharedValue(0);

  useEffect(() => {
    const urls = neighborUris(days, pos.day);
    for (const url of urls) void Image.prefetch(url);
  }, [days, pos.day]);

  const apply = (gesture: ViewerGesture) => {
    const next = step(pos, gesture, days.map((entry) => ({ tasks: entry.tasks.map((item) => ({ photos: item.photos.length })) })));
    if (next === "close") onClose();
    else onPos(next);
  };

  const media = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .activeOffsetY([-24, 24])
    .onEnd((event) => {
      const ax = Math.abs(event.translationX);
      const ay = Math.abs(event.translationY);
      if (ax < 36 && ay < 36) return;
      const gesture: ViewerGesture = ax > ay
        ? event.translationX < 0 ? "swipeLeft" : "swipeRight"
        : event.translationY > 0 ? "swipeDown" : "swipeUp";
      runOnJS(apply)(gesture);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    if (event.x < width * 0.28) runOnJS(apply)("tapLeft");
    else if (event.x > width * 0.72) runOnJS(apply)("tapRight");
  });

  const headerPan = Gesture.Pan()
    .onUpdate((event) => {
      drag.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 90) {
        runOnJS(apply)("swipeDownHeader");
        return;
      }
      drag.value = withTiming(0);
    });

  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateY: drag.value }, { scale: 1 - Math.min(drag.value, 180) / 900 }],
  }));

  if (!day || !task) {
    return (
      <View style={styles.empty}>
        <Text style={styles.meta}>No proofs on this day.</Text>
      </View>
    );
  }

  const photoCount = task.photos.length;
  const clock = selfLine(task.capturedAt);

  return (
    <Animated.View style={[styles.root, sheet]}>
      <View style={styles.bars}>
        {day.tasks.map((item, index) => (
          <View key={item.id} style={styles.barTrack}>
            <View style={[styles.barFill, { width: index < pos.task ? "100%" : index === pos.task ? `${((pos.photo + 1) / Math.max(1, item.photos.length)) * 100}%` : "0%" }]} />
          </View>
        ))}
      </View>
      <GestureDetector gesture={headerPan}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.date}>{dateLabel || proofsDateLabel(day.dateKey)}</Text>
            <Text style={styles.meta}>{task.challenge} · {task.dayLine}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close}>
            <X size={22} color={DS_V3.color.textPrimary} />
          </Pressable>
        </View>
      </GestureDetector>
      <GestureDetector gesture={Gesture.Exclusive(media, tap)}>
        <View style={styles.stage}>
          {photo?.uri ? (
            <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.self}>
              <View style={styles.disc}>
                <Check size={22} color={DS_V3.color.textPrimary} />
              </View>
              <Text style={styles.task}>{task.name}</Text>
              <Text style={styles.meta}>{clock}</Text>
            </View>
          )}
          {photo?.uri && photoCount > 1 ? (
            <View style={styles.chip}>
              <Text style={styles.chipText} accessibilityLabel={countLabel}>{pos.photo + 1} of {photoCount}</Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>
      <View style={styles.footer}>
        <Text style={styles.task}>{task.name}</Text>
        {task.shared ? (
          <View style={styles.counts}>
            <Heart size={18} color={DS_V3.color.textPrimary} />
            <Text style={styles.count}>{task.respectCount}</Text>
            <MessageCircle size={18} color={DS_V3.color.textPrimary} />
            <Text style={styles.count}>{task.commentCount}</Text>
          </View>
        ) : (
          <View style={styles.counts}>
            <Lock size={16} color={DS_V3.color.textSecondary} />
            <Text style={styles.meta}>Private. Only you can see this.</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function selfLine(iso: string | null): string {
  if (!iso) return "Self-reported";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Self-reported";
  const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(d).toLowerCase();
  return `Self-reported · ${clock}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  bars: { flexDirection: "row", gap: 4, paddingHorizontal: 12, paddingTop: 8 },
  barTrack: { flex: 1, height: 2, backgroundColor: DS_V3.color.hairline, borderRadius: 1 },
  barFill: { height: 2, backgroundColor: DS_V3.color.textPrimary },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  headerCopy: { flex: 1 },
  date: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  meta: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stage: { flex: 1, justifyContent: "center" },
  photo: { width: "100%", aspectRatio: 4 / 5 },
  self: { margin: 16, borderRadius: 16, backgroundColor: DS_V3.color.surface, padding: 16, gap: 8 },
  disc: { width: 40, height: 40, borderRadius: 20, backgroundColor: DS_V3.color.raised, alignItems: "center", justifyContent: "center" },
  task: { ...DS_V3.type.title, color: DS_V3.color.textPrimary },
  chip: { position: "absolute", top: 12, right: 12, backgroundColor: DS_V3.color.coverChip, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  footer: { padding: 16, gap: 8 },
  counts: { flexDirection: "row", alignItems: "center", gap: 8 },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
});

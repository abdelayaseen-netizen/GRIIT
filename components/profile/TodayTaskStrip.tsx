import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type TodayTaskStripProps = {
  taskName: string;
  dayOfTotal: string;
  onClear: () => void;
  onTap: () => void;
};

const TRACK_BG = DS_COLORS.success;

export function TodayTaskStrip({ taskName, dayOfTotal, onClear, onTap }: TodayTaskStripProps) {
  const translateX = useSharedValue(0);
  const cardWidth = useSharedValue(0);

  const fireTap = useCallback(() => {
    onTap();
  }, [onTap]);

  const fireClear = useCallback(() => {
    onClear();
  }, [onClear]);

  const onLayoutCard = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      cardWidth.value = e.nativeEvent.layout.width;
    },
    [cardWidth]
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX(14)
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      "worklet";
      const next = Math.max(0, e.translationX);
      translateX.value = next;
    })
    .onEnd(() => {
      "worklet";
      const w = cardWidth.value;
      const threshold = w > 0 ? w * 0.6 : 0;
      if (translateX.value > threshold && w > 0) {
        translateX.value = withTiming(w + 24, { duration: 260 }, (done) => {
          if (done) {
            runOnJS(fireClear)();
          }
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    "worklet";
    runOnJS(fireTap)();
  });

  const gestures = Gesture.Exclusive(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={styles.shell}
      accessible
      accessibilityRole="none"
      accessibilityLabel={`Today task ${taskName}, ${dayOfTotal}`}
      accessibilityActions={[
        { name: "activate", label: "Open task" },
        { name: "complete", label: "Mark task complete" },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "activate") {
          fireTap();
        }
        if (e.nativeEvent.actionName === "complete") {
          fireClear();
        }
      }}
      accessibilityHint="Swipe right to reveal mark done track, or use actions to complete"
    >
      <View style={styles.trackReveal} accessible={false} importantForAccessibility="no-hide-descendants">
        <Check color={DS_COLORS.WHITE} size={22} strokeWidth={2} />
        <Text style={styles.trackLabel}>Mark done</Text>
      </View>
      <GestureDetector gesture={gestures}>
        <Animated.View
          onLayout={onLayoutCard}
          style={[styles.card, animatedCardStyle]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.cardInner}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {taskName}
            </Text>
            <Text style={styles.dayLine}>{dayOfTotal}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const CARD_RS = DS_RADIUS.MD;

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.md,
    overflow: "hidden",
    borderTopRightRadius: CARD_RS,
    borderBottomRightRadius: CARD_RS,
  },
  trackReveal: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: DS_SPACING.md + 6,
    backgroundColor: TRACK_BG,
    gap: DS_SPACING.sm,
  },
  trackLabel: {
    color: DS_COLORS.WHITE,
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.ACCENT,
    borderTopRightRadius: CARD_RS,
    borderBottomRightRadius: CARD_RS,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.md,
  },
  cardInner: { gap: DS_SPACING.xs },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  dayLine: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.TEXT_SECONDARY,
  },
});

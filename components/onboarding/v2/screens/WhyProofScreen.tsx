import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";
import {
  WHY_PROOF_END,
  WHY_PROOF_FADE_MS,
  WHY_PROOF_HEADER_MS,
  WHY_PROOF_HOLD_MS,
  WHY_PROOF_RING_MS,
  WHY_PROOF_START,
  WHY_PROOF_SUB,
  WHY_PROOF_TITLE,
} from "@/lib/onboarding-v42-copy";

export default function WhyProofScreen({
  onContinue,
  onSkip,
  onBack,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const third = useRef(new Animated.Value(0)).current;
  const header = useRef(new Animated.Value(0)).current;
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let seq: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        third.setValue(1);
        header.setValue(1);
        line.setValue(1);
        return;
      }
      seq = Animated.sequence([
        Animated.delay(WHY_PROOF_HOLD_MS),
        Animated.timing(third, { toValue: 1, duration: WHY_PROOF_RING_MS, useNativeDriver: true }),
        Animated.timing(header, { toValue: 1, duration: WHY_PROOF_HEADER_MS, useNativeDriver: true }),
        Animated.timing(line, { toValue: 1, duration: WHY_PROOF_FADE_MS, useNativeDriver: true }),
      ]);
      seq.start();
    });
    return () => {
      cancelled = true;
      seq?.stop();
    };
  }, [header, line, third]);

  return (
    <OnboardingScreen
      step={1}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title={WHY_PROOF_TITLE}
      subtitle={WHY_PROOF_SUB}
      footer={<ChromePrimary label="Continue" onPress={onContinue} />}
    >
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.today}>Today</Text>
            <View style={styles.chip}>
              <Animated.Text style={[styles.chipTxt, { opacity: header.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
                2 / 3
              </Animated.Text>
              <Animated.Text style={[styles.chipTxt, styles.chipAbs, { opacity: header }]}>3 / 3</Animated.Text>
            </View>
          </View>
          <Row name="Run 5km" done />
          <Row name="Read 10 pages" done />
          <View style={styles.row}>
            <View style={styles.dotSlot}>
              <View style={styles.dotOff} />
              <Animated.View style={[styles.dotOn, styles.dotAbs, { opacity: third }]} />
            </View>
            <Text style={styles.task}>Cold shower</Text>
          </View>
        </View>
      </View>
      <View style={styles.captionWrap}>
        <Animated.Text style={[styles.caption, { opacity: line.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
          {WHY_PROOF_START}
        </Animated.Text>
        <Animated.Text style={[styles.caption, styles.captionAbs, { opacity: line }]}>{WHY_PROOF_END}</Animated.Text>
      </View>
    </OnboardingScreen>
  );
}

function Row({ name, done }: { name: string; done: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, done ? styles.dotOn : styles.dotOff]} />
      <Text style={[styles.task, done ? styles.taskDone : null]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.gutter },
  card: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  today: { ...DS_V3.type.heading, color: DS_V3.color.textPrimary },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  chipTxt: { ...DS_V3.type.caption, fontWeight: "500", color: DS_V3.color.textPrimary },
  chipAbs: { position: "absolute" },
  row: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.md, minHeight: 44 },
  dotSlot: { width: 20, height: 20 },
  dot: { width: 20, height: 20, borderRadius: 999 },
  dotOn: { width: 20, height: 20, borderRadius: 999, backgroundColor: DS_V3.color.textPrimary },
  dotOff: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: DS_V3.color.textSecondary,
  },
  dotAbs: { position: "absolute", left: 0 },
  task: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  taskDone: { color: DS_V3.color.textSecondary },
  captionWrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.md, minHeight: 40 },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  captionAbs: { position: "absolute", left: DS_V3.space.gutter, right: DS_V3.space.gutter, top: DS_V3.space.md },
});

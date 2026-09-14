import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useOnboardingStore } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import { parseTargetStreak } from "@/lib/onboarding-v2-target-streak-parse";
import { ChromePrimary, OnboardingScreen, OptionRow } from "../OnboardingChrome";

const PRESETS = [
  { days: 7, line: "Enough to find out whether the tasks fit your day." },
  { days: 30, line: "Long enough that a bad week lands inside it." },
  { days: 75, line: "Two and a half months with no gap." },
] as const;

function initialPick(stored: number | null): number | "custom" | null {
  if (stored == null) return null;
  if (stored === 7 || stored === 30 || stored === 75) return stored;
  return "custom";
}

export default function DayTargetScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const stored = useOnboardingStore((s) => s.targetStreak);
  const setTargetStreak = useOnboardingStore((s) => s.setTargetStreak);
  const [pick, setPick] = useState<number | "custom" | null>(() => initialPick(stored));
  const [customText, setCustomText] = useState(() =>
    stored != null && stored !== 7 && stored !== 30 && stored !== 75 ? String(stored) : ""
  );

  const target =
    pick === "custom"
      ? parseTargetStreak(Number.parseInt(customText, 10))
      : pick != null
        ? pick
        : null;

  const handleLock = useCallback(() => {
    if (target == null) return;
    setTargetStreak(target);
    track({ name: "target_streak_selected", days: target });
    onContinue();
  }, [target, setTargetStreak, onContinue]);

  return (
    <OnboardingScreen
      step={3}
      onBack={onBack}
      title="Set your line."
      subtitle="How many days are you committing to. You can change it later, but you have to change it on purpose."
      footer={<ChromePrimary label="Lock it in" disabled={target == null} onPress={handleLock} />}
    >
      <View style={styles.body}>
        {PRESETS.map((t) => (
          <OptionRow
            key={t.days}
            title={formatDays(t.days)}
            subtitle={t.line}
            selected={pick === t.days}
            onPress={() => setPick(t.days)}
          />
        ))}
        <OptionRow
          title="Custom"
          subtitle="Any number from 3 to 365."
          selected={pick === "custom"}
          onPress={() => setPick("custom")}
        />
        {pick === "custom" ? (
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            keyboardType="number-pad"
            placeholder="Days"
            placeholderTextColor={DS_V3.color.textSecondary}
            accessibilityLabel="Custom day target"
            style={styles.input}
          />
        ) : null}
        {target != null ? (
          <Text style={styles.caption}>{`Home counts against this: Day 1 of ${target}.`}</Text>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  input: {
    minHeight: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    borderWidth: DS_V3.space.xs / 4,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    paddingHorizontal: DS_V3.space.lg,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    paddingTop: DS_V3.space.lg,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});

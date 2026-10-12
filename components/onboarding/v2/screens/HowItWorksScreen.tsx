/**
 * v52 "How it works". One screen replaces the old intros and "Set your line".
 * Freeze copy is the 7-day line from the build 87 brief, not the 30-day line in the handoff file.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { STANDARD_MODE_LINE } from "@/lib/onboarding-v2-first-challenge";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";
import { chromeStep } from "@/lib/onboarding-v2-routing";

const LINES = [
  "Prove each one with a photo, or tick it off if it's self-reported.",
  "Every task done = day secured.",
  "Your streak goes up by one. Miss a task and the day isn't secured.",
] as const;

export default function HowItWorksScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <OnboardingScreen
      step={chromeStep("how")}
      onBack={onBack}
      title="How it works"
      footer={<ChromePrimary label="Continue" onPress={onContinue} />}
    >
      <View style={styles.body}>
        {LINES.map((line) => (
          <Text key={line} style={styles.line}>
            {line}
          </Text>
        ))}
        <Text style={styles.freeze}>{STANDARD_MODE_LINE}</Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: { gap: DS_V3.space.lg, paddingTop: DS_V3.space.md },
  line: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    color: DS_V3.color.textPrimary,
  },
  freeze: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});

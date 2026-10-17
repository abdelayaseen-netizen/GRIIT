/**
 * v52 "How it works". Three short lines. Freeze copy lives elsewhere.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";
import { chromeStep } from "@/lib/onboarding-v2-routing";

const LINES = [
  "Prove each task with a photo, or tick it off if it's self-reported.",
  "Every required task done secures the day.",
  "Your streak goes up by one when the day is secured.",
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
});

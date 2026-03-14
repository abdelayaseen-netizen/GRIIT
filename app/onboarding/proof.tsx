import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboardingStore";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { DS_COLORS } from "@/lib/design-system";

const TARGET_NUMBER = 43218;
const START_NUMBER = 40000;
const DURATION_MS = 1500;

const AVATARS = [
  { initials: "JK", color: DS_COLORS.accent },
  { initials: "SM", color: DS_COLORS.success },
  { initials: "AL", color: DS_COLORS.linkBlue },
  { initials: "MR", color: DS_COLORS.taskIndigo },
  { initials: "TC", color: DS_COLORS.taskAmber },
  { initials: "DW", color: DS_COLORS.taskPhotoPink },
];

function useCountUp(end: number, start: number, durationMs: number, run: boolean) {
  const [value, setValue] = useState(start);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!run) return;
    startTime.current = null;

    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const current = t >= 1 ? end : Math.round(start + (end - start) * eased);
      setValue(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, start, durationMs, run]);

  return value;
}

export default function OnboardingProofScreen() {
  const router = useRouter();
  const runOnce = useRef(false);
  const [run, setRun] = useState(false);
  const value = useCountUp(TARGET_NUMBER, START_NUMBER, DURATION_MS, run);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;
    const t = setTimeout(() => setRun(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <OnboardingLayout
      step={6}
      totalSteps={9}
      showBack={true}
      showSkip={false}
      showProgressBar={true}
    >
      <View style={styles.center}>
        <Text style={styles.number}>{value.toLocaleString()}</Text>
        <Text style={styles.label}>
          people have completed a GRIIT challenge this year
        </Text>

        <View style={styles.avatars}>
          {AVATARS.map((a, i) => (
            <View
              key={i}
              style={[styles.avatar, { backgroundColor: a.color }]}
            >
              <Text style={styles.avatarText}>{a.initials}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.quote}>
          &ldquo;GRIIT is the only app that actually held me accountable.&rdquo;
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push("/onboarding/challenge" as never)}
          activeOpacity={0.9}
          accessibilityLabel="Continue to pick challenge"
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>I&apos;m ready — let&apos;s pick my challenge</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  number: {
    fontSize: 56,
    fontWeight: "800",
    color: DS_COLORS.white,
    letterSpacing: -1,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  avatars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: -8,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: DS_COLORS.onboardingBg,
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  quote: {
    fontSize: 15,
    fontStyle: "italic",
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  cta: {
    backgroundColor: DS_COLORS.accent,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: DS_COLORS.onboardingBg,
  },
});

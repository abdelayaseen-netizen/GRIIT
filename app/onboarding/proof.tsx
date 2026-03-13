import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const TARGET_NUMBER = 43218;
const START_NUMBER = 40000;
const DURATION_MS = 1500;
const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

const AVATARS = [
  { initials: "JK", color: "#E07B4A" },
  { initials: "SM", color: "#2F7A52" },
  { initials: "AL", color: "#0EA5E9" },
  { initials: "MR", color: "#8B5CF6" },
  { initials: "TC", color: "#F59E0B" },
  { initials: "DW", color: "#EC4899" },
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
      const current = Math.round(start + (end - start) * eased);
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
  const [run, setRun] = useState(false);
  const value = useCountUp(TARGET_NUMBER, START_NUMBER, DURATION_MS, run);

  useEffect(() => {
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
    color: TEXT_PRIMARY,
    letterSpacing: -1,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: TEXT_MUTED,
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
    borderColor: "#0A0A0A",
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  quote: {
    fontSize: 15,
    fontStyle: "italic",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  cta: {
    backgroundColor: ACCENT,
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
    color: "#0A0A0A",
  },
});

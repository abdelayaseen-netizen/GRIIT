import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/store/onboardingStore";
import { STARTER_CHALLENGES } from "@/constants/onboardingData";
import { ROUTES } from "@/lib/routes";
import { Check } from "lucide-react-native";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PARTICLE_COUNT = 35;
const COLORS = [ACCENT, "#2F7A52", "#0EA5E9", "#8B5CF6", "#F59E0B"];

function ConfettiParticles() {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0))
  ).current;
  const positions = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      left: Math.random() * SCREEN_WIDTH,
      size: 6 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  ).current;

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    particles.forEach((p, i) => {
      const delay = i * 30 + Math.random() * 80;
      timeouts.push(
        setTimeout(() => {
          Animated.timing(p, {
            toValue: 1,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          }).start();
        }, delay)
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, [particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((anim, i) => {
        const { left, size, color } = positions[i];
        const fall = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 360],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0, 1, 0],
        });
        const rotate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ translateY: fall }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function OnboardingFirstTaskScreen() {
  const router = useRouter();
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(9);
  }, [setCurrentStep]);

  const challenge = STARTER_CHALLENGES.find((c) => c.id === selectedChallengeId);
  const day1Tasks = challenge?.day1Tasks ?? [];

  const handleStartDay1 = () => {
    completeOnboarding();
    router.replace(ROUTES.TABS as never);
  };

  const handleStartTomorrow = async () => {
    try {
      await Notifications.requestPermissionsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Day 1 is here",
          body: "Your GRIIT challenge is waiting. Start strong.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          channelId: "default",
        },
      });
    } catch {
      // ignore
    }
    completeOnboarding();
    router.replace(ROUTES.TABS as never);
  };

  return (
    <OnboardingLayout
      step={9}
      totalSteps={9}
      showBack={true}
      showSkip={false}
      showProgressBar={false}
    >
      <ConfettiParticles />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Day 1 starts now.</Text>

        {challenge ? (
          <View style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
            <Text style={styles.challengeLabel}>{challenge.label}</Text>
            <Text style={styles.challengeSub}>{challenge.tasks}</Text>
          </View>
        ) : null}

        <Text style={styles.tasksHeading}>Day 1 tasks</Text>
        {day1Tasks.map((t, i) => (
          <View key={i} style={styles.taskRow}>
            <View style={styles.checkbox}>
              <Check size={14} color="#0A0A0A" strokeWidth={2.5} />
            </View>
            <Text style={styles.taskTitle}>{t.title}</Text>
            <Text style={styles.taskTime}>{t.time}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.cta} onPress={handleStartDay1} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Start Day 1 →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={handleStartTomorrow} activeOpacity={0.8}>
          <Text style={styles.secondaryText}>I&apos;ll start tomorrow</Text>
        </TouchableOpacity>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  particle: {
    position: "absolute",
    top: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  challengeCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#333",
  },
  challengeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  challengeLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  challengeSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  tasksHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  taskTime: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  cta: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  secondary: {
    alignItems: "center",
    marginTop: 16,
    padding: 12,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
});

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

const STEP_FROM_PATH: Record<string, number> = {
  "/onboarding": 1,
  "/onboarding/identity": 2,
  "/onboarding/barrier": 3,
  "/onboarding/intensity": 4,
  "/onboarding/social": 5,
  "/onboarding/proof": 6,
  "/onboarding/challenge": 7,
  "/onboarding/first-task": 9,
};

type OnboardingLayoutProps = {
  children: React.ReactNode;
  step: number;
  totalSteps?: number;
  showBack?: boolean;
  showSkip?: boolean;
  showProgressBar?: boolean;
  contentStyle?: ViewStyle;
};

export function OnboardingLayout({
  children,
  step,
  totalSteps = 9,
  showBack = true,
  showSkip = false,
  showProgressBar = true,
  contentStyle,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [step, slideAnim]);

  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;
  const isFirst = step <= 1;

  return (
    <View style={[styles.container, { backgroundColor: DS_COLORS.background }]}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {showProgressBar && (
          <View style={[styles.progressBarWrap, { paddingTop: insets.top + 8 }]}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>
        )}
        <View style={[styles.header, { paddingTop: showProgressBar ? 12 : insets.top + 8 }]}>
          {!isFirst && showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={12}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={28} color={DS_COLORS.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          {showProgressBar && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepText}>
                {step} of {totalSteps}
              </Text>
            </View>
          )}

          {showSkip ? (
            <TouchableOpacity
              onPress={() => router.replace("/auth/signup" as never)}
              style={styles.skipBtn}
              activeOpacity={0.7}
              accessibilityLabel="Skip to sign up"
              accessibilityRole="button"
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        <Animated.View
          style={[
            styles.content,
            contentStyle,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backPlaceholder: {
    width: 44,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.textSecondary,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressBarWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: DS_COLORS.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: DS_COLORS.accent,
  },
  stepWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export function getOnboardingStepFromPath(path: string): number {
  return STEP_FROM_PATH[path] ?? 1;
}

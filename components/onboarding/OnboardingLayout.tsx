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

const ONBOARDING_BG = "#0A0A0A";
const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";
const BORDER = "#333333";

const STEP_FROM_PATH: Record<string, number> = {
  "/onboarding": 1,
  "/onboarding/identity": 2,
  "/onboarding/barrier": 3,
  "/onboarding/intensity": 4,
  "/onboarding/social": 5,
  "/onboarding/proof": 6,
  "/onboarding/challenge": 7,
  "/onboarding/signup": 8,
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
    <View style={[styles.container, { backgroundColor: ONBOARDING_BG }]}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          {!isFirst && showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <ChevronLeft size={28} color={TEXT_PRIMARY} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          {showProgressBar && (
            <View style={styles.progressWrap}>
              <Text style={styles.stepText}>
                {step} of {totalSteps}
              </Text>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: ACCENT,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {showSkip ? (
            <TouchableOpacity
              onPress={() => router.replace("/onboarding/signup" as never)}
              style={styles.skipBtn}
              activeOpacity={0.7}
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
  progressWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export function getOnboardingStepFromPath(path: string): number {
  return STEP_FROM_PATH[path] ?? 1;
}

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ONBOARDING_COLORS as C , GOAL_OPTIONS } from "@/components/onboarding/onboarding-theme";
import { GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"
import { useOnboardingStore } from "@/store/onboardingStore";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

import { captureError } from "@/lib/sentry";
import { logger } from "@/lib/logger";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";

import ValueSplash from "./screens/ValueSplash";
import GoalSelection from "./screens/GoalSelection";
import SignUpScreen from "./screens/SignUpScreen";
import ProfileSetup from "./screens/ProfileSetup";
import AutoSuggestChallengeScreen from "./screens/AutoSuggestChallengeScreen";
import ProgressDots from "./ProgressDots";

export default function OnboardingFlow() {
  const { currentStep, nextStep, prevStep, completeOnboarding, setProfileSetupHints } = useOnboardingStore();
  const [authUserId, setAuthUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const validGoalIds = new Set(GOAL_OPTIONS.map((g) => g.id));
    useOnboardingStore.setState((s) => ({
      totalSteps: Math.max(s.totalSteps, 5),
      selectedGoals: s.selectedGoals.filter((g) => validGoalIds.has(g)),
    }));
  }, []);

  const showTopBar = currentStep >= 1 && currentStep <= 4;

  const advanceStep = useCallback(() => {
    try {
      track({ name: "onboarding_step_completed", step: currentStep, total: 4 });
    } catch {
      /* non-fatal */
    }
    nextStep();
  }, [currentStep, nextStep]);

  const handleSignUpComplete = useCallback(
    (userId: string) => {
      setAuthUserId(userId);
      advanceStep();
    },
    [advanceStep]
  );

  const handleProfileComplete = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const finishOnboarding = useCallback(async () => {
    const { track } = await import("@/lib/analytics");
    track({ name: "onboarding_completed" });
    completeOnboarding();
    setProfileSetupHints(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
    } catch (e) {
      captureError(e, "OnboardingFlowPersistFlag");
      logger.debug("OnboardingFlow", "persist onboarding flag failed", e);
    }
    router.replace(ROUTES.TABS as never);
  }, [completeOnboarding, router, setProfileSetupHints]);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prevStep();
  }, [prevStep]);

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <ValueSplash onContinue={advanceStep} />;
      case 1:
        return <GoalSelection onContinue={advanceStep} />;
      case 2:
        return <SignUpScreen onAuthSuccess={handleSignUpComplete} />;
      case 3:
        return <ProfileSetup userId={authUserId} onComplete={handleProfileComplete} />;
      case 4:
        return (
          <AutoSuggestChallengeScreen onJoinComplete={finishOnboarding} onBrowseMore={finishOnboarding} />
        );
      default:
        return <ValueSplash onContinue={advanceStep} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {showTopBar ? (
        <View style={styles.topBar}>
          {currentStep > 1 ? (
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back to previous step"
              accessibilityRole="button"
              hitSlop={8}
            >
              <ChevronLeft size={24} color={GRIIT_COLORS.textSecondary} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <View style={styles.topBarCenter}>
            <ProgressDots total={4} current={currentStep - 1} />
            <Text
              style={{
                fontSize: 12,
                color: GRIIT_COLORS.textSecondary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Step {currentStep} of 4
            </Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>
      ) : null}
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    padding: 12,
    alignSelf: "flex-start",
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: DS_RADIUS.XL,
    backgroundColor: C.WHITE,
    alignItems: "center",
  },
  backButtonPlaceholder: { width: 44, minHeight: 44 },
});

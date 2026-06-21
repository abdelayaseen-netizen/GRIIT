/**
 * OnboardingFlowV2 — the new 9-screen onboarding flow.
 *
 * Rendered by app/onboarding/index.tsx ONLY when FLAGS.ONBOARDING_V2 is true.
 * Runs alongside (never replaces) the existing components/onboarding/OnboardingFlow.
 *
 * Steps 0–6 + 8 render in-flow; the paywall (mockup 08) is the existing
 * offering-driven /paywall route, presented between Account and First-challenge.
 */
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { OBV2_COLOR, OBV2_TYPE } from "./theme";
import WelcomeScreen from "./screens/WelcomeScreen";
import WhyProofScreen from "./screens/WhyProofScreen";
import WhyCircleScreen from "./screens/WhyCircleScreen";
import GoalsScreen from "./screens/GoalsScreen";
import CommitmentScreen from "./screens/CommitmentScreen";
import RemindersScreen from "./screens/RemindersScreen";
import AccountScreen from "./screens/AccountScreen";
import FirstChallengeScreen from "./screens/FirstChallengeScreen";
import { completeOnboardingV2 } from "./completeOnboarding";

/** In-flow step keys (paywall is a pushed route, not an in-flow step). */
export type OnboardingV2Step =
  | "welcome"
  | "why_proof"
  | "why_circle"
  | "goals"
  | "commitment"
  | "reminders"
  | "account"
  | "first_challenge";

const ORDER: OnboardingV2Step[] = [
  "welcome",
  "why_proof",
  "why_circle",
  "goals",
  "commitment",
  "reminders",
  "account",
  "first_challenge",
];

export default function OnboardingFlowV2() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingV2Step>("welcome");

  const goNext = useCallback(() => {
    setStep((cur) => {
      const idx = ORDER.indexOf(cur);
      return ORDER[Math.min(idx + 1, ORDER.length - 1)] ?? cur;
    });
  }, []);

  const goToLogin = useCallback(() => {
    router.push(ROUTES.AUTH_LOGIN as never);
  }, [router]);

  // After account creation, present the existing offering-driven paywall (mockup
  // 08), then land on the first-challenge step. On dismiss the paywall returns
  // here (first_challenge); on purchase the paywall routes to the app itself.
  const handleAccountSuccess = useCallback(() => {
    setStep("first_challenge");
    router.push({ pathname: ROUTES.PAYWALL, params: { source: "onboarding" } } as never);
  }, [router]);

  // Completion (mockup 09). Both the featured "30-day reset" and "Build my own"
  // mark onboarding complete (storage + DB + store) then hand off to the existing
  // create/start flow. The 30-day reset is a static default — goals aren't wired.
  const finishToCreate = useCallback(async () => {
    await completeOnboardingV2();
    router.replace(ROUTES.CREATE_WIZARD as never);
  }, [router]);

  const renderScreen = () => {
    switch (step) {
      case "welcome":
        return <WelcomeScreen onGetStarted={goNext} onHaveAccount={goToLogin} />;
      case "why_proof":
        return <WhyProofScreen onContinue={goNext} />;
      case "why_circle":
        return <WhyCircleScreen onContinue={goNext} />;
      case "goals":
        return <GoalsScreen onContinue={goNext} />;
      case "commitment":
        return <CommitmentScreen onContinue={goNext} />;
      case "reminders":
        return <RemindersScreen onContinue={goNext} />;
      case "account":
        return <AccountScreen onAuthSuccess={handleAccountSuccess} />;
      case "first_challenge":
        return <FirstChallengeScreen onStart={finishToCreate} onBuildOwn={finishToCreate} />;
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Onboarding v2 — {step}</Text>
          </View>
        );
    }
  };

  return <SafeAreaView style={styles.safeArea}>{renderScreen()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: OBV2_COLOR.screen },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { ...OBV2_TYPE.body, color: OBV2_COLOR.ink2 },
});

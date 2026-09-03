/**
 * OnboardingFlowV2 — spec nine-screen flow.
 *
 * Rendered by app/onboarding/index.tsx ONLY when FLAGS.ONBOARDING_V2 is true.
 * Runs alongside (never replaces) the existing components/onboarding/OnboardingFlow.
 */
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  ONBOARDING_V2_ORDER,
  resolveOnboardingCompleted,
  resolveV2Step,
  sessionKindFromUser,
} from "@/lib/onboarding-v2-routing";
import { OBV2_COLOR } from "./theme";
import { BackButton } from "./ui";
import WelcomeScreen from "./screens/WelcomeScreen";
import WhyProofScreen from "./screens/WhyProofScreen";
import WhyCircleScreen from "./screens/WhyCircleScreen";
import GoalsScreen from "./screens/GoalsScreen";
import CommitmentScreen from "./screens/CommitmentScreen";
import RemindersScreen from "./screens/RemindersScreen";
import AccountScreen from "./screens/AccountScreen";
import FirstChallengeScreen from "./screens/FirstChallengeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { completeOnboardingV2 } from "./completeOnboarding";
import { readOnboardingGoals, writeOnboardingGoals } from "@/lib/onboarding-v2-goals";

function useOnboardingHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useOnboardingStore.persist.hasHydrated());
  useEffect(() => {
    if (hydrated) return;
    const unsub = useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);
  return hydrated;
}

export default function OnboardingFlowV2() {
  const router = useRouter();
  const { user } = useAuth();
  const hydrated = useOnboardingHydrated();
  const rawStep = useOnboardingStore((s) => s.v2Step);
  const setV2Step = useOnboardingStore((s) => s.setV2Step);
  const storeCompleted = useOnboardingStore((s) => s.isComplete || s.hasCompletedOnboarding);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);
  const setSelectedChallenge = useOnboardingStore((s) => s.setSelectedChallenge);
  const step = resolveV2Step(rawStep);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [dbCompleted, setDbCompleted] = useState<boolean | null>(null);
  const [dbFetchFailed, setDbFetchFailed] = useState(false);
  const [sentHome, setSentHome] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      .then((value) => {
        setLocalCompleted(value === "true");
        setLocalReady(true);
      })
      .catch(() => setLocalReady(true));
  }, []);

  useEffect(() => {
    if (!user) {
      setDbCompleted(null);
      setDbFetchFailed(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setDbCompleted(null);
          setDbFetchFailed(true);
          return;
        }
        const flag = (data as { onboarding_completed?: boolean } | null)?.onboarding_completed;
        setDbCompleted(typeof flag === "boolean" ? flag : false);
        setDbFetchFailed(false);
      } catch {
        if (!cancelled) {
          setDbCompleted(null);
          setDbFetchFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      if (selectedGoals.length > 0) {
        await writeOnboardingGoals(user.id, selectedGoals);
        return;
      }
      const remote = await readOnboardingGoals(user.id);
      if (cancelled || remote.length === 0) return;
      if (useOnboardingStore.getState().selectedGoals.length === 0) {
        setSelectedGoals(remote);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, selectedGoals, setSelectedGoals]);

  const completed = resolveOnboardingCompleted({
    sessionKind: sessionKindFromUser(user),
    localCompleted,
    storeCompleted,
    dbCompleted: user ? dbCompleted : null,
    dbFetchFailed: user ? dbFetchFailed : false,
  });

  useEffect(() => {
    if (!hydrated || sentHome) return;
    const sessionKind = sessionKindFromUser(user);
    if (sessionKind === "real" && dbCompleted === null && !dbFetchFailed) return;
    if (!completed) return;
    setSentHome(true);
    router.replace(ROUTES.TABS as never);
  }, [hydrated, completed, user, dbCompleted, dbFetchFailed, sentHome, router]);

  useEffect(() => {
    if (rawStep !== step) setV2Step(step);
  }, [rawStep, step, setV2Step]);

  useEffect(() => {
    if (!hydrated || !localReady || completed) return;
    track({ name: "onboarding_started" });
  }, [hydrated, localReady, completed]);

  const goNext = useCallback(() => {
    const idx = ONBOARDING_V2_ORDER.indexOf(step);
    track({ name: "onboarding_step_completed", step: idx, total: ONBOARDING_V2_ORDER.length, step_name: step });
    const next = ONBOARDING_V2_ORDER[Math.min(idx + 1, ONBOARDING_V2_ORDER.length - 1)] ?? step;
    setV2Step(next);
  }, [step, setV2Step]);

  const goBack = useCallback(() => {
    if (step === "welcome") return;
    const idx = ONBOARDING_V2_ORDER.indexOf(step);
    const prev = ONBOARDING_V2_ORDER[Math.max(idx - 1, 0)] ?? "welcome";
    setV2Step(prev);
  }, [step, setV2Step]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step === "welcome") return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [step, goBack]);

  const goToLogin = useCallback(() => {
    router.push(ROUTES.AUTH_LOGIN as never);
  }, [router]);

  const handleAccountSuccess = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleBrowseAll = useCallback(async () => {
    await completeOnboardingV2();
    router.replace(ROUTES.TABS_DISCOVER as never);
  }, [router]);

  const handleProfileContinue = useCallback(async () => {
    await completeOnboardingV2();
    router.replace(ROUTES.TABS as never);
  }, [router]);

  const renderScreen = () => {
    switch (step) {
      case "welcome":
        return <WelcomeScreen onGetStarted={goNext} onHaveAccount={goToLogin} />;
      case "goals":
        return <GoalsScreen onContinue={goNext} />;
      case "why_proof":
        return <WhyProofScreen onContinue={goNext} onSkip={goNext} />;
      case "why_circle":
        return <WhyCircleScreen onContinue={goNext} onSkip={goNext} />;
      case "commitment":
        return <CommitmentScreen onContinue={goNext} />;
      case "first_challenge":
        return (
          <FirstChallengeScreen
            onJoin={(challengeId) => {
              setSelectedChallenge(challengeId);
              goNext();
            }}
            onSkip={goNext}
            onBrowse={handleBrowseAll}
          />
        );
      case "reminders":
        return <RemindersScreen onContinue={goNext} />;
      case "account":
        return <AccountScreen onAuthSuccess={handleAccountSuccess} onSkip={goNext} />;
      case "profile":
        return <ProfileScreen onContinue={handleProfileContinue} />;
    }
  };

  const sessionKind = sessionKindFromUser(user);
  const waitingOnDb = sessionKind === "real" && dbCompleted === null && !dbFetchFailed;
  if (!hydrated || !localReady || waitingOnDb || completed) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {step !== "welcome" ? <BackButton onPress={goBack} /> : null}
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: OBV2_COLOR.screen },
});

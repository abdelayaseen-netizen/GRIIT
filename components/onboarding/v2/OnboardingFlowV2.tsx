/**
 * OnboardingFlowV2 — Chunk A order.
 * No dead ends.
 *
 * Rendered by app/onboarding/index.tsx ONLY when FLAGS.ONBOARDING_V2 is true.
 */
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/store/onboardingStore";
import { cacheOnboardingCompleted } from "@/lib/onboarding-completed-cache";
import {
  ONBOARDING_V2_ORDER,
  peekOnboardingV2Exit,
  resolveOnboardingCompleted,
  resolveV2Step,
  sessionKindFromUser,
} from "@/lib/onboarding-v2-routing";
import { persistOnboardingV2Step, loadOnboardingV2Step } from "@/lib/onboarding-v2-step";
import { skipOnboardingV2 } from "@/lib/onboarding-v2-skip";
import { completeOnboardingV2 } from "@/components/onboarding/v2/completeOnboarding";
import { applyBrowseBack, applyBrowsePick } from "@/lib/onboarding-v2-browse";
import type { SuggestableChallenge } from "@/lib/onboarding-v2-suggest";
import type { AccountAuthKind } from "@/lib/onboarding-v2-account-name";
import { DS_V3 } from "@/lib/design-system";
import { OBV2_COLOR } from "./theme";
import { FlowChrome, StepFade } from "./ui";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/SignInScreen";
import WhyProofScreen from "./screens/WhyProofScreen";
import WhyCircleScreen from "./screens/WhyCircleScreen";
import GoalsScreen from "./screens/GoalsScreen";
import RemindersScreen from "./screens/RemindersScreen";
import AccountScreen from "./screens/AccountScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FirstChallengeScreen from "./screens/FirstChallengeScreen";
import BrowseAllPickerScreen from "./screens/BrowseAllPickerScreen";
import DayTargetScreen from "./screens/DayTargetScreen";
import { readOnboardingGoals, writeOnboardingGoals } from "@/lib/onboarding-v2-goals";
import { readTargetStreak, writeTargetStreak } from "@/lib/onboarding-v2-target-streak";

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
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);
  const targetStreak = useOnboardingStore((s) => s.targetStreak);
  const setTargetStreak = useOnboardingStore((s) => s.setTargetStreak);
  const setSelectedChallenge = useOnboardingStore((s) => s.setSelectedChallenge);
  const setSelectedChallengeMeta = useOnboardingStore((s) => s.setSelectedChallengeMeta);
  const step = resolveV2Step(rawStep);
  const [dbCompleted, setDbCompleted] = useState<boolean | null>(null);
  const [dbFetchFailed, setDbFetchFailed] = useState(false);
  const [sentHome, setSentHome] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInPrefill, setSignInPrefill] = useState<string | undefined>();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [stepReady, setStepReady] = useState(false);
  const accountNameOpen = useOnboardingStore((s) => s.accountNameOpen);
  const setAccountNameOpen = useOnboardingStore((s) => s.setAccountNameOpen);

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
        const done = flag === true;
        setDbCompleted(done);
        setDbFetchFailed(false);
        if (done) void cacheOnboardingCompleted();
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      if (targetStreak != null) {
        await writeTargetStreak(user.id, targetStreak);
        return;
      }
      const remote = await readTargetStreak(user.id);
      if (cancelled || remote == null) return;
      if (useOnboardingStore.getState().targetStreak == null) {
        setTargetStreak(remote);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, targetStreak, setTargetStreak]);

  const completed = resolveOnboardingCompleted({
    sessionKind: sessionKindFromUser(user),
    dbCompleted: user ? dbCompleted : null,
  });

  useEffect(() => {
    if (!hydrated || sentHome) return;
    const sessionKind = sessionKindFromUser(user);
    if (sessionKind === "real" && dbCompleted === null && !dbFetchFailed) return;
    if (!completed) return;
    setSentHome(true);
    router.replace((peekOnboardingV2Exit() ?? ROUTES.TABS) as never);
  }, [hydrated, completed, user, dbCompleted, dbFetchFailed, sentHome, router]);

  useEffect(() => {
    if (rawStep !== step) setV2Step(step);
  }, [rawStep, step, setV2Step]);

  useEffect(() => {
    if (!hydrated || completed) return;
    let cancelled = false;
    void loadOnboardingV2Step().then((stored) => {
      if (cancelled) return;
      if (stored) setV2Step(stored);
      setStepReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, completed, setV2Step]);

  useEffect(() => {
    if (!stepReady || completed) return;
    void persistOnboardingV2Step(step);
  }, [stepReady, completed, step]);

  useEffect(() => {
    if (step !== "first_challenge" && browseOpen) setBrowseOpen(false);
  }, [step, browseOpen]);

  useEffect(() => {
    if (step !== "account" && accountNameOpen) setAccountNameOpen(false);
  }, [step, accountNameOpen, setAccountNameOpen]);

  useEffect(() => {
    if (!hydrated || completed) return;
    track({ name: "onboarding_started" });
  }, [hydrated, completed]);

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
      if (signInOpen) {
        setSignInOpen(false);
        return true;
      }
      if (accountNameOpen) {
        setAccountNameOpen(false);
        return true;
      }
      if (browseOpen) {
        const next = applyBrowseBack(useOnboardingStore.getState().selectedChallengeId);
        setBrowseOpen(next.phase === "open");
        return true;
      }
      if (step === "welcome") return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [step, goBack, signInOpen, browseOpen, accountNameOpen, setAccountNameOpen]);

  const goToLogin = useCallback((prefill?: string) => {
    setSignInPrefill(prefill);
    setSignInOpen(true);
  }, []);

  const handleSignInSuccess = useCallback(() => {
    setSignInOpen(false);
    setSignInPrefill(undefined);
  }, []);

  const handleAccountSuccess = useCallback(
    (_kind: AccountAuthKind) => {
      setAccountNameOpen(false);
      goNext();
    },
    [goNext, setAccountNameOpen]
  );

  const handleBrowseSelect = useCallback(
    (challenge: SuggestableChallenge) => {
      const next = applyBrowsePick(challenge.id);
      setSelectedChallenge(next.selectedChallengeId);
      setSelectedChallengeMeta({
        id: challenge.id,
        title: challenge.title ?? null,
        taskCount: Array.isArray(challenge.tasks) ? challenge.tasks.length : 0,
        durationDays: challenge.duration_days ?? null,
      });
      setBrowseOpen(next.phase === "open");
    },
    [setSelectedChallenge, setSelectedChallengeMeta]
  );

  const handleBrowseBack = useCallback(() => {
    const next = applyBrowseBack(useOnboardingStore.getState().selectedChallengeId);
    setBrowseOpen(next.phase === "open");
  }, []);

  const handleFinish = useCallback(async () => {
    await completeOnboardingV2();
    router.replace((peekOnboardingV2Exit() ?? ROUTES.TABS) as never);
  }, [router]);

  const handleSkip = useCallback(async () => {
    await skipOnboardingV2();
    router.replace((peekOnboardingV2Exit() ?? ROUTES.TABS) as never);
  }, [router]);

  const renderScreen = () => {
    if (signInOpen) {
      return (
        <SignInScreen
          initialEmail={signInPrefill}
          onBack={() => {
            setSignInOpen(false);
            setSignInPrefill(undefined);
          }}
          onSuccess={handleSignInSuccess}
        />
      );
    }
    switch (step) {
      case "welcome":
        return <WelcomeScreen onGetStarted={goNext} onHaveAccount={() => goToLogin()} />;
      case "goals":
        return <GoalsScreen onContinue={goNext} onBack={goBack} />;
      case "why_proof":
        return <WhyProofScreen onContinue={goNext} onSkip={() => void handleSkip()} onBack={goBack} />;
      case "why_circle":
        return <WhyCircleScreen onContinue={goNext} onSkip={() => void handleSkip()} onBack={goBack} />;
      case "commitment":
        return <DayTargetScreen onContinue={goNext} onBack={goBack} />;
      case "first_challenge":
        if (browseOpen) {
          return <BrowseAllPickerScreen onSelect={handleBrowseSelect} />;
        }
        return (
          <FirstChallengeScreen
            onJoin={(challengeId) => {
              setSelectedChallenge(challengeId);
              goNext();
            }}
            onSkip={goNext}
            onBrowse={() => setBrowseOpen(true)}
            onBack={goBack}
          />
        );
      case "reminders":
        return <RemindersScreen onContinue={goNext} onBack={goBack} />;
      case "account":
        return (
          <AccountScreen
            onAuthSuccess={handleAccountSuccess}
            onContinue={goNext}
            onSkip={goNext}
            onSignInWithAccount={goToLogin}
            onBack={goBack}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            onContinue={() => void handleFinish()}
            onSkip={() => void handleFinish()}
            onBack={goBack}
          />
        );
    }
  };

  const sessionKind = sessionKindFromUser(user);
  const waitingOnDb = sessionKind === "real" && dbCompleted === null && !dbFetchFailed;
  // After create/upgrade the session is "real" and dbCompleted is still null.
  // Do not blank the name step (or Invite after it) behind that overlay.
  const holdForDb = waitingOnDb && step === "welcome";
  if (!hydrated || holdForDb || completed) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const welcome = step === "welcome" && !signInOpen;
  const usesChrome =
    !browseOpen &&
    (step === "goals" ||
      step === "why_proof" ||
      step === "why_circle" ||
      step === "commitment" ||
      step === "first_challenge" ||
      step === "reminders" ||
      step === "account" ||
      step === "profile");
  return (
    <SafeAreaView style={[styles.safeArea, (welcome || usesChrome) && styles.welcome]}>
      {step !== "welcome" && !signInOpen && !usesChrome ? (
        <FlowChrome
          step={step}
          onBack={
            accountNameOpen
              ? () => setAccountNameOpen(false)
              : browseOpen
                ? handleBrowseBack
                : goBack
          }
        />
      ) : null}
      <StepFade
        stepKey={
          signInOpen ? "signin" : accountNameOpen ? "account-name" : browseOpen ? "browse-all" : step
        }
      >
        {renderScreen()}
      </StepFade>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: OBV2_COLOR.screen },
  welcome: { backgroundColor: DS_V3.color.canvas },
});

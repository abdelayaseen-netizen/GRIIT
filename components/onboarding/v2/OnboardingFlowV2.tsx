/**
 * OnboardingFlowV2 — v4 order without the mode screen.
 *
 * TODO(mode): per-enrollment difficulty needs an `active_challenges.mode`
 * column (standard | committed | hard) before the handoff Mode screen can
 * return. Do not route to CommitmentScreen. Store field stays unused.
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
  peekOnboardingV2Exit,
  resolveOnboardingCompleted,
  resolveV2Step,
  sessionKindFromUser,
} from "@/lib/onboarding-v2-routing";
import { exitOnboardingV2 } from "@/lib/onboarding-v2-exit";
import { applyBrowseBack, applyBrowsePick } from "@/lib/onboarding-v2-browse";
import type { SuggestableChallenge } from "@/lib/onboarding-v2-suggest";
import {
  nextAfterAccountAuth,
  type AccountAuthKind,
} from "@/lib/onboarding-v2-account-name";
import { OBV2_COLOR } from "./theme";
import { FlowChrome, StepFade } from "./ui";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/SignInScreen";
import WhyProofScreen from "./screens/WhyProofScreen";
import WhyCircleScreen from "./screens/WhyCircleScreen";
import GoalsScreen from "./screens/GoalsScreen";
import RemindersScreen from "./screens/RemindersScreen";
import AccountScreen from "./screens/AccountScreen";
import AccountNameScreen from "./screens/AccountNameScreen";
import FirstChallengeScreen from "./screens/FirstChallengeScreen";
import BrowseAllPickerScreen from "./screens/BrowseAllPickerScreen";
import InviteScreen from "./screens/InviteScreen";
import DayOneScreen from "./screens/DayOneScreen";
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
  const setSelectedChallengeMeta = useOnboardingStore((s) => s.setSelectedChallengeMeta);
  const step = resolveV2Step(rawStep);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [dbCompleted, setDbCompleted] = useState<boolean | null>(null);
  const [dbFetchFailed, setDbFetchFailed] = useState(false);
  const [sentHome, setSentHome] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInPrefill, setSignInPrefill] = useState<string | undefined>();
  const [browseOpen, setBrowseOpen] = useState(false);
  const accountNameOpen = useOnboardingStore((s) => s.accountNameOpen);
  const setAccountNameOpen = useOnboardingStore((s) => s.setAccountNameOpen);

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
    router.replace((peekOnboardingV2Exit() ?? ROUTES.TABS) as never);
  }, [hydrated, completed, user, dbCompleted, dbFetchFailed, sentHome, router]);

  useEffect(() => {
    if (rawStep !== step) setV2Step(step);
  }, [rawStep, step, setV2Step]);

  useEffect(() => {
    if (step !== "challenge" && browseOpen) setBrowseOpen(false);
  }, [step, browseOpen]);

  useEffect(() => {
    if (step !== "account" && accountNameOpen) setAccountNameOpen(false);
  }, [step, accountNameOpen, setAccountNameOpen]);

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
    (kind: AccountAuthKind) => {
      if (nextAfterAccountAuth(kind) === "account_name") {
        setAccountNameOpen(true);
        return;
      }
      setAccountNameOpen(false);
      goNext();
    },
    [goNext, setAccountNameOpen]
  );

  const leaveAccountName = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleBrowseAll = useCallback(() => {
    setBrowseOpen(true);
  }, []);

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

  const handleDayOneStart = useCallback(async () => {
    const result = await exitOnboardingV2(ROUTES.TABS);
    if (!result.ok) return;
    router.replace(ROUTES.TABS as never);
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
        return <GoalsScreen onContinue={goNext} />;
      case "proof":
        return <WhyProofScreen onContinue={goNext} onSkip={goNext} />;
      case "circle":
        return <WhyCircleScreen onContinue={goNext} onSkip={goNext} />;
      case "challenge":
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
            onBrowse={handleBrowseAll}
          />
        );
      case "reminder":
        return <RemindersScreen onContinue={goNext} />;
      case "account":
        if (accountNameOpen) {
          return <AccountNameScreen onContinue={leaveAccountName} onSkip={leaveAccountName} />;
        }
        return (
          <AccountScreen
            onAuthSuccess={handleAccountSuccess}
            onSkip={goNext}
            onSignInWithAccount={goToLogin}
          />
        );
      case "invite":
        return <InviteScreen onContinue={goNext} onSkip={goNext} />;
      case "dayone":
        return <DayOneScreen onStart={handleDayOneStart} />;
    }
  };

  const sessionKind = sessionKindFromUser(user);
  const waitingOnDb = sessionKind === "real" && dbCompleted === null && !dbFetchFailed;
  // After create/upgrade the session is "real" and dbCompleted is still null.
  // Do not blank the name step (or Invite after it) behind that overlay.
  const holdForDb = waitingOnDb && step === "account" && !accountNameOpen;
  if (!hydrated || !localReady || holdForDb || completed) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {step !== "welcome" && !signInOpen ? (
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
});

/**
 * CreateWizardV2 — 3-step challenge creation wizard.
 * Visual layer on DS_V3. WizardState and create payload are unchanged.
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import KeyboardDock, { NumberPadDoneBar } from "@/components/ds/KeyboardDock";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { nextStepAfterPrimary, pressIsEcho } from "@/lib/create-step-advance";

import { DS_V3 } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/backend/trpc/app-router";
import { TRPC } from "@/lib/trpc-paths";
import { trpcMutate } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";
import { StepReview } from "@/components/create/v2/StepReview";
import { LaunchedScreen } from "@/components/create/v2/LaunchedScreen";

import {
  StepBasics,
  type WizardWho,
} from "@/components/create/v2/StepBasics";
import {
  StepTasks,
  type WizardPack,
  type WizardTask,
} from "@/components/create/v2/StepTasks";
import {
  StepRules,
  type WizardDifficulty,
} from "@/components/create/v2/StepRules";
import { type WizardCategory } from "@/lib/challenge-category";
import {
  createVisibility,
  type CreateVisibility,
} from "@/backend/lib/create-visibility";
import { reviewLateJoinState } from "@/lib/late-join";
import { canSaveWizardTasks, savedWizardTasks } from "@/lib/wizard-saved-tasks";
import { day1SentenceFromStart, predictedDay1Sentence } from "@/lib/day1-sentence";
import { getTodayDateKey } from "@/lib/date-utils";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { WizardFooter, WizardHeader } from "@/components/create/v2/WizardChrome";
import AddTaskSheet from "@/components/create/AddTaskSheet";
import { draftFromWizardTask } from "@/lib/add-task-draft";
import { mapWizardTaskToCreateInput } from "@/lib/create-wizard-payload";
import { JOIN_CAPTION_TOMORROW, day1StartCopy } from "@/lib/challenge-detail-mapping";
import { resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import {
  FREE_ACTIVE_LIMIT_MESSAGE,
  wizardBlockedByFreeLimit,
} from "@/lib/free-challenge-limit";

type CreateChallengeInput = inferRouterInputs<AppRouter>["challenges"]["create"];
type CreateChallengeOutput = inferRouterOutputs<AppRouter>["challenges"]["create"];

type WizardStep = 1 | 2 | 3;

export type WizardState = {
  step: WizardStep;
  title: string;
  durationDays: number | null;
  customDuration: string;
  who: WizardWho;
  pack: WizardPack | null;
  customTasks: WizardTask[];
  useCustom: boolean;
  difficulty: WizardDifficulty;
  visibility: CreateVisibility;
  category: WizardCategory | null;
};

const INITIAL_STATE: WizardState = {
  step: 1,
  title: "",
  durationDays: 7,
  customDuration: "",
  who: "solo",
  pack: null,
  customTasks: [],
  useCustom: false,
  difficulty: "standard",
  visibility: "PRIVATE",
  category: null,
};

function canAdvanceStep1(s: WizardState): boolean {
  if (s.title.trim().length < 3) return false;
  if (s.title.length > 60) return false;
  if (!s.category) return false;
  if (s.durationDays == null || s.durationDays < 1) return false;
  return true;
}

function canAdvanceStep2(s: WizardState): boolean {
  return canSaveWizardTasks(savedWizardTasks(s.pack?.tasks, s.customTasks));
}

function canLaunch(s: WizardState): boolean {
  if (!canAdvanceStep1(s)) return false;
  if (!canAdvanceStep2(s)) return false;
  return true;
}

export function CreateWizardV2() {
  const scrollRef = useRef<ScrollView>(null);
  const titleY = useRef(0);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [cancelOpen, setCancelOpen] = useState<boolean>(false);
  const [newTaskOpen, setNewTaskOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [launchBusy, setLaunchBusy] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string>("");
  const { profile, isPremium } = useApp();
  const { user } = useAuth();
  const bootstrap = useHomeBootstrap(user?.id);
  const limitBlocked = wizardBlockedByFreeLimit({
    isPremium,
    enrollments: Array.isArray(bootstrap.data?.activeChallenges)
      ? (bootstrap.data.activeChallenges as { status?: string | null }[])
      : [],
  });
  const [launched, setLaunched] = useState<{
    title: string;
    days: number;
    group: boolean;
    challengeId: string;
    startAt?: string | null;
    tasks: WizardTask[];
  } | null>(null);

  const resetCreateFlow = useCallback(() => {
    setState(INITIAL_STATE);
    setReviewing(false);
    setCancelOpen(false);
    setNewTaskOpen(false);
    setEditingIndex(null);
    setLaunchBusy(false);
    setLaunchError("");
    setLaunched(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetCreateFlow();
    }, [resetCreateFlow]),
  );

  const isDirty = useMemo(() => {
    return (
      state.title.trim().length > 0 ||
      state.customTasks.length > 0 ||
      state.pack !== null
    );
  }, [state.title, state.customTasks.length, state.pack]);

  const setStep = useCallback((next: WizardStep) => {
    setState((p) => ({ ...p, step: next }));
  }, []);

  const setTitle = useCallback((v: string) => {
    setState((p) => ({ ...p, title: v }));
  }, []);
  const setDuration = useCallback((days: number | null) => {
    setState((p) => ({ ...p, durationDays: days, customDuration: days == null ? p.customDuration : "" }));
  }, []);
  const setCustomDuration = useCallback((v: string) => {
    setState((p) => ({ ...p, customDuration: v }));
  }, []);
  const setWho = useCallback((who: WizardWho) => {
    setState((p) => ({
      ...p,
      who,
      visibility: who === "group" ? "PRIVATE" : p.visibility,
    }));
  }, []);
  const setPack = useCallback((pack: WizardPack | null) => {
    setState((p) => {
      if (!pack) return { ...p, pack };
      const difficulty = pack.difficulty ?? INITIAL_STATE.difficulty;
      return {
        ...p,
        pack,
        category: p.category ?? pack.category,
        durationDays: pack.durationDays ?? p.durationDays ?? INITIAL_STATE.durationDays,
        difficulty,
        customDuration: "",
      };
    });
  }, []);
  const setUseCustom = useCallback((v: boolean) => {
    setState((p) => ({ ...p, useCustom: v }));
  }, []);
  const addCustomTask = useCallback((task: WizardTask) => {
    setState((p) => ({ ...p, customTasks: [...p.customTasks, task] }));
  }, []);
  const replaceCustomTask = useCallback((index: number, task: WizardTask) => {
    setState((p) => ({
      ...p,
      customTasks: p.customTasks.map((row, i) => (i === index ? task : row)),
    }));
  }, []);
  const setDifficulty = useCallback((d: WizardDifficulty) => {
    setState((p) => ({ ...p, difficulty: d }));
  }, []);
  const setVisibility = useCallback((visibility: CreateVisibility) => {
    setState((p) => ({ ...p, visibility }));
  }, []);
  const setCategory = useCallback((c: WizardCategory) => {
    setState((p) => ({ ...p, category: c }));
  }, []);

  const handleCancel = useCallback(() => {
    if (reviewing) {
      setReviewing(false);
      return;
    }
    if (state.step !== 1) {
      setStep((state.step - 1) as WizardStep);
      return;
    }
    if (isDirty) {
      setCancelOpen(true);
    } else {
      router.back();
    }
  }, [isDirty, reviewing, router, setStep, state.step]);

  // 06.8: one press, one step. Computed from the previous state (not the closed-over
  // one) and a short lock drops the second tap of a double-tap.
  const lastAdvanceAt = useRef(0);
  const handlePrimary = useCallback(() => {
    const now = Date.now();
    if (pressIsEcho(lastAdvanceAt.current, now)) return;
    lastAdvanceAt.current = now;
    if (state.step === 3) {
      if (canLaunch(state)) {
        setLaunchError("");
        setReviewing(true);
      }
      return;
    }
    setState((p) => {
      const next = nextStepAfterPrimary(p, { step1: canAdvanceStep1, step2: canAdvanceStep2 });
      return next === p.step ? p : { ...p, step: next };
    });
  }, [state]);

  const primaryDisabled =
    (state.step === 1 && !canAdvanceStep1(state)) ||
    (state.step === 2 && !canAdvanceStep2(state)) ||
    (state.step === 3 && !canLaunch(state));

  const handleLaunch = useCallback(async () => {
    if (limitBlocked) return;
    setLaunchError("");
    setLaunchBusy(true);
    try {
      const tasksForApi = savedWizardTasks(state.pack?.tasks, state.customTasks);

      const payload: CreateChallengeInput = {
        title: state.title.trim(),
        description: "",
        type: "standard",
        durationDays: state.durationDays ?? 7,
        difficulty: state.difficulty,
        isHardMode: state.difficulty === "hard",
        status: "published",
        categories: state.category ? [state.category] : [],
        participationType: state.who === "group" ? "team" : "solo",
        teamSize: state.who === "group" ? 10 : 1,
        visibility: createVisibility(
          state.who === "group" ? "team" : "solo",
          state.visibility,
        ),
        replayPolicy: "allow_replay",
        showReplayLabel: false,
        requireSameRules: state.difficulty === "hard",
        liveDate: "",
        tasks: tasksForApi.map((t) =>
          mapWizardTaskToCreateInput(t, { requirePhoto: false, allowPhoto: true }),
        ),
      };

      const result = (await trpcMutate(
        TRPC.challenges.create,
        payload,
      )) as CreateChallengeOutput;
      if (!result?.id) {
        throw new Error("Create returned no id.");
      }
      trackEvent("challenge_created", {
        challenge_id: result.id,
        source: state.useCustom ? "custom" : "pack",
        pack_id: state.useCustom ? undefined : state.pack?.id,
        length_days: state.durationDays ?? 7,
        mode: state.who === "group" ? "group" : "solo",
        strictness: state.difficulty,
        task_count: tasksForApi.length,
        has_verified_task: tasksForApi.some((t) => t.requirePhoto === true),
      });
      void queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      setReviewing(false);
      const startAt =
        (result as { start_at?: string | null }).start_at ??
        (result as { activeChallenge?: { start_at?: string } | null }).activeChallenge?.start_at ??
        null;
      setLaunched({
        title: state.title.trim(),
        days: state.durationDays ?? 7,
        group: state.who === "group",
        challengeId: result.id,
        startAt,
        tasks: tasksForApi,
      });
    } catch (err) {
      captureError(err, "CreateWizardV2Launch");
      const msg = err instanceof Error ? err.message : "";
      setLaunchError(msg || "Could not launch.");
    } finally {
      setLaunchBusy(false);
    }
  }, [state, queryClient, limitBlocked]);

  const launchState = launchBusy ? "loading" : launchError ? "error" : "idle";
  const reviewTasks = savedWizardTasks(state.pack?.tasks, state.customTasks);
  const editingDraft = useMemo(() => {
    if (editingIndex == null) return null;
    return draftFromWizardTask(
      state.customTasks[editingIndex] ?? { name: "", type: "check_off" },
    );
  }, [editingIndex, state.customTasks]);
  const timeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );
  const securedKeys = Array.isArray(bootstrap.data?.securedDateKeys)
    ? (bootstrap.data.securedDateKeys as string[])
    : [];
  const predictedDay1 = predictedDay1Sentence({
    todaySecured: homeSecuredToday(securedKeys, getTodayDateKey(timeZone)),
    windowClosed: reviewLateJoinState(reviewTasks, timeZone).defer,
  });

  if (limitBlocked) {
    return (
      <View style={styles.flex}>
        <WizardHeader step={1} total={3} onCancel={() => router.replace(ROUTES.TABS_HOME as never)} />
        <Text style={styles.limitCopy}>{FREE_ACTIVE_LIMIT_MESSAGE}</Text>
        <WizardFooter>
          <Button
            label="Upgrade to GRIIT Pro"
            onPress={() => router.replace(ROUTES.PAYWALL as never)}
          />
        </WizardFooter>
      </View>
    );
  }

  if (launched) {
    const tomorrow =
      day1StartCopy(launched.startAt, timeZone) === JOIN_CAPTION_TOMORROW;
    return (
      <LaunchedScreen
        title={launched.title}
        days={launched.days}
        group={launched.group}
        tomorrow={tomorrow}
        tasks={launched.tasks}
        timeZone={timeZone}
        day1Line={day1SentenceFromStart(launched.startAt, timeZone)}
        onHome={() => router.replace(ROUTES.TABS_HOME as never)}
        onInvite={
          launched.group
            ? () => {
                router.push(ROUTES.CHALLENGE_INVITE(launched.challengeId) as never);
              }
            : undefined
        }
        onStartToday={() => router.replace(ROUTES.TABS_HOME as never)}
      />
    );
  }

  if (reviewing) {
    const late = reviewLateJoinState(reviewTasks, timeZone);
    return (
      <View style={styles.flex}>
        <StepReview
          title={state.title}
          category={state.category}
          days={state.durationDays ?? 7}
          who={state.who}
          difficulty={state.difficulty}
          visibility={state.visibility}
          starts={predictedDay1}
          lateJoinLine={late.line}
          tasks={reviewTasks}
          launchState={launchState}
          onBack={() => setReviewing(false)}
          onLaunch={() => void handleLaunch()}
          onEditStep={(step) => {
            setReviewing(false);
            setStep(step);
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardDock
      footer={
        <WizardFooter>
          {state.step === 2 &&
          state.useCustom &&
          state.customTasks.some((t) => !t.name.trim()) ? (
            <Text style={styles.secondary}>Name this task.</Text>
          ) : null}
          <Button
            label={
              state.step === 1 && (!state.title.trim() || !state.category)
                ? "Add a name and a category to continue."
                : state.step === 3
                  ? "Review"
                  : "Continue"
            }
            disabled={primaryDisabled}
            onPress={handlePrimary}
          />
        </WizardFooter>
      }
    >
      <NumberPadDoneBar />
      <View style={styles.flex}>
        <WizardHeader step={state.step} total={3} onCancel={handleCancel} />

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {state.step === 1 ? (
            <StepBasics
              title={state.title}
              onChangeTitle={setTitle}
              category={state.category}
              onChangeCategory={setCategory}
              onTitleLayout={(y) => {
                titleY.current = y;
              }}
              onTitleFocus={() => {
                // 06.8: keep the field you are typing in on screen. Scrolling to the
                // category block pushed the title above the top edge mid-word.
                scrollRef.current?.scrollTo({ y: Math.max(0, titleY.current - 8), animated: true });
              }}
              durationDays={state.durationDays}
              onChangeDuration={setDuration}
              customDuration={state.customDuration}
              onChangeCustomDuration={setCustomDuration}
              who={state.who}
              onChangeWho={setWho}
              day1Line={predictedDay1}
            />
          ) : null}
          {state.step === 2 ? (
            <StepTasks
              useCustom={state.useCustom}
              onChangeUseCustom={setUseCustom}
              pack={state.pack}
              onChangePack={setPack}
              customTasks={state.customTasks}
              onAddCustomTask={() => {
                setEditingIndex(null);
                setNewTaskOpen(true);
              }}
              onEditCustomTask={(index) => {
                setEditingIndex(index);
                setNewTaskOpen(true);
              }}
            />
          ) : null}
          {state.step === 3 ? (
            <StepRules
              difficulty={state.difficulty}
              onChangeDifficulty={setDifficulty}
              who={state.who}
              visibility={state.visibility}
              onChangeVisibility={setVisibility}
            />
          ) : null}
        </ScrollView>

        <Sheet
          visible={cancelOpen}
          onDismiss={() => setCancelOpen(false)}
          heading="Discard challenge?"
          footer={
            <>
              <Button
                label="Discard"
                destructive
                onPress={() => {
                  setCancelOpen(false);
                  router.back();
                }}
              />
              <Button
                label="Keep editing"
                variant="tertiary"
                onPress={() => setCancelOpen(false)}
              />
            </>
          }
        >
          <Text style={styles.secondary}>You&apos;ll lose what you&apos;ve entered so far.</Text>
        </Sheet>

        <AddTaskSheet
          visible={newTaskOpen}
          initial={editingDraft}
          onClose={() => {
            setEditingIndex(null);
            setNewTaskOpen(false);
          }}
          onSave={(task) => {
            if (editingIndex != null) replaceCustomTask(editingIndex, task);
            else addCustomTask(task);
            setEditingIndex(null);
            setNewTaskOpen(false);
          }}
        />
      </View>
    </KeyboardDock>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_V3.color.canvas },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  limitCopy: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
});

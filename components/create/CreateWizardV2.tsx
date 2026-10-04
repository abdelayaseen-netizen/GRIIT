/**
 * CreateWizardV2 — 3-step challenge creation wizard.
 * Visual layer on DS_V3. WizardState and create payload are unchanged.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

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
  durationDays: 30,
  customDuration: "",
  who: "solo",
  pack: null,
  customTasks: [],
  useCustom: false,
  difficulty: "standard",
  visibility: "PRIVATE",
  category: "discipline",
};

function canAdvanceStep1(s: WizardState): boolean {
  if (s.title.trim().length < 3) return false;
  if (s.title.length > 60) return false;
  if (s.durationDays == null || s.durationDays < 1) return false;
  return true;
}

function canAdvanceStep2(s: WizardState): boolean {
  if (s.useCustom) {
    return s.customTasks.length > 0 && s.customTasks.every((t) => t.name.trim().length > 0);
  }
  return !!s.pack;
}

function canLaunch(s: WizardState): boolean {
  if (!canAdvanceStep1(s)) return false;
  if (!canAdvanceStep2(s)) return false;
  return true;
}

export function CreateWizardV2() {
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
        category: pack.category,
        durationDays: pack.durationDays ?? INITIAL_STATE.durationDays,
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

  const handlePrimary = useCallback(() => {
    if (state.step === 1) {
      if (canAdvanceStep1(state)) setStep(2);
      return;
    }
    if (state.step === 2) {
      if (canAdvanceStep2(state)) setStep(3);
      return;
    }
    if (state.step === 3) {
      if (canLaunch(state)) {
        setLaunchError("");
        setReviewing(true);
      }
    }
  }, [state, setStep]);

  const primaryDisabled =
    (state.step === 1 && !canAdvanceStep1(state)) ||
    (state.step === 2 && !canAdvanceStep2(state)) ||
    (state.step === 3 && !canLaunch(state));

  const handleLaunch = useCallback(async () => {
    if (limitBlocked) return;
    setLaunchError("");
    setLaunchBusy(true);
    try {
      const tasksForApi = state.useCustom
        ? state.customTasks
        : state.pack?.tasks ?? [];

      const payload: CreateChallengeInput = {
        title: state.title.trim(),
        description: "",
        type: "standard",
        durationDays: state.durationDays ?? 30,
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
        length_days: state.durationDays ?? 30,
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
        days: state.durationDays ?? 30,
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
  const reviewTasks = state.useCustom ? state.customTasks : state.pack?.tasks ?? [];
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

  if (limitBlocked) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        <WizardHeader step={1} total={3} onCancel={() => router.replace(ROUTES.TABS_HOME as never)} />
        <Text style={styles.limitCopy}>{FREE_ACTIVE_LIMIT_MESSAGE}</Text>
        <WizardFooter>
          <Button
            label="Upgrade to GRIIT Pro"
            onPress={() => router.replace(ROUTES.PAYWALL as never)}
          />
        </WizardFooter>
      </SafeAreaView>
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
        onHome={() => router.replace(ROUTES.TABS_HOME as never)}
        onInvite={
          launched.group
            ? () => {
                router.push(ROUTES.CHALLENGE_INVITE(launched.challengeId) as never);
              }
            : undefined
        }
      />
    );
  }

  if (reviewing) {
    const late = reviewLateJoinState(reviewTasks, timeZone);
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        <StepReview
          title={state.title}
          category={state.category}
          days={state.durationDays ?? 30}
          who={state.who}
          difficulty={state.difficulty}
          visibility={state.visibility}
          starts={late.starts}
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
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        <WizardHeader step={state.step} total={3} onCancel={handleCancel} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {state.step === 1 ? (
            <StepBasics
              title={state.title}
              onChangeTitle={setTitle}
              category={state.category}
              onChangeCategory={setCategory}
              durationDays={state.durationDays}
              onChangeDuration={setDuration}
              customDuration={state.customDuration}
              onChangeCustomDuration={setCustomDuration}
              who={state.who}
              onChangeWho={setWho}
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

        <WizardFooter>
          {state.step === 2 &&
          state.useCustom &&
          state.customTasks.some((t) => !t.name.trim()) ? (
            <Text style={styles.secondary}>Name this task.</Text>
          ) : null}
          <Button
            label={
              state.step === 1 && state.title.trim().length < 3
                ? "Name the challenge to continue."
                : state.step === 3
                  ? "Review"
                  : "Continue"
            }
            disabled={primaryDisabled}
            onPress={handlePrimary}
          />
        </WizardFooter>

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
      </SafeAreaView>
    </KeyboardAvoidingView>
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

/**
 * CreateWizardV2 — 3-step challenge creation wizard.
 * Visual layer on DS_V3. WizardState and create payload are unchanged.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import { DS_V3 } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/backend/trpc/app-router";
import { TRPC } from "@/lib/trpc-paths";
import { trpcMutate } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { Button, EmptyState } from "@/components/ds";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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
  type WizardCategory,
  type WizardDifficulty,
  type WizardPhotoProof,
} from "@/components/create/v2/StepRules";
import { WizardFooter, WizardHeader } from "@/components/create/v2/WizardChrome";
import { NewTaskSheet } from "@/components/create/NewTaskSheet";
import { mapWizardTaskToCreateInput } from "@/lib/create-wizard-payload";
import { effectivePhotoProof, reviewPhotoLine } from "@/lib/create-wizard-hard-proof";
import { FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";

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
  photoProof: WizardPhotoProof;
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
  photoProof: "optional",
  category: "discipline",
};

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 6;

function daysLabel(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

function canAdvanceStep1(s: WizardState): boolean {
  if (s.title.trim().length < 3) return false;
  if (s.title.length > 60) return false;
  if (s.durationDays == null || s.durationDays < 1) return false;
  return true;
}

function canAdvanceStep2(s: WizardState): boolean {
  if (s.useCustom) return s.customTasks.length > 0;
  return !!s.pack;
}

function canLaunch(s: WizardState): boolean {
  if (!canAdvanceStep1(s)) return false;
  if (!canAdvanceStep2(s)) return false;
  return true;
}

function reviewRows(s: WizardState): { text: string; step: WizardStep }[] {
  const tasksCount = s.useCustom ? s.customTasks.length : s.pack?.tasks.length ?? 0;
  return [
    { text: `${s.title.trim()} · ${daysLabel(s.durationDays ?? 0)}`, step: 1 },
    { text: s.who === "group" ? "Group" : "Solo", step: 1 },
    {
      text: `${tasksCount} ${tasksCount === 1 ? "task" : "tasks"} · ${s.difficulty === "hard" ? "Hard mode" : "Standard"}`,
      step: 2,
    },
    { text: reviewPhotoLine(s.difficulty, s.photoProof), step: 3 },
    { text: s.category ? `Category ${s.category}` : "Category", step: 3 },
  ];
}

export function CreateWizardV2() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [cancelOpen, setCancelOpen] = useState<boolean>(false);
  const [newTaskOpen, setNewTaskOpen] = useState<boolean>(false);
  const [launchBusy, setLaunchBusy] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string>("");
  const [launched, setLaunched] = useState<{ title: string; group: boolean } | null>(null);

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
    setState((p) => ({ ...p, who }));
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
        photoProof: effectivePhotoProof(difficulty, p.photoProof),
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
  const removeCustomTask = useCallback((index: number) => {
    setState((p) => ({
      ...p,
      customTasks: p.customTasks.filter((_, i) => i !== index),
    }));
  }, []);
  const setDifficulty = useCallback((d: WizardDifficulty) => {
    setState((p) => ({
      ...p,
      difficulty: d,
      photoProof: effectivePhotoProof(d, p.photoProof),
    }));
  }, []);
  const setPhotoProof = useCallback((v: WizardPhotoProof) => {
    setState((p) => ({
      ...p,
      photoProof: effectivePhotoProof(p.difficulty, v),
    }));
  }, []);
  const setCategory = useCallback((c: WizardCategory) => {
    setState((p) => ({ ...p, category: c }));
  }, []);

  const handleCancel = useCallback(() => {
    if (state.step !== 1) {
      setStep((state.step - 1) as WizardStep);
      return;
    }
    if (isDirty) {
      setCancelOpen(true);
    } else {
      router.back();
    }
  }, [isDirty, router, setStep, state.step]);

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
        setConfirmOpen(true);
      }
    }
  }, [state, setStep]);

  const primaryDisabled =
    (state.step === 1 && !canAdvanceStep1(state)) ||
    (state.step === 2 && !canAdvanceStep2(state)) ||
    (state.step === 3 && !canLaunch(state));

  const handleLaunch = useCallback(async () => {
    setLaunchError("");
    setLaunchBusy(true);
    try {
      const tasksForApi = state.useCustom
        ? state.customTasks
        : state.pack?.tasks ?? [];

      const photoProof = effectivePhotoProof(state.difficulty, state.photoProof);
      const requirePhoto = photoProof === "required";
      const allowPhoto = photoProof !== "off";

      const payload: CreateChallengeInput = {
        title: state.title.trim(),
        description: "",
        type: "standard",
        durationDays: state.durationDays ?? 30,
        difficulty: state.difficulty,
        status: "published",
        categories: state.category ? [state.category] : [],
        participationType: state.who === "group" ? "team" : "solo",
        teamSize: state.who === "group" ? 10 : 1,
        visibility: state.who === "group" ? "FRIENDS" : "PUBLIC",
        replayPolicy: "allow_replay",
        showReplayLabel: false,
        requireSameRules: state.difficulty === "hard",
        liveDate: "",
        tasks: tasksForApi.map((t) =>
          mapWizardTaskToCreateInput(t, { requirePhoto, allowPhoto }),
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
        public_proof: photoProof,
        task_count: tasksForApi.length,
        has_verified_task: tasksForApi.some((t) => t.requirePhoto === true),
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      setConfirmOpen(false);
      setLaunched({ title: state.title.trim(), group: state.who === "group" });
    } catch (err) {
      captureError(err, "CreateWizardV2Launch");
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes(FREE_ACTIVE_LIMIT_MESSAGE) || msg.includes("FREE_LIMIT_REACHED")) {
        router.push(ROUTES.PAYWALL as never);
        return;
      }
      setLaunchError(msg || "Could not launch.");
    } finally {
      setLaunchBusy(false);
    }
  }, [state, queryClient, router]);

  const rows = useMemo(() => reviewRows(state), [state]);
  const launchState = launchBusy ? "loading" : launchError ? "error" : "idle";

  if (launched) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        <View style={styles.launchedBody}>
          <Text style={styles.launchedTitle}>You&apos;re in.</Text>
          <Text style={styles.secondary}>Day 1 begins tomorrow morning.</Text>
          <Text style={styles.bodyStrong}>{launched.title}</Text>
        </View>
        <View style={styles.launchedFooter}>
          {launched.group ? (
            <Button
              label="Invite friends"
              variant="secondary"
              onPress={() => {
                void Share.share({ message: launched.title });
              }}
            />
          ) : null}
          <Button
            label="Back to Home"
            onPress={() => router.replace(ROUTES.TABS_HOME as never)}
          />
        </View>
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
              onAddCustomTask={() => setNewTaskOpen(true)}
              onRemoveCustomTask={removeCustomTask}
            />
          ) : null}
          {state.step === 3 ? (
            <StepRules
              difficulty={state.difficulty}
              onChangeDifficulty={setDifficulty}
              photoProof={effectivePhotoProof(state.difficulty, state.photoProof)}
              onChangePhotoProof={setPhotoProof}
              category={state.category}
              onChangeCategory={setCategory}
            />
          ) : null}
        </ScrollView>

        <WizardFooter>
          <Button
            label={state.step === 3 ? "Review" : "Continue"}
            disabled={primaryDisabled}
            onPress={handlePrimary}
          />
        </WizardFooter>

        <ConfirmDialog
          visible={cancelOpen}
          title="Discard challenge?"
          message="You'll lose what you've entered so far."
          confirmLabel="Discard"
          onCancel={() => setCancelOpen(false)}
          onConfirm={() => {
            setCancelOpen(false);
            router.back();
          }}
        />

        <Modal
          visible={confirmOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setConfirmOpen(false)}
        >
          <View style={styles.sheetRoot}>
            <Pressable
              style={styles.dim}
              accessibilityRole="button"
              accessibilityLabel="Close review"
              onPress={() => setConfirmOpen(false)}
            />
            <View style={[styles.sheet, launchState === "error" ? styles.sheetError : styles.sheetIdle]}>
              <View style={styles.grabberWrap}>
                <View style={styles.grabber} />
              </View>
              <View style={styles.sheetTitleRow}>
                <Text style={styles.bodyStrong}>Review and launch</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close review"
                  onPress={() => setConfirmOpen(false)}
                  style={styles.closeHit}
                >
                  <X size={ICON} color={DS_V3.color.textPrimary} strokeWidth={2} />
                </Pressable>
              </View>
              <View style={styles.sheetRows}>
                {rows.map((r, i) => (
                  <View key={r.text}>
                    <View style={styles.reviewRow}>
                      <Text style={styles.body}>{r.text}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit"
                        onPress={() => {
                          setConfirmOpen(false);
                          setStep(r.step);
                        }}
                        style={styles.editHit}
                      >
                        <Text style={styles.edit}>Edit</Text>
                      </Pressable>
                    </View>
                    {i < rows.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
              {launchState === "error" ? (
                <View style={styles.errorWrap}>
                  <EmptyState
                    heading="Could not launch"
                    body="Check your connection and try again."
                    actionLabel="Retry"
                    variant="error"
                    onAction={() => void handleLaunch()}
                  />
                </View>
              ) : (
                <View style={styles.sheetFooter}>
                  <Button
                    label={launchState === "loading" ? "Launching" : "Launch"}
                    submitting={launchState === "loading"}
                    onPress={() => void handleLaunch()}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>

        <NewTaskSheet
          visible={newTaskOpen}
          onClose={() => setNewTaskOpen(false)}
          onSave={(task) => {
            addCustomTask(task);
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
  bodyStrong: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  body: {
    flex: 1,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  launchedBody: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.xs * 16,
    gap: DS_V3.space.md,
    justifyContent: "center",
  },
  launchedTitle: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  launchedFooter: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  sheetRoot: { flex: 1, justifyContent: "flex-end" },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.canvas,
    opacity: 0.65,
  },
  sheet: {
    backgroundColor: DS_V3.color.surface,
    borderTopLeftRadius: DS_V3.radius.card,
    borderTopRightRadius: DS_V3.radius.card,
    borderTopWidth: PT,
    borderColor: DS_V3.color.border,
  },
  sheetIdle: { minHeight: "55%" },
  sheetError: { minHeight: "70%" },
  grabberWrap: {
    alignItems: "center",
    paddingTop: DS_V3.space.sm,
  },
  grabber: {
    width: DS_V3.space.xs * 9,
    height: DS_V3.space.xs,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  sheetTitleRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeHit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  sheetRows: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
  },
  reviewRow: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  editHit: {
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
  },
  edit: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  divider: {
    height: PT,
    backgroundColor: DS_V3.color.border,
  },
  errorWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    paddingBottom: DS_V3.space.section,
  },
  sheetFooter: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
  },
});

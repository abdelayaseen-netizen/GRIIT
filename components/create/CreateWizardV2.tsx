/**
 * CreateWizardV2 — 3-step challenge creation wizard.
 *
 * Replaces the legacy 4-step `CreateChallengeWizard.tsx`:
 *   Step 1 (Basics)  — name, duration, solo/group
 *   Step 2 (Tasks)   — pick a starter pack OR add custom tasks
 *   Step 3 (Rules)   — difficulty, photo-proof policy, category, then confirm modal
 *
 * State is local — no AsyncStorage persistence in v2 (we ship that in a follow-up).
 * Launch fires `TRPC.challenges.create` directly via `trpcMutate`, then routes to
 * the active challenge detail. Inline error on failure (no popup alerts).
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { TRPC } from "@/lib/trpc-paths";
import { trpcMutate } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
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
import { NewTaskSheet } from "@/components/create/NewTaskSheet";

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

function canAdvanceStep1(s: WizardState): boolean {
  if (s.title.trim().length < 3) return false;
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

export function CreateWizardV2() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [cancelOpen, setCancelOpen] = useState<boolean>(false);
  const [newTaskOpen, setNewTaskOpen] = useState<boolean>(false);
  const [launchBusy, setLaunchBusy] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string>("");

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
      return {
        ...p,
        pack,
        category: pack.category,
        durationDays: pack.durationDays ?? INITIAL_STATE.durationDays,
        difficulty: pack.difficulty ?? INITIAL_STATE.difficulty,
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
    setState((p) => ({ ...p, difficulty: d }));
  }, []);
  const setPhotoProof = useCallback((v: WizardPhotoProof) => {
    setState((p) => ({ ...p, photoProof: v }));
  }, []);
  const setCategory = useCallback((c: WizardCategory) => {
    setState((p) => ({ ...p, category: c }));
  }, []);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setCancelOpen(true);
    } else {
      router.back();
    }
  }, [isDirty, router]);

  const handleBack = useCallback(() => {
    if (state.step === 1) {
      handleCancel();
      return;
    }
    setStep((state.step - 1) as WizardStep);
  }, [state.step, handleCancel, setStep]);

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
      if (canLaunch(state)) setConfirmOpen(true);
    }
  }, [state, setStep]);

  const primaryCtaLabel = useMemo(() => {
    if (state.step === 1) {
      if (state.title.trim().length < 3) return "Enter a name to continue";
      if (state.durationDays == null) return "Pick a duration";
      return "Next: tasks";
    }
    if (state.step === 2) {
      if (!canAdvanceStep2(state)) return "Pick a pack or add a task";
      return "Next: rules";
    }
    return "Review & launch";
  }, [state]);

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

      const requirePhoto =
        state.photoProof === "required" || state.difficulty === "hard";
      const allowPhoto = state.photoProof !== "off";

      // TODO(run-backend): Run goal config (runGoalType / runTarget /
      // runTrackingMode / runUnit) is captured on the WizardTask but is NOT
      // persisted here on purpose. challenges.create has no goal_type /
      // tracking_mode columns yet — that schema is its own migration in a
      // follow-up PR (verify live). Do not partially map distance ->
      // strava_min_distance_meters: persisting distance while time/pace
      // silently drop is worse than clean UI behind one TODO. Related:
      //  - Completion post should carry distance + time + pace; the UI sets
      //    only the chosen goal, the other two are derived server-side.
      //  - "Manual only on Standard" must be enforced in the proof/completion
      //    engine, not the create sheet (difficulty isn't reliable at task-add).
      const payload = {
        title: state.title.trim(),
        description: "",
        type: "standard" as const,
        durationDays: state.durationDays ?? 30,
        difficulty: state.difficulty,
        status: "published" as const,
        categories: state.category ? [state.category] : [],
        participationType: state.who === "group" ? "team" : "solo",
        teamSize: state.who === "group" ? 10 : 1,
        visibility: state.who === "group" ? "FRIENDS" : "PUBLIC",
        replayPolicy: "ALLOW_REPLAY",
        showReplayLabel: false,
        requireSameRules: state.difficulty === "hard",
        liveDate: "",
        tasks: tasksForApi.map((t, i) => ({
          title: t.name,
          type: t.type,
          required: true,
          require_photo_proof: requirePhoto || (allowPhoto && t.requirePhoto === true),
          strict_timer_mode: state.difficulty === "hard" && t.type === "timer",
          duration_minutes: t.durationMinutes ?? null,
          min_words: t.minWords ?? null,
          order_index: i,
        })),
      };

      const result = (await trpcMutate(TRPC.challenges.create, payload)) as {
        id?: string;
      };
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
        public_proof: state.photoProof,
        task_count: tasksForApi.length,
        has_verified_task: tasksForApi.some((t) => t.requirePhoto === true),
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      router.replace(ROUTES.CHALLENGE_ACTIVE(result.id) as never);
    } catch (err) {
      captureError(err, "CreateWizardV2Launch");
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("FREE_LIMIT_REACHED")) {
        router.push(ROUTES.PAYWALL as never);
        return;
      }
      setLaunchError(msg || "Could not launch. Try again.");
    } finally {
      setLaunchBusy(false);
    }
  }, [state, queryClient, router]);

  const summaryLines = useMemo<string[]>(() => {
    const tasksCount = state.useCustom
      ? state.customTasks.length
      : state.pack?.tasks.length ?? 0;
    return [
      `${state.title.trim() || "Untitled"} · ${state.durationDays ?? 0} days`,
      state.who === "group" ? "Group · up to 10" : "Solo",
      `${tasksCount} ${tasksCount === 1 ? "task" : "tasks"} · ${state.difficulty === "hard" ? "Hard mode" : "Standard"}`,
      `Photo proof: ${state.photoProof}`,
      state.category ? `Category: ${state.category}` : "No category",
    ];
  }, [state]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
        <View style={styles.headerBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={state.step === 1 ? "Cancel and close" : "Go back"}
            hitSlop={8}
            onPress={handleBack}
            style={styles.headerBtn}
          >
            {state.step === 1 ? (
              <Text style={styles.cancelText}>Cancel</Text>
            ) : (
              <ChevronLeft
                size={20}
                color={DS_COLORS_V2.text.primary}
                strokeWidth={2}
              />
            )}
          </Pressable>
          <Text style={styles.stepLabel}>{`Step ${state.step} of 3`}</Text>
          <View style={styles.headerBtnSpacer} />
        </View>

        <View style={styles.progressRow}>
          {[1, 2, 3].map((n) => (
            <View
              key={n}
              style={[
                styles.progressSeg,
                n <= state.step
                  ? styles.progressSegActive
                  : styles.progressSegInactive,
              ]}
            />
          ))}
        </View>

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
              photoProof={state.photoProof}
              onChangePhotoProof={setPhotoProof}
              category={state.category}
              onChangeCategory={setCategory}
            />
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryCtaLabel}
            accessibilityState={{ disabled: primaryDisabled }}
            onPress={primaryDisabled ? undefined : handlePrimary}
            disabled={primaryDisabled}
            style={({ pressed }) => [
              styles.primaryBtn,
              primaryDisabled ? styles.primaryBtnDisabled : null,
              pressed && !primaryDisabled ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.primaryBtnText,
                primaryDisabled ? styles.primaryBtnTextDisabled : null,
              ]}
            >
              {primaryCtaLabel}
            </Text>
          </Pressable>
        </View>

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
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandleRow}>
                <View style={styles.modalHandle} />
              </View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Review &amp; launch</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close review"
                  hitSlop={8}
                  onPress={() => setConfirmOpen(false)}
                >
                  <X
                    size={18}
                    color={DS_COLORS_V2.text.tertiary}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
              {summaryLines.map((line, i) => (
                <View key={i} style={styles.summaryLine}>
                  <Text style={styles.summaryText}>{line}</Text>
                </View>
              ))}
              {launchError ? (
                <Text style={styles.errorText}>{launchError}</Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm and launch challenge"
                accessibilityState={{ disabled: launchBusy, busy: launchBusy }}
                onPress={launchBusy ? undefined : () => void handleLaunch()}
                disabled={launchBusy}
                style={({ pressed }) => [
                  styles.modalCta,
                  launchBusy ? styles.primaryBtnDisabled : null,
                  pressed && !launchBusy ? styles.pressed : null,
                ]}
              >
                <Text style={styles.modalCtaText}>
                  {launchBusy ? "Launching…" : "Confirm & launch"}
                </Text>
              </Pressable>
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
  flex: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: DS_SPACING_V2.xxs,
    paddingBottom: DS_SPACING_V2.sm,
    gap: DS_SPACING_V2.sm,
  },
  headerBtn: {
    minWidth: 56,
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerBtnSpacer: { minWidth: 56, height: 32 },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  stepLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: DS_SPACING_V2.xs,
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingBottom: DS_SPACING_V2.sm,
  },
  progressSeg: { flex: 1, height: 4, borderRadius: DS_RADIUS_V2.sm },
  progressSegActive: { backgroundColor: DS_COLORS_V2.brand.primary },
  progressSegInactive: { backgroundColor: DS_COLORS_V2.surface.divider },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingBottom: DS_SPACING_V2.lg,
  },

  footer: {
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.xxs,
  },
  primaryBtn: {
    height: 56,
    borderRadius: DS_RADIUS_V2.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  primaryBtnDisabled: {
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
  primaryBtnTextDisabled: { color: DS_COLORS_V2.text.tertiary },
  pressed: { opacity: 0.85 },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: DS_COLORS_V2.overlay.photoGradientStrong,
  },
  modalCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.xl,
    borderTopRightRadius: DS_RADIUS_V2.xl,
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.xl,
    gap: DS_SPACING_V2.sm,
  },
  modalHandleRow: {
    alignItems: "center",
    paddingBottom: DS_SPACING_V2.xs,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  summaryLine: {
    paddingVertical: DS_SPACING_V2.sm,
    paddingHorizontal: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  summaryText: {
    fontSize: 14,
    color: DS_COLORS_V2.text.secondary,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
  },
  modalCta: {
    height: 54,
    borderRadius: DS_RADIUS_V2.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.brand.primary,
    marginTop: DS_SPACING_V2.xxs,
  },
  modalCtaText: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
});

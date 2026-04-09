import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "@/components/create/wizard-styles";
import { StepBasics } from "@/components/create/steps/StepBasics";
import { StepTasks } from "@/components/create/steps/StepTasks";
import { StepRules } from "@/components/create/steps/StepRules";
import { StepReview } from "@/components/create/steps/StepReview";
import { DS_SPACING } from "@/lib/design-system";
import { getDurationFromDraft, type ParticipationTypeUI } from "@/lib/create-challenge-helpers";
import { estimateDailyMinutes, formatEstimatedDailyLabel, type EstimateTaskInput } from "@/lib/estimate-daily-time";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import type { ChallengeType, ChallengeVisibility } from "@/types";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import NewTaskModal from "@/components/create/NewTaskModal";
import CommitModal from "@/components/create/CommitModal";
import { useCelebrationStore } from "@/store/celebrationStore";
import { TimeWindowPrompt } from "@/components/TimeWindowPrompt";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useAuth } from "@/contexts/AuthContext";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { parseTimeString, scheduleTaskReminder } from "@/lib/notifications";
import {
  CREATE_CHALLENGE_DRAFT_KEY,
  useCreateChallengeWizardPersistence,
} from "@/hooks/useCreateChallengeWizardPersistence";
import { DraftExitModal } from "@/components/create/DraftExitModal";
import { WizardStepFooter } from "@/components/create/WizardStepFooter";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_DISTANCE = SCREEN_WIDTH * 0.3;
const STEP_TRANSITION_MS = 250;

type Who = "solo" | "duo" | "squad";
type PhotoProof = "off" | "optional" | "required";
type TeamRules = "all" | "shared";
type DifficultyMode = "standard" | "hard";

function whoToParticipation(w: Who): { participation: ParticipationTypeUI; teamSize: number } {
  if (w === "solo") return { participation: "solo", teamSize: 1 };
  if (w === "duo") return { participation: "duo", teamSize: 2 };
  return { participation: "team", teamSize: 10 };
}

export default function CreateChallengeWizard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { showGate } = useAuthGate();
  const celebrationVisible = useCelebrationStore((s) => s.visible);
  const pendingNavId = useRef<string | null>(null);
  const wasCelebration = useRef(false);
  const [showTimePrompt, setShowTimePrompt] = useState(false);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [nameError, setNameError] = useState(false);
  const [shake] = useState(() => new Animated.Value(0));
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [who, setWho] = useState<Who>("solo");
  const [durationDays, setDurationDays] = useState<number | null>(21);
  const [customDur, setCustomDur] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("standard");
  const [tasks, setTasks] = useState<(TaskEditorTask & { wizardType?: string })[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [taskStepError, setTaskStepError] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>("standard");
  const [photoProof, setPhotoProof] = useState<PhotoProof>("off");
  const [categories, setCategories] = useState<string[]>([]);
  const [catError, setCatError] = useState(false);
  const [teamRules, setTeamRules] = useState<TeamRules>("all");
  const [visibility, setVisibility] = useState<ChallengeVisibility>("FRIENDS");
  const [duoInvite, setDuoInvite] = useState("");
  const [resumeBanner, setResumeBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [cancelDraftVisible, setCancelDraftVisible] = useState(false);
  const { error: wizardError, showError: showWizardError, clearError: clearWizardError } = useInlineError();

  const { participation, teamSize } = whoToParticipation(who);
  const duration = getDurationFromDraft(challengeType, durationDays, customDur);
  const hardModeGlobal = difficultyMode === "hard";
  const trimmedTitle = title.trim();
  const isValidChallengeName =
    trimmedTitle.length >= 3 &&
    trimmedTitle.toLowerCase() !== "challenge" &&
    trimmedTitle.toLowerCase() !== "untitled";

  const animateToStep = useCallback(
    (newStep: number, currentStep: number) => {
      const isForward = newStep > currentStep;
      const half = STEP_TRANSITION_MS / 2;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: isForward ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
          duration: half,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: half,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(newStep);
        slideAnim.setValue(isForward ? SLIDE_DISTANCE : -SLIDE_DISTANCE);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: half,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: half,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [slideAnim, fadeAnim]
  );

  const shakeName = useCallback(() => {
    Animated.sequence(
      [0, -4, 4, -4, 4, -4, 4, 0].map((v, i) =>
        Animated.timing(shake, {
          toValue: v,
          duration: i === 7 ? 80 : 40,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [shake]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CREATE_CHALLENGE_DRAFT_KEY);
        if (raw) setResumeBanner(true);
      } catch (e) {
        captureError(e, "CreateChallengeWizardDraftRead");
      }
    })();
  }, []);

  useEffect(() => {
    if (tasks.length) setTaskStepError(false);
  }, [tasks.length]);

  useEffect(() => {
    if (categories.length) setCatError(false);
  }, [categories.length]);

  useEffect(() => {
    if (!celebrationVisible && wasCelebration.current && pendingNavId.current) {
      setShowTimePrompt(true);
    }
    wasCelebration.current = celebrationVisible;
  }, [celebrationVisible, router]);

  const finishAfterTimePrompt = useCallback(() => {
    const id = pendingNavId.current;
    pendingNavId.current = null;
    setShowTimePrompt(false);
    if (id) router.replace(ROUTES.CHALLENGE_ID(id) as never);
  }, [router]);

  const setDifficultyModeAndPropagate = useCallback((mode: DifficultyMode) => {
    setDifficultyMode(mode);
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        config: { ...t.config, hard_mode: mode === "hard" },
      }))
    );
  }, []);

  const applyPhotoPolicyToTasks = useCallback(
    (list: (TaskEditorTask & { wizardType?: string })[]): (TaskEditorTask & { wizardType?: string })[] => {
      if (photoProof === "required") {
        return list.map((t) => ({ ...t, requirePhotoProof: true, photoRequired: true }));
      }
      if (photoProof === "off") {
        return list.map((t) => ({ ...t, requirePhotoProof: false, photoRequired: false }));
      }
      // "optional" — leave each task's individual photo setting as-is
      return list;
    },
    [photoProof]
  );

  const { saveDraft, tryCancel, resumeDraft, submitChallenge } = useCreateChallengeWizardPersistence({
    router,
    user,
    isGuest,
    showGate,
    clearWizardError,
    showWizardError,
    pendingNavId,
    step,
    setStep,
    title,
    setTitle,
    who,
    setWho,
    durationDays,
    setDurationDays,
    customDur,
    setCustomDur,
    challengeType,
    setChallengeType,
    tasks,
    setTasks,
    selectedPackId,
    setSelectedPackId,
    difficultyMode,
    setDifficultyMode,
    photoProof,
    setPhotoProof,
    categories,
    setCategories,
    teamRules,
    setTeamRules,
    visibility,
    setVisibility,
    duoInvite,
    setDuoInvite,
    setResumeBanner,
    setSubmitting,
    setCancelDraftVisible,
    participation,
    teamSize,
    duration,
    applyPhotoPolicyToTasks,
  });

  const onNext1 = () => {
    if (!isValidChallengeName) {
      setNameError(true);
      shakeName();
      return;
    }
    setNameError(false);
    animateToStep(2, 1);
  };

  const onNext2 = () => {
    if (tasks.length === 0) {
      setTaskStepError(true);
      return;
    }
    setTaskStepError(false);
    animateToStep(3, 2);
  };

  const onNext3 = () => {
    if (categories.length === 0) {
      setCatError(true);
      return;
    }
    setCatError(false);
    animateToStep(4, 3);
  };

  const estTasks: EstimateTaskInput[] = tasks.map((t) => ({
    type: t.type,
    wizardType: t.wizardType,
    durationMinutes: t.durationMinutes,
    targetValue: t.targetValue,
    unit: t.unit,
    trackingMode: t.trackingMode,
    minWords: t.minWords,
    journalPrompt: t.journalPrompt,
  }));
  const estLabel = formatEstimatedDailyLabel(estimateDailyMinutes(estTasks));

  const stepper = (
    <View style={styles.stepperRow}>
      {[1, 2, 3, 4].map((n) => (
        <View key={n} style={styles.stepperItem}>
          <View style={[styles.stepDot, step >= n && styles.stepDotOn]} />
          {n < 4 && <View style={[styles.stepLine, step > n && styles.stepLineOn]} />}
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {resumeBanner ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Continue where you left off?</Text>
          <TouchableOpacity
            onPress={() => void resumeDraft()}
            style={styles.bannerBtn}
            accessibilityRole="button"
            accessibilityLabel="Resume your saved challenge draft"
          >
            <Text style={styles.bannerBtnText}>Resume</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={tryCancel}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cancel and close create challenge"
        >
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Create challenge</Text>
        <View style={styles.topBarSpacer} />
      </View>
      {wizardError ? <InlineError message={wizardError} onDismiss={clearWizardError} /> : null}
      {stepper}

      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: DS_SPACING.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <StepBasics
              title={title}
              setTitle={setTitle}
              nameError={nameError}
              setNameError={setNameError}
              shake={shake}
              who={who}
              setWho={setWho}
              durationDays={durationDays}
              setDurationDays={setDurationDays}
              customDur={customDur}
              setCustomDur={setCustomDur}
              challengeType={challengeType}
              setChallengeType={setChallengeType}
            />
          )}

          {step === 2 && (
            <StepTasks
              tasks={tasks}
              setTasks={setTasks}
              selectedPackId={selectedPackId}
              setSelectedPackId={setSelectedPackId}
              taskStepError={taskStepError}
              onAddTask={() => setNewTaskOpen(true)}
              onEditTask={() => {}}
              onReorderTask={() => {}}
              onRemoveTask={(index) => setTasks((p) => p.filter((_, i) => i !== index))}
            />
          )}

          {step === 3 && (
            <StepRules
              difficultyMode={difficultyMode}
              setDifficultyMode={setDifficultyModeAndPropagate}
              photoProof={photoProof}
              setPhotoProof={setPhotoProof}
              who={who}
              teamRules={teamRules}
              setTeamRules={setTeamRules}
              categories={categories}
              setCategories={setCategories}
              catError={catError}
            />
          )}

          {step === 4 && (
            <StepReview
              title={title}
              who={who}
              difficultyMode={difficultyMode}
              challengeType={challengeType}
              duration={duration}
              estLabel={estLabel}
              tasks={tasks}
              categories={categories}
              visibility={visibility}
              setVisibility={setVisibility}
              duoInvite={duoInvite}
              setDuoInvite={setDuoInvite}
            />
          )}
        </ScrollView>
      </Animated.View>

      <WizardStepFooter
        step={step}
        insetsBottom={insets.bottom}
        isValidChallengeName={isValidChallengeName}
        submitting={submitting}
        title={title}
        onBack={() => animateToStep(step - 1, step)}
        onNext1={onNext1}
        onNext2={onNext2}
        onNext3={onNext3}
        onBackFromReview={() => animateToStep(3, 4)}
        onOpenCommit={() => setShowCommitModal(true)}
        onSaveDraft={() => void submitChallenge("draft")}
      />

      <NewTaskModal
        visible={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        hardModeGlobal={hardModeGlobal}
        onAdd={(t) => setTasks((p) => [...p, t])}
      />

      <DraftExitModal
        visible={cancelDraftVisible}
        onClose={() => setCancelDraftVisible(false)}
        onSaveDraft={saveDraft}
      />

      <CommitModal
        visible={showCommitModal}
        challengeName={title.trim() || "Your challenge"}
        taskCount={tasks.length}
        durationDays={challengeType === "one_day" ? 1 : duration}
        onConfirm={() => {
          setShowCommitModal(false);
          void submitChallenge("published");
        }}
        onCancel={() => setShowCommitModal(false)}
      />

      <TimeWindowPrompt
        visible={showTimePrompt}
        tasks={tasks.map((t) => ({ id: t.id, name: t.title }))}
        onSave={async (times) => {
          const cid = pendingNavId.current ?? "";
          const ctitle = title.trim() || "Your challenge";
          await Promise.all(
            Object.entries(times).map(async ([taskId, timeStr]) => {
              const parsed = parseTimeString(timeStr);
              if (!parsed) return;
              const task = tasks.find((x) => x.id === taskId);
              if (!task) return;
              await scheduleTaskReminder({
                taskName: task.title,
                challengeName: ctitle,
                hour: parsed.hour,
                minute: parsed.minute,
                identifier: `task-${cid}-${taskId}`,
              });
            })
          );
          finishAfterTimePrompt();
        }}
        onSkip={finishAfterTimePrompt}
      />
    </KeyboardAvoidingView>
  );
}

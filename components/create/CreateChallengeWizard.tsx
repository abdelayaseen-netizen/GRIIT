import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { User, Users, UsersRound, Trash2 } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS_COLORS, DS_SPACING, GRIIT_COLORS } from "@/lib/design-system";
import { CREATE_SELECTION } from "@/lib/create-selection";
import { CHALLENGE_PACKS, tasksFromPack } from "@/lib/challenge-packs";
import {
  buildCreatePayload,
  validateDraftTasks,
  getDurationFromDraft,
  canProceedStep1,
  type ParticipationTypeUI,
  type CreateChallengeDraft,
} from "@/lib/create-challenge-helpers";
import { estimateDailyMinutes, formatEstimatedDailyLabel, type EstimateTaskInput } from "@/lib/estimate-daily-time";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { sharePlainMessage } from "@/lib/share";
import type { ChallengeType, ChallengeVisibility, ReplayPolicy } from "@/types";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import NewTaskModal from "@/components/create/NewTaskModal";
import CommitModal from "@/components/create/CommitModal";
import { useCelebrationStore } from "@/store/celebrationStore";
import { TimeWindowPrompt } from "@/components/TimeWindowPrompt";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useAuth } from "@/contexts/AuthContext";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseTimeString, scheduleTaskReminder } from "@/lib/notifications";

const DRAFT_KEY = "griit_challenge_draft";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_DISTANCE = SCREEN_WIDTH * 0.3;
const STEP_TRANSITION_MS = 250;

type Who = "solo" | "duo" | "squad";
type PhotoProof = "off" | "optional" | "required";
type TeamRules = "all" | "shared";
type DifficultyMode = "standard" | "hard";

const DURATION_PRESETS = [7, 14, 21, 30, 75] as const;
const CATEGORY_OPTIONS = ["Fitness", "Mind", "Faith", "Discipline", "Other"] as const;

function DurationPill({
  label,
  selected,
  onPress,
  disabled,
  style,
  accessibilityLabel: a11yLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={a11yLabel ?? `Duration ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      style={[
        {
          height: 44,
          borderRadius: 22,
          borderWidth: 1.5,
          borderColor: selected ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
          backgroundColor: selected ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "500",
          color: selected ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getTaskIcon(taskType: string): string {
  const icons: Record<string, string> = {
    workout: "💪",
    run: "🏃",
    timer: "⏱️",
    simple: "✓",
    water: "💧",
    journal: "📓",
    reading: "📖",
    photo: "📷",
    checkin: "📍",
    counter: "#️⃣",
  };
  return icons[taskType] || "✓";
}

function getTaskMeta(task: TaskEditorTask & { wizardType?: string }): string {
  const t = task.wizardType ?? task.type;
  const parts: string[] = [t.charAt(0).toUpperCase() + t.slice(1)];
  if (task.type === "run" && task.trackingMode === "distance" && task.targetValue != null) {
    parts.push(`${task.targetValue} ${task.unit || "mi"}`);
  }
  if (task.durationMinutes != null && task.durationMinutes > 0) {
    parts.push(`${task.durationMinutes} min`);
  }
  if (task.type === "counter" && task.targetValue != null) {
    parts.push(`${task.targetValue} ${task.unit || "reps"}`);
  }
  if (task.type === "reading" && task.targetValue != null) {
    parts.push(`${task.targetValue} pages`);
  }
  if (task.type === "water" && task.targetValue != null) {
    parts.push(`${task.targetValue} glasses`);
  }
  return parts.join(" · ");
}

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
  const hardLocked = difficultyMode === "hard";
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
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
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

  const draftPayload = useCallback(
    () => ({
      step,
      title,
      who,
      durationDays,
      customDur,
      challengeType,
      tasks,
      difficultyMode,
      photoProof,
      categories,
      teamRules,
      visibility,
      duoInvite,
      selectedPackId,
    }),
    [
      step,
      title,
      who,
      durationDays,
      customDur,
      challengeType,
      tasks,
      difficultyMode,
      photoProof,
      categories,
      teamRules,
      visibility,
      duoInvite,
      selectedPackId,
    ]
  );

  const saveDraft = useCallback(async () => {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload()));
    } catch (e) {
      captureError(e, "CreateChallengeWizardSaveDraft");
    }
    router.back();
  }, [draftPayload, router]);

  const tryCancel = () => {
    const hasData =
      title.trim().length > 0 ||
      tasks.length > 0 ||
      categories.length > 0 ||
      step > 1;
    if (!hasData) {
      router.back();
      return;
    }
    setCancelDraftVisible(true);
  };

  const resumeDraft = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (typeof d.title === "string") setTitle(d.title);
      if (d.who === "solo" || d.who === "duo" || d.who === "squad") setWho(d.who);
      if (typeof d.durationDays === "number" || d.durationDays === null) setDurationDays(d.durationDays as number | null);
      if (typeof d.customDur === "string") setCustomDur(d.customDur);
      if (d.challengeType === "standard" || d.challengeType === "one_day") setChallengeType(d.challengeType);
      if (Array.isArray(d.tasks)) setTasks(d.tasks as unknown as (TaskEditorTask & { wizardType?: string })[]);
      if (typeof d.selectedPackId === "string" || d.selectedPackId === null) setSelectedPackId(d.selectedPackId as string | null);
      if (d.difficultyMode === "standard" || d.difficultyMode === "hard") setDifficultyMode(d.difficultyMode);
      if (d.photoProof === "off" || d.photoProof === "optional" || d.photoProof === "required") setPhotoProof(d.photoProof);
      if (Array.isArray(d.categories)) setCategories(d.categories as string[]);
      if (d.teamRules === "all" || d.teamRules === "shared") setTeamRules(d.teamRules);
      if (d.visibility === "PUBLIC" || d.visibility === "FRIENDS" || d.visibility === "PRIVATE") setVisibility(d.visibility);
      if (typeof d.duoInvite === "string") setDuoInvite(d.duoInvite);
      if (typeof d.step === "number") setStep(Math.min(4, Math.max(1, d.step)));
      setResumeBanner(false);
    } catch (e) {
      captureError(e, "CreateChallengeWizardResumeDraft");
    }
  }, []);

  const submitChallenge = useCallback(
    async (publishStatus: "published" | "draft") => {
      if (isGuest) {
        showGate("create");
        return;
      }
      clearWizardError();
      const list = applyPhotoPolicyToTasks(tasks);
      const draftTasks = list as unknown as CreateChallengeDraft["tasks"];
      const v = validateDraftTasks(draftTasks, participation);
      if (!v.valid) {
        showWizardError(v.error ?? "Fix tasks and try again.");
        return;
      }
      const liveDate =
        challengeType === "one_day" ? new Date().toISOString().slice(0, 10) : "";
      if (!canProceedStep1(title, duration, challengeType, liveDate, participation)) {
        showWizardError("Add a title and duration.");
        return;
      }
      setSubmitting(true);
      const draft: CreateChallengeDraft = {
        title,
        description: "",
        type: challengeType,
        durationDays,
        customDuration: customDur,
        categories,
        tasks: draftTasks,
        liveDate,
        replayPolicy: "allow_replay" as ReplayPolicy,
        requireSameRules: true,
        showReplayLabel: true,
        visibility,
        participationType: participation,
        teamSize,
        difficulty: difficultyMode === "hard" ? "hard" : "standard",
        status: publishStatus,
      };
      const payload = buildCreatePayload(draft);
      try {
        const challenge = (await trpcMutate(TRPC.challenges.create, payload)) as { id?: string };
        await AsyncStorage.removeItem(DRAFT_KEY);
        const { queryClient } = await import("@/lib/query-client");
        void queryClient.invalidateQueries({ queryKey: ["home"] });
        void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
        void queryClient.invalidateQueries({ queryKey: ["discover"] });

        if (publishStatus === "draft") {
          if (challenge?.id) {
            router.replace(ROUTES.TABS_PROFILE as never);
          }
          return;
        }

        const newId = challenge?.id;
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (newId) {
          pendingNavId.current = newId;
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE, "true");
          useCelebrationStore.getState().show({
            title: "Challenge created!",
            subtitle: `${title.trim()} is live.`,
            type: "badge",
            shareMessage: `I just launched "${title.trim()}" on GRIIT. Day 1 starts now. Join me: https://griit.fit`,
          });
          if (who === "duo") {
            setTimeout(() => {
              void sharePlainMessage(`Join my challenge on GRIIT: ${title.trim()}`);
            }, 400);
          }
        } else {
          router.replace(ROUTES.TABS_DISCOVER as never);
        }
      } catch (e: unknown) {
        captureError(
          e,
          publishStatus === "draft" ? "CreateChallengeWizardSaveServerDraft" : "CreateChallengeWizardLaunch"
        );
        showWizardError(e instanceof Error ? e.message : "Try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      isGuest,
      user?.id,
      showGate,
      applyPhotoPolicyToTasks,
      tasks,
      participation,
      title,
      duration,
      challengeType,
      customDur,
      categories,
      visibility,
      teamSize,
      who,
      router,
      clearWizardError,
      showWizardError,
      difficultyMode,
    ]
  );

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
            <>
              <Text style={styles.h1}>What are you building?</Text>
              <Text style={styles.sub}>Most people finish in under 90 seconds.</Text>
              <Text style={styles.fieldLabel}>Challenge name</Text>
              <Animated.View style={[styles.shakeWrap, { transform: [{ translateX: shake }] }]}>
                <TextInput
                  style={[styles.input, nameError && styles.inputErr]}
                  placeholder="e.g. 75 Day Hard, Iron Mind..."
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  value={title}
                  accessibilityLabel="Challenge name"
                  onChangeText={(text) => {
                    setTitle(text);
                    if (nameError) {
                      const candidate = text.trim();
                      const ok =
                        candidate.length >= 3 &&
                        candidate.toLowerCase() !== "challenge" &&
                        candidate.toLowerCase() !== "untitled";
                      if (ok) setNameError(false);
                    }
                  }}
                />
              </Animated.View>
              <Text style={styles.charCount}>{title.length}/60</Text>
              {nameError ? <Text style={styles.errText}>Give your challenge a name</Text> : null}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Who&apos;s in?</Text>
              <View style={styles.whoRow}>
                {(
                  [
                    { id: "solo" as const, Icon: User, t: "Solo", d: "Just you." },
                    { id: "duo" as const, Icon: Users, t: "Duo", d: "You + 1 partner." },
                    { id: "squad" as const, Icon: UsersRound, t: "Squad", d: "2-10 people." },
                  ] as const
                ).map((row) => {
                  const sel = who === row.id;
                  const Icon = row.Icon;
                  return (
                    <TouchableOpacity
                      key={row.id}
                      style={[styles.whoCard, sel && styles.whoCardSel]}
                      onPress={() => setWho(row.id)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={
                        row.id === "solo"
                          ? "Solo challenge — just you — tap to select"
                          : row.id === "duo"
                            ? "Duo challenge — you and one partner — tap to select"
                            : "Squad challenge — two to ten people — tap to select"
                      }
                      accessibilityState={{ selected: sel }}
                    >
                      <Icon size={24} color={sel ? CREATE_SELECTION.text : DS_COLORS.TEXT_SECONDARY} />
                      <Text style={[styles.whoTitle, sel && { color: CREATE_SELECTION.text }]}>{row.t}</Text>
                      <Text style={styles.whoSub}>{row.d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>How long?</Text>
              <View style={styles.colGapSm}>
                <View style={styles.rowGapSm}>
                  {DURATION_PRESETS.slice(0, 3).map((d) => (
                    <DurationPill
                      key={d}
                      label={`${d} days`}
                      selected={durationDays === d}
                      onPress={() => {
                        setDurationDays(d);
                        setCustomDur("");
                      }}
                      accessibilityLabel={`${d} day challenge — ${durationDays === d ? "selected" : "tap to select"}`}
                      style={styles.flex1}
                    />
                  ))}
                </View>
                <View style={styles.rowGapSm}>
                  {DURATION_PRESETS.slice(3, 5).map((d) => (
                    <DurationPill
                      key={d}
                      label={`${d} days`}
                      selected={durationDays === d}
                      onPress={() => {
                        setDurationDays(d);
                        setCustomDur("");
                      }}
                      accessibilityLabel={`${d} day challenge — ${durationDays === d ? "selected" : "tap to select"}`}
                      style={styles.flex1}
                    />
                  ))}
                  <DurationPill
                    label="Custom"
                    selected={durationDays === null}
                    onPress={() => setDurationDays(null)}
                    accessibilityLabel={`Custom duration — ${durationDays === null ? "selected" : "tap to select"}`}
                    style={styles.flex1}
                  />
                </View>
              </View>
              {durationDays === null && (
                <View style={styles.customRow}>
                  <TextInput
                    style={[styles.input, { width: 64 }]}
                    keyboardType="number-pad"
                    value={customDur}
                    accessibilityLabel="Custom challenge duration in days"
                    onChangeText={(v) => {
                      setCustomDur(v);
                      setDurationDays(null);
                    }}
                  />
                  <Text style={styles.daysLabel}>days</Text>
                </View>
              )}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Challenge type</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeCard, challengeType === "standard" && styles.typeCardSel]}
                  onPress={() => setChallengeType("standard")}
                  accessibilityRole="button"
                  accessibilityLabel={`Standard — Multi-day, daily tasks — ${challengeType === "standard" ? "selected" : "tap to select"}`}
                  accessibilityState={{ selected: challengeType === "standard" }}
                >
                  <Text style={styles.typeCardTitle}>Standard</Text>
                  <Text style={styles.typeCardSub}>Multi-day, daily tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeCard, challengeType === "one_day" && styles.typeCardSel]}
                  onPress={() => {
                    setChallengeType("one_day");
                    setDurationDays(1);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`24-Hour — One-day sprint — ${challengeType === "one_day" ? "selected" : "tap to select"}`}
                  accessibilityState={{ selected: challengeType === "one_day" }}
                >
                  <Text style={styles.typeCardTitle}>24-Hour</Text>
                  <Text style={styles.typeCardSub}>One-day sprint</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.h1}>Daily tasks</Text>
              <Text style={styles.sub}>What must get done every single day?</Text>
              <Text style={styles.packsHead}>Quick start packs</Text>
              <View style={styles.colGap10}>
                {Array.from({ length: Math.ceil(CHALLENGE_PACKS.length / 2) }, (_, rowIdx) => {
                  const row = CHALLENGE_PACKS.slice(rowIdx * 2, rowIdx * 2 + 2);
                  return (
                    <View key={row.map((p) => p.id).join("-")} style={styles.rowGap10}>
                      {row.map((pack) => {
                        const sel = selectedPackId === pack.id;
                        return (
                          <TouchableOpacity
                            key={pack.id}
                            style={[styles.packCard, sel && styles.packCardSel, { flex: 1 }]}
                            onPress={() => {
                              if (sel) {
                                setSelectedPackId(null);
                                setTasks([]);
                              } else {
                                setSelectedPackId(pack.id);
                                const built = tasksFromPack(pack) as unknown as (TaskEditorTask & { wizardType?: string })[];
                                const withW = pack.tasks.map((t, i) => ({
                                  ...(built[i] as object),
                                  wizardType: t.type,
                                })) as unknown as (TaskEditorTask & { wizardType?: string })[];
                                setTasks(withW);
                              }
                            }}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={`${pack.name} pack — ${pack.taskCount} tasks — tap to use this pack`}
                            accessibilityState={{ selected: sel }}
                          >
                            <Text style={styles.packEmoji}>{pack.emoji}</Text>
                            <Text style={styles.packName} numberOfLines={1}>
                              {pack.name}
                            </Text>
                            <Text style={styles.packDesc} numberOfLines={2}>
                              {pack.description}
                            </Text>
                            <Text style={styles.packCount}>{pack.taskCount} tasks</Text>
                          </TouchableOpacity>
                        );
                      })}
                      {row.length === 1 ? <View style={styles.flex1} /> : null}
                    </View>
                  );
                })}
              </View>
              <Text style={styles.listHead}>Pack tasks</Text>
              {tasks.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No tasks yet</Text>
                  <Text style={styles.emptySub}>Add your first daily task</Text>
                </View>
              ) : (
                tasks.map((task) => (
                  <View key={task.id} style={styles.taskRow}>
                    <View style={styles.taskTitleRow}>
                      <Text style={styles.taskTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      {task.config?.hard_mode ? (
                        <View style={styles.hardBadge} accessibilityLabel="Hard mode task">
                          <Text style={styles.hardBadgeText}>Hard</Text>
                        </View>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => setTasks((p) => p.filter((x) => x.id !== task.id))}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove task ${task.title}`}
                    >
                      <Trash2 size={18} color={DS_COLORS.TEXT_MUTED} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              {taskStepError ? <Text style={styles.errText}>Add at least one daily task</Text> : null}
              <TouchableOpacity
                style={styles.dashedAdd}
                onPress={() => setNewTaskOpen(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Add a new task to this challenge"
              >
                <Text style={styles.dashedAddText}>+ Add custom task</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.h1}>Challenge rules</Text>
              <Text style={styles.sub}>How strict do you want this?</Text>
              <Text style={styles.fieldLabel}>Difficulty</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.ruleCard, difficultyMode === "standard" && styles.ruleCardSel]}
                  onPress={() => setDifficultyModeAndPropagate("standard")}
                  accessibilityRole="button"
                  accessibilityLabel="Standard difficulty — self-reported completion, streak freezes allowed — tap to select"
                  accessibilityState={{ selected: difficultyMode === "standard" }}
                >
                  <Text style={styles.ruleTitle}>Standard</Text>
                  {(
                    [
                      "Self-reported completion",
                      "Streak freezes allowed",
                      "Miss a day? Keep going",
                    ] as const
                  ).map((item, i) => (
                    <View key={i} style={styles.rowStartGap8Mb4}>
                      <Ionicons
                        name={difficultyMode === "standard" ? "checkmark" : "remove"}
                        size={14}
                        color={difficultyMode === "standard" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_HINT}
                        style={styles.mt2}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: DS_COLORS.TEXT_SECONDARY,
                          lineHeight: 20,
                          flex: 1,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ruleCard, difficultyMode === "hard" && styles.ruleCardSel]}
                  onPress={() => setDifficultyModeAndPropagate("hard")}
                  accessibilityRole="button"
                  accessibilityLabel="Hard mode — photo proof required, no streak freezes, miss a day means Day 1 again — tap to select"
                  accessibilityState={{ selected: difficultyMode === "hard" }}
                >
                  <Text style={styles.ruleTitle}>Hard mode 🔥</Text>
                  {(
                    ["Photo proof every task", "No streak freezes", "Miss a day? Day 1 again"] as const
                  ).map((item, i) => (
                    <View key={i} style={styles.rowStartGap8Mb4}>
                      <Ionicons
                        name={difficultyMode === "hard" ? "checkmark" : "remove"}
                        size={14}
                        color={difficultyMode === "hard" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_HINT}
                        style={styles.mt2}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: DS_COLORS.TEXT_SECONDARY,
                          lineHeight: 20,
                          flex: 1,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>
              {difficultyMode === "hard" ? (
                <View style={styles.hardWarningBox}>
                  <Text style={styles.hardWarningText}>
                    Hard mode requires photo proof on every task. Tasks without it will be updated automatically.
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Photo proof</Text>
              <View style={styles.rowGapSm}>
                {(
                  [
                    { id: "off" as const, label: "Off" },
                    { id: "optional" as const, label: "Optional" },
                    { id: "required" as const, label: "Required" },
                  ] as const
                ).map((p) => (
                  <DurationPill
                    key={p.id}
                    label={p.label}
                    selected={hardLocked ? p.id === "required" : photoProof === p.id}
                    disabled={hardLocked}
                    onPress={() => {
                      if (!hardLocked) setPhotoProof(p.id);
                    }}
                    accessibilityLabel={`Photo proof ${p.label} — ${photoProof === p.id || (hardLocked && p.id === "required") ? "selected" : "tap to select"}`}
                    style={styles.flex1}
                  />
                ))}
              </View>
              {hardLocked ? <Text style={styles.hardNote}>Set by hard mode</Text> : null}
              <Text style={styles.caption}>Photos become shareable proof cards on your feed.</Text>
              <Text style={styles.fieldLabel}>
                Category <Text style={styles.light}>(select all that apply)</Text>
              </Text>
              <View style={[styles.catPillWrap, catError && styles.catPillWrapErr]}>
                <View style={styles.colGapSm}>
                  <View style={styles.rowGapSm}>
                    {CATEGORY_OPTIONS.slice(0, 3).map((c) => {
                      const sel = categories.includes(c);
                      return (
                        <DurationPill
                          key={c}
                          label={c}
                          selected={sel}
                          onPress={() =>
                            setCategories((prev) => (sel ? prev.filter((x) => x !== c) : [...prev, c]))
                          }
                          accessibilityLabel={`${c} category — ${sel ? "selected" : "tap to select"}`}
                          style={styles.flex1}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.rowGapSm}>
                    {CATEGORY_OPTIONS.slice(3, 5).map((c) => {
                      const sel = categories.includes(c);
                      return (
                        <DurationPill
                          key={c}
                          label={c}
                          selected={sel}
                          onPress={() =>
                            setCategories((prev) => (sel ? prev.filter((x) => x !== c) : [...prev, c]))
                          }
                          accessibilityLabel={`${c} category — ${sel ? "selected" : "tap to select"}`}
                          style={styles.flex1}
                        />
                      );
                    })}
                    <View style={styles.flex1} />
                  </View>
                </View>
              </View>
              {catError ? <Text style={styles.errText}>Pick at least one category</Text> : null}
              {who !== "solo" && (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                    Team rules <Text style={styles.light}>(for duo/squad)</Text>
                  </Text>
                  <View style={styles.typeRow}>
                    <TouchableOpacity
                      style={[styles.typeCard, teamRules === "all" && styles.typeCardSel]}
                      onPress={() => setTeamRules("all")}
                      accessibilityRole="button"
                      accessibilityLabel={`Everyone does all tasks — each person completes every task — ${teamRules === "all" ? "selected" : "tap to select"}`}
                      accessibilityState={{ selected: teamRules === "all" }}
                    >
                      <Text style={styles.typeCardTitle}>Everyone does all</Text>
                      <Text style={styles.typeCardSub}>Each person completes every task individually.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.typeCard, teamRules === "shared" && styles.typeCardSel]}
                      onPress={() => setTeamRules("shared")}
                      accessibilityRole="button"
                      accessibilityLabel={`Shared progress — team splits numeric targets — ${teamRules === "shared" ? "selected" : "tap to select"}`}
                      accessibilityState={{ selected: teamRules === "shared" }}
                    >
                      <Text style={styles.typeCardTitle}>Shared progress</Text>
                      <Text style={styles.typeCardSub}>Team splits numeric targets across members.</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.h1}>Ready to commit?</Text>
              <Text style={styles.sub}>Once you launch, the clock starts.</Text>
              <View
                style={{
                  backgroundColor: DS_COLORS.CARD_BG,
                  borderRadius: 20,
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: DS_COLORS.PRIMARY,
                  borderWidth: 1.5,
                  borderColor: DS_COLORS.BORDER_LIGHT,
                  marginBottom: 20,
                }}
              >
                <View
                  style={styles.rowBetweenStartMb8}
                >
                  <View style={styles.flex1}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "700",
                        color: DS_COLORS.TEXT_PRIMARY,
                        letterSpacing: -0.3,
                      }}
                    >
                      {title.trim() || "Untitled"}
                    </Text>
                    <Text style={styles.text14SecondaryMt4}>
                      {who === "solo" ? "Solo" : who === "duo" ? "Duo" : "Squad"} ·{" "}
                      {difficultyMode === "hard" ? "Hard mode" : "Standard"} ·{" "}
                      {challengeType === "one_day" ? 1 : duration} days
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: DS_COLORS.ACCENT_TINT,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={styles.text13SemiboldPrimary}>
                      {difficultyMode === "hard" ? "Hard" : "Standard"}
                    </Text>
                  </View>
                </View>
                <View style={styles.mt12ColGap6}>
                  {Array.from({ length: Math.ceil(categories.length / 3) }, (_, rowIdx) => {
                    const row = categories.slice(rowIdx * 3, rowIdx * 3 + 3);
                    return (
                      <View key={row.join("-")} style={styles.rowGap6}>
                        {row.map((c) => (
                          <View
                            key={c}
                            style={{
                              flex: 1,
                              backgroundColor: DS_COLORS.WARM_CREAM,
                              paddingHorizontal: 14,
                              paddingVertical: 5,
                              borderRadius: 12,
                              alignItems: "center",
                            }}
                          >
                            <Text style={styles.text13MediumSecondary}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </Text>
                          </View>
                        ))}
                        {row.length < 3
                          ? Array.from({ length: 3 - row.length }, (_, i) => <View key={`sp-${i}`} style={styles.flex1} />)
                          : null}
                      </View>
                    );
                  })}
                </View>
                <View style={styles.dividerMv16} />
                <View style={styles.rowBetweenCenter}>
                  <View>
                    <Text style={styles.text13Hint}>Daily commitment</Text>
                    <Text style={styles.text18BoldPrimaryMt2}>
                      {estLabel}
                    </Text>
                  </View>
                  <View style={styles.itemsEnd}>
                    <Text style={styles.text13Hint}>Tasks per day</Text>
                    <Text style={styles.text18BoldPrimaryMt2}>
                      {tasks.length}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: DS_COLORS.CARD_BG,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: DS_COLORS.BORDER_LIGHT,
                  overflow: "hidden",
                  marginBottom: 20,
                }}
              >
                {tasks.map((task, i) => (
                  <View
                    key={task.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      padding: 16,
                      borderBottomWidth: i < tasks.length - 1 ? 1 : 0,
                      borderBottomColor: DS_COLORS.DIVIDER,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: DS_COLORS.ACCENT_TINT,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={styles.text18}>{getTaskIcon(task.wizardType ?? task.type)}</Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.text16SemiboldPrimary}>{task.title}</Text>
                      <Text style={styles.text13HintMt2}>{getTaskMeta(task)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Who can see this?</Text>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: DS_COLORS.CARD_BG,
                  borderWidth: 1.5,
                  borderColor: DS_COLORS.BORDER,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {(
                  [
                    { key: "PUBLIC" as const, label: "Everyone", icon: "🌐" },
                    { key: "FRIENDS" as const, label: "Friends", icon: "👥" },
                    { key: "PRIVATE" as const, label: "Just me", icon: "🔒" },
                  ] as const
                ).map((v, i) => (
                  <TouchableOpacity
                    key={v.key}
                    onPress={() => setVisibility(v.key)}
                    accessibilityLabel={`Visibility ${v.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: visibility === v.key }}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      paddingVertical: 14,
                      backgroundColor: visibility === v.key ? DS_COLORS.ACCENT_TINT : DS_COLORS.TRANSPARENT,
                      borderRightWidth: i < 2 ? 1 : 0,
                      borderRightColor: DS_COLORS.BORDER_LIGHT,
                    }}
                  >
                    <Text style={styles.text13}>{v.icon}</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: visibility === v.key ? "600" : "400",
                        color: visibility === v.key ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                      }}
                    >
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.text13HintMt8Lh20}>
                {visibility === "PUBLIC" && "Visible on Discover. Anyone can find and join."}
                {visibility === "FRIENDS" && "Only your friends can see and join."}
                {visibility === "PRIVATE" && "Private. No one else sees it."}
              </Text>
              {who === "duo" && (
                <View style={styles.inviteSection}>
                  <Text style={styles.fieldLabel}>Invite your partner</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter handle or phone number"
                    placeholderTextColor={DS_COLORS.TEXT_MUTED}
                    value={duoInvite}
                    onChangeText={setDuoInvite}
                    accessibilityLabel="Partner handle or phone number"
                  />
                  <Text style={styles.caption}>Your partner must accept before the challenge begins.</Text>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => void sharePlainMessage("Join me on GRIIT!")}
                    accessibilityRole="button"
                    accessibilityLabel="Share duo invite link for this challenge"
                  >
                    <Text style={styles.outlineBtnTxt}>Share invite link</Text>
                  </TouchableOpacity>
                </View>
              )}
              {who === "squad" && (
                <View style={styles.inviteSection}>
                  <Text style={styles.fieldLabel}>Invite your squad</Text>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => void sharePlainMessage("Join my squad challenge on GRIIT!")}
                    accessibilityRole="button"
                    accessibilityLabel="Share squad invite link for this challenge"
                  >
                    <Text style={styles.outlineBtnTxt}>Share invite link</Text>
                  </TouchableOpacity>
                  <Text style={styles.caption}>Challenge starts immediately. Others can join within the first 24 hours.</Text>
                </View>
              )}
              <Text style={styles.lockHint}>
                {who === "solo"
                  ? "Editable until the challenge starts."
                  : who === "duo"
                    ? "Settings lock once your partner joins. Make sure everything looks right."
                    : "Settings lock once someone joins."}
              </Text>
            </>
          )}
        </ScrollView>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {step > 1 && step < 4 && (
          <TouchableOpacity
            style={styles.backOut}
            onPress={() => animateToStep(step - 1, step)}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous step"
          >
            <Text style={styles.backOutTxt}>Back</Text>
          </TouchableOpacity>
        )}
        {step === 1 && (
          <TouchableOpacity
            style={[styles.primary, !isValidChallengeName && styles.primaryDisabled]}
            onPress={onNext1}
            activeOpacity={0.9}
            disabled={!isValidChallengeName}
            accessibilityRole="button"
            accessibilityLabel="Continue to daily tasks step"
            accessibilityState={{ disabled: !isValidChallengeName }}
          >
            <Text style={[styles.primaryTxt, !isValidChallengeName && styles.primaryTxtDisabled]}>Next: daily tasks</Text>
          </TouchableOpacity>
        )}
        {step === 2 && (
          <TouchableOpacity
            style={styles.primary}
            onPress={onNext2}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Continue to challenge rules step"
          >
            <Text style={styles.primaryTxt}>Next: rules</Text>
          </TouchableOpacity>
        )}
        {step === 3 && (
          <TouchableOpacity
            style={styles.primary}
            onPress={onNext3}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Continue to review and launch step"
          >
            <Text style={styles.primaryTxt}>Review & launch</Text>
          </TouchableOpacity>
        )}
        {step === 4 && (
          <>
            <View style={styles.rowFooter}>
              <TouchableOpacity
                style={styles.backOut}
                onPress={() => animateToStep(3, 4)}
                accessibilityRole="button"
                accessibilityLabel="Go back to rules"
              >
                <Text style={styles.backOutTxt}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.launch, submitting && { opacity: 0.6 }]}
                disabled={submitting}
                onPress={() => setShowCommitModal(true)}
                accessibilityRole="button"
                accessibilityLabel={`Launch ${title.trim() || "challenge"}`}
                accessibilityState={{ disabled: submitting }}
              >
                <Text style={styles.launchTxt}>{submitting ? "Launching…" : "Launch challenge"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => void submitChallenge("draft")}
              disabled={submitting}
              accessibilityLabel="Save as draft"
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              style={[styles.saveDraftBtn, submitting && styles.saveDraftBtnDisabled]}
            >
              <Ionicons name="bookmark-outline" size={16} color={DS_COLORS.TEXT_SECONDARY} />
              <Text style={styles.saveDraftText}>Save as draft</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <NewTaskModal
        visible={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        hardModeGlobal={hardLocked}
        onAdd={(t) => setTasks((p) => [...p, t])}
      />

      <Modal visible={cancelDraftVisible} transparent animationType="fade" onRequestClose={() => setCancelDraftVisible(false)}>
        <Pressable
          style={styles.draftExitBackdrop}
          onPress={() => setCancelDraftVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close save draft dialog"
        >
          <Pressable style={styles.draftExitCard} onPress={(e) => e.stopPropagation()} accessible={false}>
            <Text style={styles.draftExitTitle}>Save as draft?</Text>
            <TouchableOpacity
              style={styles.draftExitPrimary}
              onPress={() => setCancelDraftVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Keep editing"
            >
              <Text style={styles.draftExitPrimaryTxt}>Keep editing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.draftExitDanger}
              onPress={() => {
                setCancelDraftVisible(false);
                void AsyncStorage.removeItem(DRAFT_KEY).then(() => router.back());
              }}
              accessibilityRole="button"
              accessibilityLabel="Discard draft"
            >
              <Text style={styles.draftExitDangerTxt}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.draftExitSecondary}
              onPress={() => {
                setCancelDraftVisible(false);
                void saveDraft();
              }}
              accessibilityRole="button"
              accessibilityLabel="Save draft"
            >
              <Text style={styles.draftExitSecondaryTxt}>Save draft</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_COLORS.background },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: 10,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  bannerText: { fontSize: 13, color: DS_COLORS.TEXT_PRIMARY, flex: 1 },
  bannerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: GRIIT_COLORS.primary },
  bannerBtnText: { color: DS_COLORS.TEXT_ON_DARK, fontWeight: "700", fontSize: 12 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    paddingBottom: 8,
  },
  cancel: { fontSize: 16, color: DS_COLORS.TEXT_SECONDARY },
  topTitle: { fontSize: 17, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, gap: 4 },
  stepperItem: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS_COLORS.border },
  stepDotOn: { backgroundColor: GRIIT_COLORS.primary },
  stepLine: { width: 24, height: 2, backgroundColor: DS_COLORS.border },
  stepLineOn: { backgroundColor: GRIIT_COLORS.primary },
  scroll: { paddingHorizontal: DS_SPACING.lg },
  h1: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  sub: { fontSize: 16, fontWeight: "400", color: DS_COLORS.textSecondary, marginBottom: 20 },
  fieldLabel: { fontSize: 15, fontWeight: "600", color: DS_COLORS.textSecondary, marginBottom: 8 },
  light: { color: DS_COLORS.TEXT_MUTED, fontWeight: "400" },
  input: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  inputErr: { borderColor: DS_COLORS.errorText },
  errText: { color: DS_COLORS.errorText, fontSize: 12, marginTop: 6 },
  whoRow: { flexDirection: "row", gap: 8 },
  whoCard: {
    flex: 1,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  whoCardSel: {
    borderColor: CREATE_SELECTION.border,
    backgroundColor: CREATE_SELECTION.background,
  },
  whoTitle: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginTop: 6 },
  whoSub: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, textAlign: "center", marginTop: 4 },
  customRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  daysLabel: { fontSize: 15, color: DS_COLORS.TEXT_SECONDARY },
  typeRow: { flexDirection: "row", gap: 8 },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.surface,
  },
  typeCardSel: { borderColor: CREATE_SELECTION.border, backgroundColor: CREATE_SELECTION.background },
  typeCardTitle: { fontSize: 15, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  typeCardSub: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginTop: 4 },
  packsHead: { fontSize: 15, fontWeight: "600", color: DS_COLORS.TEXT_MUTED, marginBottom: 8 },
  packCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    padding: 12,
  },
  packCardSel: { borderColor: CREATE_SELECTION.border, backgroundColor: CREATE_SELECTION.background },
  packEmoji: { fontSize: 24, marginBottom: 6 },
  packName: { fontSize: 14, fontWeight: "700", color: GRIIT_COLORS.primary },
  packDesc: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginTop: 4 },
  packCount: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginTop: 6 },
  listHead: { fontSize: 15, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY, marginTop: 16, marginBottom: 8 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.chipFill,
    gap: 8,
  },
  taskTitleRow: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0, gap: 6 },
  taskTitle: { flexShrink: 1, fontSize: 15, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  hardBadge: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexShrink: 0,
  },
  hardBadgeText: { fontSize: 11, fontWeight: "500", color: DS_COLORS.PRIMARY },
  empty: { alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, color: DS_COLORS.TEXT_MUTED, marginTop: 4 },
  dashedAdd: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS.border,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  dashedAddErr: { borderColor: DS_COLORS.errorText },
  dashedAddText: { color: GRIIT_COLORS.primary, fontWeight: "500" },
  catPillWrap: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    padding: 0,
  },
  catPillWrapErr: { borderColor: DS_COLORS.errorText },
  ruleCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.surface,
  },
  ruleCardSel: { borderColor: CREATE_SELECTION.border, backgroundColor: CREATE_SELECTION.background },
  ruleTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6, color: DS_COLORS.TEXT_PRIMARY },
  caption: { fontSize: 13, fontWeight: "400", color: DS_COLORS.TEXT_HINT, marginTop: 6 },
  hardNote: { fontSize: 12, color: GRIIT_COLORS.primary, marginTop: 4 },
  outlineBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: GRIIT_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineBtnTxt: { color: GRIIT_COLORS.primary, fontWeight: "600" },
  lockHint: { fontSize: 13, fontWeight: "400", color: DS_COLORS.TEXT_HINT, textAlign: "center", marginTop: 16 },
  footer: {
    paddingHorizontal: DS_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.background,
  },
  primary: {
    backgroundColor: GRIIT_COLORS.primary,
    height: 52,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryTxt: { color: DS_COLORS.TEXT_ON_DARK, fontSize: 17, fontWeight: "600" },
  primaryDisabled: { backgroundColor: DS_COLORS.buttonDisabledBg },
  primaryTxtDisabled: { color: DS_COLORS.buttonDisabledText },
  charCount: {
    fontSize: 11,
    color: DS_COLORS.TEXT_TERTIARY,
    textAlign: "right",
    marginTop: 4,
  },
  backOut: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  backOutTxt: { fontSize: 16, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  rowFooter: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 8 },
  launch: {
    flex: 1,
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  launchTxt: { color: DS_COLORS.TEXT_ON_DARK, fontSize: 17, fontWeight: "600" },
  topBarSpacer: { width: 56 },
  inviteSection: { marginTop: 16 },
  draftExitBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: DS_COLORS.modalBackdrop,
  },
  draftExitCard: {
    backgroundColor: DS_COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  draftExitTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: "center",
  },
  draftExitPrimary: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  draftExitPrimaryTxt: { fontSize: 16, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  draftExitDanger: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DS_COLORS.alertRedBorder,
    backgroundColor: DS_COLORS.dangerLight,
  },
  draftExitDangerTxt: { fontSize: 16, fontWeight: "600", color: DS_COLORS.dangerDark },
  draftExitSecondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  draftExitSecondaryTxt: { fontSize: 16, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  flex1: { flex: 1 },
  shakeWrap: {},
  saveDraftText: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  colGapSm: { flexDirection: "column", gap: DS_SPACING.SM },
  rowGapSm: { flexDirection: "row", gap: DS_SPACING.SM },
  colGap10: { flexDirection: "column", gap: 10 },
  rowGap10: { flexDirection: "row", gap: 10 },
  rowStartGap8Mb4: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  mt2: { marginTop: 2 },
  rowBetweenStartMb8: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  text14SecondaryMt4: { fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, marginTop: 4 },
  text13SemiboldPrimary: { fontSize: 13, fontWeight: "600", color: DS_COLORS.PRIMARY },
  mt12ColGap6: { marginTop: 12, flexDirection: "column", gap: 6 },
  rowGap6: { flexDirection: "row", gap: 6 },
  text13MediumSecondary: { fontSize: 13, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  dividerMv16: { height: 1, backgroundColor: DS_COLORS.DIVIDER, marginVertical: 16 },
  rowBetweenCenter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  text13Hint: { fontSize: 13, color: DS_COLORS.TEXT_HINT },
  text18BoldPrimaryMt2: { fontSize: 18, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginTop: 2 },
  itemsEnd: { alignItems: "flex-end" },
  text18: { fontSize: 18 },
  text16SemiboldPrimary: { fontSize: 16, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  text13HintMt2: { fontSize: 13, color: DS_COLORS.TEXT_HINT, marginTop: 2 },
  text13: { fontSize: 13 },
  text13HintMt8Lh20: { fontSize: 13, color: DS_COLORS.TEXT_HINT, marginTop: 8, lineHeight: 20 },
  hardWarningBox: {
    backgroundColor: DS_COLORS.CREATE_HARD_WARNING_BG,
    borderWidth: 1.5,
    borderColor: DS_COLORS.CREATE_HARD_WARNING_BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  hardWarningText: { fontSize: 14, color: DS_COLORS.CREATE_HARD_WARNING_TEXT, lineHeight: 21 },
  saveDraftBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.CARD_BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  saveDraftBtnDisabled: { opacity: 0.6 },
});

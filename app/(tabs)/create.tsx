import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  BookOpen,
  Timer,
  Camera,
  Footprints,
  CheckCircle,
  Trash2,
  Clock,
  MapPin,
  Check,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Globe,
  Users,
  User,
  Lock,
  Target,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import * as Haptics from 'expo-haptics';
import { ChallengeType, ReplayPolicy, JournalCategory, WordLimitMode, ScheduleType, WindowMode, TimezoneMode, ChallengeVisibility } from "@/types";
import { trpcMutate } from "@/lib/trpc";
import { useApi } from "@/contexts/ApiContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatTimeHHMM } from "@/lib/time-enforcement";

import { formatTRPCError, getApiBaseUrl, formatError } from "@/lib/api";
import {
  getDurationFromDraft,
  validateDraftTasks,
  buildCreatePayload,
  canProceedStep1 as canProceedStep1Helper,
  type ParticipationTypeUI,
  type DeadlineTypeUI,
} from "@/lib/create-challenge-helpers";
import { styles } from "@/styles/create-styles";
import TaskEditorModal, { type TaskEditorTask } from '@/components/TaskEditorModal';
import {
  ChallengeStepper,
  ChallengeTypeCard,
  CreateFlowHeader,
  CreateFlowInput,
  DurationPill,
  CategoryTag,
  PrimaryButtonCreate,
  DailyTaskRow,
} from "@/src/components/ui";
import { colors as tokenColors } from "@/src/theme/tokens";

type TaskType = "journal" | "timer" | "run" | "simple" | "checkin" | "photo";
type TrackingMode = "distance" | "time";
type DistanceUnit = "miles" | "km" | "meters";

interface LocationItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  required: boolean;
  minWords?: number;
  targetValue?: number;
  unit?: DistanceUnit | "minutes";
  trackingMode?: TrackingMode;
  photoRequired?: boolean;
  requirePhotoProof?: boolean;
  strictTimerMode?: boolean;
  locationName?: string;
  radiusMeters?: number;
  durationMinutes?: number;
  mustCompleteInSession?: boolean;
  locations?: LocationItem[];
  startTime?: string;
  startWindowMinutes?: number;
  minSessionMinutes?: number;
  journalType?: JournalCategory[];
  journalPrompt?: string;
  allowFreeWrite?: boolean;
  captureMood?: boolean;
  captureEnergy?: boolean;
  captureBodyState?: boolean;
  wordLimitEnabled?: boolean;
  wordLimitMode?: WordLimitMode;
  wordLimitWords?: number | null;
  timeEnforcementEnabled?: boolean;
  scheduleType?: ScheduleType;
  anchorTimeLocal?: string | null;
  taskDurationMinutes?: number | null;
  windowMode?: WindowMode;
  windowStartOffsetMin?: number | null;
  windowEndOffsetMin?: number | null;
  hardWindowStartOffsetMin?: number | null;
  hardWindowEndOffsetMin?: number | null;
  hardWindowEnabled?: boolean;
  timezoneMode?: TimezoneMode;
  challengeTimezone?: string | null;
  verificationMethod?: string;
  verificationRuleJson?: { sport?: string; min_distance_m?: number; min_moving_time_s?: number } | null;
}

const DURATION_PRESETS = [7, 14, 30, 75];
const CATEGORIES = ["Fitness", "Mind", "Faith", "Discipline", "Other"];

// TODO: backend may provide challenge packs; using client-side presets for now
const CHALLENGE_PACKS: {
  id: string;
  icon: string;
  title: string;
  description: string;
  taskCount: number;
  buildTasks: () => TaskTemplate[];
}[] = [
  {
    id: "athlete",
    icon: "🏋️",
    title: "Athlete Pack",
    description: "Run, train, and track your body daily.",
    taskCount: 3,
    buildTasks: () => [
      { id: "a1", title: "Morning run", type: "run", required: true, trackingMode: "distance", targetValue: 3, unit: "miles" },
      { id: "a2", title: "Workout", type: "run", required: true, trackingMode: "time", targetValue: 30, unit: "minutes" },
      { id: "a3", title: "Body check-in", type: "journal", required: true, journalType: ["physical_state"], journalPrompt: "How did your body feel today? Energy, soreness, recovery.", captureMood: true, captureEnergy: true },
    ],
  },
  {
    id: "faith",
    icon: "🙏",
    title: "Faith Pack",
    description: "Prayer, reflection, and spiritual growth.",
    taskCount: 3,
    buildTasks: () => [
      { id: "f1", title: "Prayer", type: "simple", required: true },
      { id: "f2", title: "Reflection", type: "journal", required: true, journalType: ["self_reflection"], journalPrompt: "What did you learn about yourself today?", captureMood: true },
      { id: "f3", title: "Gratitude", type: "journal", required: true, journalType: ["gratitude"], journalPrompt: "Write three things you're grateful for today.", captureMood: false },
    ],
  },
  {
    id: "entrepreneur",
    icon: "🔨",
    title: "Entrepreneur Pack",
    description: "Ship, build, and reflect on your progress.",
    taskCount: 3,
    buildTasks: () => [
      { id: "e1", title: "Ship something", type: "simple", required: true },
      { id: "e2", title: "Build log", type: "journal", required: true, journalType: ["wins_losses"], journalPrompt: "What did you ship or build today?", captureMood: true },
      { id: "e3", title: "Reflection", type: "journal", required: true, journalType: ["mental_clarity"], journalPrompt: "Describe your progress and blockers.", captureEnergy: true },
    ],
  },
  {
    id: "hyrox",
    icon: "⚡",
    title: "HYROX Pack",
    description: "Run, row, and functional training.",
    taskCount: 4,
    buildTasks: () => [
      { id: "h1", title: "Run", type: "run", required: true, trackingMode: "distance", targetValue: 5, unit: "km" },
      { id: "h2", title: "Row", type: "run", required: true, trackingMode: "time", targetValue: 15, unit: "minutes" },
      { id: "h3", title: "Functional", type: "timer", required: true, durationMinutes: 20, mustCompleteInSession: true },
      { id: "h4", title: "Cool down", type: "journal", required: true, journalType: ["physical_state"], journalPrompt: "How did your body recover?", captureBodyState: true },
    ],
  },
  {
    id: "morning",
    icon: "☀️",
    title: "Morning Routine",
    description: "Win the morning, win the day.",
    taskCount: 5,
    buildTasks: () => [
      { id: "m1", title: "Wake early", type: "simple", required: true },
      { id: "m2", title: "Morning run", type: "run", required: true, trackingMode: "distance", targetValue: 2, unit: "miles" },
      { id: "m3", title: "Meditate", type: "timer", required: true, durationMinutes: 10, mustCompleteInSession: true },
      { id: "m4", title: "Journal", type: "journal", required: true, journalType: ["self_reflection"], journalPrompt: "What was the hardest part of today and how did you push through?", captureMood: true, captureEnergy: true },
      { id: "m5", title: "Plan day", type: "simple", required: true },
    ],
  },
];

const PACK_CARD_BORDER: Record<string, string> = {
  athlete: Colors.border,
  faith: "#93C5FD",
  entrepreneur: Colors.border,
  hyrox: "#FDBA74",
  morning: "#FDBA74",
};

const PARTICIPATION_OPTIONS: { id: ParticipationTypeUI; label: string; description: string; Icon: typeof User }[] = [
  { id: "solo", label: "Solo", description: "Just you. Complete every task, every day.", Icon: User },
  { id: "team", label: "Team", description: "2–10 people. Everyone must complete daily tasks. If one fails, everyone fails.", Icon: Users },
  { id: "shared_goal", label: "Shared Goal", description: "2–10 people. Work together toward one big target. Log progress anytime.", Icon: Target },
];

const DEADLINE_OPTIONS: { id: DeadlineTypeUI; label: string; description: string }[] = [
  { id: "none", label: "No deadline", description: "Finish whenever" },
  { id: "soft", label: "Soft deadline", description: "Target date (no penalty for missing)" },
  { id: "hard", label: "Hard deadline", description: "Must complete by this date or the challenge fails" },
];

const CHALLENGE_TYPES: { id: ChallengeType; label: string; description: string }[] = [
  { id: "standard", label: "Standard", description: "Multi-day challenge with daily tasks" },
  { id: "one_day", label: "24-Hour", description: "One day challenge, can be live or replayable" },
];

const REPLAY_POLICIES: { id: ReplayPolicy; label: string; description: string }[] = [
  { id: "live_only", label: "Live Only", description: "Users must complete on the live date" },
  { id: "allow_replay", label: "Allow Replay", description: "Users can attempt later" },
];

const VISIBILITY_OPTIONS: { value: ChallengeVisibility; label: string; description: string; icon: React.ComponentType<any> }[] = [
  { value: "PUBLIC", label: "Everyone", description: "Shown on Discover. Anyone can join.", icon: Globe },
  { value: "FRIENDS", label: "Friends", description: "Only your friends can see and join.", icon: Users },
  { value: "PRIVATE", label: "Only me", description: "Just for you. No one can see or join.", icon: Lock },
];

const TASK_TYPE_CONFIG: Record<TaskType, { icon: any; label: string; color: string }> = {
  journal: { icon: BookOpen, label: "Journal", color: "#6366F1" },
  timer: { icon: Timer, label: "Timer", color: "#F59E0B" },
  run: { icon: Footprints, label: "Run / Workout", color: "#10B981" },
  simple: { icon: CheckCircle, label: "Basic", color: "#6B7280" },
  checkin: { icon: MapPin, label: "Location Check-in", color: "#0EA5E9" },
  photo: { icon: Camera, label: "Photo", color: "#EC4899" },
};

export default function CreateScreen() {
  const router = useRouter();
  const isGuest = useIsGuest();
  const { showGate } = useAuthGate();
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("standard");
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskTemplate[]>([]);
  const [showTaskBuilder, setShowTaskBuilder] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [liveDate, setLiveDate] = useState("");
  const [replayPolicy, setReplayPolicy] = useState<ReplayPolicy>("allow_replay");
  const [requireSameRules, setRequireSameRules] = useState(true);
  const [showReplayLabel, setShowReplayLabel] = useState(true);
  const [visibility, setVisibility] = useState<ChallengeVisibility>("FRIENDS");
  const [showPurposeSection, setShowPurposeSection] = useState(false);
  const [participationType, setParticipationType] = useState<ParticipationTypeUI>("solo");
  const [teamSize, setTeamSize] = useState(2);
  const [sharedGoalTarget, setSharedGoalTarget] = useState("");
  const [sharedGoalUnit, setSharedGoalUnit] = useState("");
  const [deadlineType, setDeadlineType] = useState<DeadlineTypeUI>("none");
  const [deadlineDate, setDeadlineDate] = useState("");

  const [, setNewTaskTitle] = useState("");
  const [, setNewTaskType] = useState<TaskType | null>(null);
  const [, setNewTaskMinWords] = useState("50");
  const [, setJournalType] = useState<JournalCategory[]>([]);
  const [, setJournalPrompt] = useState("");
  const [, setAllowFreeWrite] = useState(false);
  const [, setCaptureMood] = useState(true);
  const [, setCaptureEnergy] = useState(true);
  const [, setCaptureBodyState] = useState(false);
  const [, setWordLimitEnabled] = useState(false);
  const [, setWordLimitMode] = useState<WordLimitMode>("PRESET");
  const [, setWordLimitWords] = useState<number | null>(120);
  const [, setCustomWordLimit] = useState("");
  const [, setTimeEnforcementEnabled] = useState(false);
  const [, setTeAnchorTime] = useState("05:00");
  const [, setTeTaskDuration] = useState("");
  const [, setTeWindowStartOffset] = useState("0");
  const [, setTeWindowEndOffset] = useState("60");
  const [, setTeHardWindowEnabled] = useState(false);
  const [, setTeHardStartOffset] = useState("0");
  const [, setTeHardEndOffset] = useState("30");
  const [, setTeTimezoneMode] = useState<TimezoneMode>("USER_LOCAL");
  const [, setTeChallengeTimezone] = useState("");
  const [, setNewTaskDuration] = useState("10");
  const [, setNewTaskMustComplete] = useState(true);
  const [, setNewTaskStrictTimerMode] = useState(false);
  const [, setNewTaskRequirePhotoProof] = useState(false);
  const [, setNewTaskLocations] = useState<LocationItem[]>([]);
  const [, setNewTaskStartTime] = useState("05:00");
  const [, setNewTaskWindowMinutes] = useState("10");
  const [, setNewTaskSessionMinutes] = useState("15");
  const [, setTrackingMode] = useState<TrackingMode>("distance");
  const [, setTargetDistance] = useState("5");
  const [, setDistanceUnit] = useState<DistanceUnit>("miles");
  const [, setLocationName] = useState("");
  const [, setRadiusMeters] = useState("150");

  const { apiStatus, retryNow: retryApi, getDiagnosticsString } = useApi();
  const slideAnim = useRef(new Animated.Value(0)).current;

  type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const startWatchdog = useCallback(() => {
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      setSubmitStatus('error');
      setRecoveryMessage('Server not responding. Your challenge data is preserved — you can retry or save as draft.');
      setShowRecoveryModal(true);
    }, 15000);
  }, [clearWatchdog]);

  useEffect(() => {
    return () => clearWatchdog();
  }, [clearWatchdog]);

  const getDuration = useCallback(
    (): number => getDurationFromDraft(challengeType, durationDays, customDuration),
    [challengeType, durationDays, customDuration]
  );

  const validateTasks = useCallback(
    (): { valid: boolean; error?: string } => validateDraftTasks(tasks, participationType),
    [tasks, participationType]
  );

  const duration = getDuration();
  const canProceedStep1 = canProceedStep1Helper(
    title,
    duration,
    challengeType,
    liveDate,
    participationType,
    sharedGoalTarget ? parseInt(sharedGoalTarget, 10) : undefined,
    sharedGoalUnit.trim() || undefined,
    deadlineType,
    deadlineDate.trim() || null
  );
  const isSharedGoal = participationType === "shared_goal";
  const isTeamOrShared = participationType === "team" || isSharedGoal;
  const canProceedStep2 = isSharedGoal ? true : tasks.length > 0;
  const canCreateChallenge =
    canProceedStep1 &&
    canProceedStep2 &&
    validateDraftTasks(tasks, participationType).valid;

  const handleTaskSave = useCallback((task: TaskEditorTask) => {
    const asTemplate = task as unknown as TaskTemplate;
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? asTemplate : t));
    } else {
      setTasks(prev => [...prev, asTemplate]);
    }
    setShowTaskBuilder(false);
    setEditingTask(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [editingTask]);

  const createMutationPendingRef = useRef(false);

  const handleCreate = useCallback(() => {
    if (submitStatus === 'submitting' || createMutationPendingRef.current) {
      return;
    }
    const validation = validateTasks();
    if (!validation.valid) {
      Alert.alert("Invalid Task", validation.error || "Please fix task configuration");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a challenge title");
      return;
    }
    if (participationType !== "shared_goal" && getDuration() <= 0) {
      Alert.alert("Invalid Duration", "Please select a valid duration");
      return;
    }
    if (participationType === "shared_goal") {
      const target = parseInt(sharedGoalTarget, 10);
      if (!sharedGoalUnit.trim() || !Number.isFinite(target) || target <= 0) {
        Alert.alert("Invalid Goal", "Enter a positive target and unit (e.g. 100 miles)");
        return;
      }
      if (deadlineType === "hard" && deadlineDate.trim()) {
        const today = new Date().toISOString().split("T")[0];
        if (deadlineDate.trim() < today) {
          Alert.alert("Invalid Deadline", "Hard deadline must be in the future");
          return;
        }
      }
    } else if (tasks.length === 0) {
      Alert.alert("No Tasks", "Add at least one task to your challenge");
      return;
    }
    setSubmitStatus('submitting');
    startWatchdog();
    createMutationPendingRef.current = true;

    const draft = {
      title,
      description,
      type: challengeType,
      durationDays,
      customDuration,
      categories,
      tasks,
      liveDate,
      replayPolicy,
      requireSameRules,
      showReplayLabel,
      visibility,
      participationType,
      teamSize,
      sharedGoalTarget: sharedGoalTarget ? parseInt(sharedGoalTarget, 10) : undefined,
      sharedGoalUnit: sharedGoalUnit.trim() || undefined,
      deadlineType,
      deadlineDate: deadlineDate.trim() || undefined,
    };
    const payload = buildCreatePayload(draft);

    trpcMutate('challenges.create', payload)
      .then((challenge: any) => {
        clearWatchdog();
        setSubmitStatus('success');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.push({
          pathname: "/success" as any,
          params: {
            challengeId: challenge.id,
            title: challenge.title,
            duration: String(challenge.duration_days ?? getDuration()),
            tasksCount: String(challenge.tasks?.length ?? tasks.length),
            difficulty: challenge.difficulty ?? "medium",
            isCreateSuccess: "true",
            waitingForTeam: isTeamOrShared ? "true" : undefined,
          },
        });
        setTitle("");
        setDescription("");
        setChallengeType("standard");
        setDurationDays(null);
        setCustomDuration("");
        setCategories([]);
        setTasks([]);
        setLiveDate("");
        setReplayPolicy("allow_replay");
        setRequireSameRules(true);
        setShowReplayLabel(true);
        setVisibility("FRIENDS");
        setParticipationType("solo");
        setTeamSize(2);
        setSharedGoalTarget("");
        setSharedGoalUnit("");
        setDeadlineType("none");
        setDeadlineDate("");
        setStep(1);
        setSubmitStatus('idle');
      })
      .catch((error: any) => {
        clearWatchdog();
        setSubmitStatus('error');
        const errorInfo = formatTRPCError(error);
        const isTimeout = formatError(error).includes('REQUEST_TIMEOUT');
        if (isTimeout) {
          setRecoveryMessage("Server didn't respond in time. Your challenge data is preserved.");
          setShowRecoveryModal(true);
        } else if (errorInfo.isNetwork) {
          setRecoveryMessage('Cannot reach server. The backend may be starting up.');
          setShowRecoveryModal(true);
        } else {
          Alert.alert(errorInfo.title, errorInfo.message, [
            { text: "OK", style: "cancel" as const },
          ]);
        }
      })
      .finally(() => {
        createMutationPendingRef.current = false;
      });
  }, [submitStatus, title, description, challengeType, durationDays, customDuration, categories, tasks, liveDate, replayPolicy, requireSameRules, showReplayLabel, visibility, participationType, teamSize, sharedGoalTarget, sharedGoalUnit, deadlineType, deadlineDate, isTeamOrShared, startWatchdog, clearWatchdog, getDuration, validateTasks, router]);

  const handleRetryFromModal = useCallback(async () => {
    setShowRecoveryModal(false);
    setSubmitStatus('idle');
    await retryApi();
    setTimeout(() => handleCreate(), 1500);
  }, [retryApi, handleCreate]);

  const handleDismissRecovery = useCallback(() => {
    setShowRecoveryModal(false);
    setSubmitStatus('idle');
  }, []);

  if (isGuest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokenColors.bgMain ?? "#F7F7F6", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: tokenColors.textPrimary ?? "#111", marginBottom: 8, textAlign: "center" }}>Sign up to create challenges</Text>
        <Text style={{ fontSize: 15, color: tokenColors.textSecondaryCreate ?? "#6E6E6C", marginBottom: 24, textAlign: "center" }}>Create an account to design and launch your own challenges.</Text>
        <TouchableOpacity
          style={{ backgroundColor: tokenColors.accentOrangeCreate ?? "#E17847", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14 }}
          onPress={() => showGate("create")}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>Sign up</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const animateStep = (direction: "next" | "prev") => {
    const toValue = direction === "next" ? -20 : 20;
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      Alert.alert("Missing Info", "Please add a title and duration");
      return;
    }
    if (step === 2 && !canProceedStep2) {
      Alert.alert("Add Tasks", "Add at least one daily task");
      return;
    }
    animateStep("next");
    setStep(step + 1);
  };

  const handleBack = () => {
    animateStep("prev");
    setStep(step - 1);
  };

  const handleEditTask = (task: TaskTemplate) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskType(task.type);
    if (task.journalType) setJournalType(task.journalType);
    if (task.journalPrompt) setJournalPrompt(task.journalPrompt);
    if (task.allowFreeWrite !== undefined) setAllowFreeWrite(task.allowFreeWrite);
    if (task.captureMood !== undefined) setCaptureMood(task.captureMood);
    if (task.captureEnergy !== undefined) setCaptureEnergy(task.captureEnergy);
    if (task.captureBodyState !== undefined) setCaptureBodyState(task.captureBodyState);
    if (task.wordLimitEnabled !== undefined) setWordLimitEnabled(task.wordLimitEnabled);
    if (task.wordLimitMode) setWordLimitMode(task.wordLimitMode);
    if (task.wordLimitWords) {
      setWordLimitWords(task.wordLimitWords);
      if (task.wordLimitMode === "CUSTOM") setCustomWordLimit(task.wordLimitWords.toString());
    }
    if (task.minWords) setNewTaskMinWords(task.minWords.toString());
    if (task.durationMinutes) setNewTaskDuration(task.durationMinutes.toString());
    if (task.targetValue) {
      if (task.type === "run" && task.trackingMode === "distance") {
        setTargetDistance(task.targetValue.toString());
      } else {
        setNewTaskDuration(task.targetValue.toString());
      }
    }
    if (task.unit && task.unit !== "minutes") setDistanceUnit(task.unit as DistanceUnit);
    if (task.trackingMode) setTrackingMode(task.trackingMode);
    if (task.mustCompleteInSession !== undefined) setNewTaskMustComplete(task.mustCompleteInSession);
    if (task.strictTimerMode !== undefined) setNewTaskStrictTimerMode(task.strictTimerMode);
    if (task.requirePhotoProof !== undefined) setNewTaskRequirePhotoProof(task.requirePhotoProof);
    if (task.locations) setNewTaskLocations(task.locations);
    if (task.locationName) setLocationName(task.locationName);
    if (task.radiusMeters) setRadiusMeters(task.radiusMeters.toString());
    if (task.startTime) setNewTaskStartTime(task.startTime);
    if (task.startWindowMinutes) setNewTaskWindowMinutes(task.startWindowMinutes.toString());
    if (task.minSessionMinutes) setNewTaskSessionMinutes(task.minSessionMinutes.toString());
    if (task.timeEnforcementEnabled) {
      setTimeEnforcementEnabled(true);
      if (task.anchorTimeLocal) setTeAnchorTime(task.anchorTimeLocal);
      if (task.taskDurationMinutes) setTeTaskDuration(task.taskDurationMinutes.toString());
      if (task.windowStartOffsetMin != null) setTeWindowStartOffset(task.windowStartOffsetMin.toString());
      if (task.windowEndOffsetMin != null) setTeWindowEndOffset(task.windowEndOffsetMin.toString());
      if (task.hardWindowEnabled) {
        setTeHardWindowEnabled(true);
        if (task.hardWindowStartOffsetMin != null) setTeHardStartOffset(task.hardWindowStartOffsetMin.toString());
        if (task.hardWindowEndOffsetMin != null) setTeHardEndOffset(task.hardWindowEndOffsetMin.toString());
      }
      if (task.timezoneMode) setTeTimezoneMode(task.timezoneMode);
      if (task.challengeTimezone) setTeChallengeTimezone(task.challengeTimezone);
    }
    setShowTaskBuilder(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const getVerificationSummary = (task: TaskTemplate): string => {
    const parts: string[] = [];

    if (task.requirePhotoProof) parts.push("Photo proof");
    if (task.timeEnforcementEnabled && task.anchorTimeLocal) {
      parts.push(formatTimeHHMM(task.anchorTimeLocal));
    }

    switch (task.type) {
      case "journal": {
        if (task.journalPrompt) {
          const preview = task.journalPrompt.length > 30 ? task.journalPrompt.slice(0, 30) + "..." : task.journalPrompt;
          parts.push(preview);
        }
        if (task.wordLimitEnabled && task.wordLimitWords) {
          parts.push(`${task.wordLimitWords}w limit`);
        }
        return parts.length > 0 ? parts.join(" · ") : `${task.minWords || 50} words minimum`;
      }
      case "timer":
        parts.push(`${task.targetValue || task.durationMinutes || 10} min${task.mustCompleteInSession ? ", no exit" : ""}${task.strictTimerMode ? ", strict timer" : ""}`);
        return parts.join(" · ");
      case "run":
        if (task.trackingMode === "distance") {
          parts.push(`${task.targetValue || 0} ${task.unit || "miles"}`);
        } else {
          parts.push(`${task.targetValue || 0} minutes`);
        }
        return parts.join(" · ");
      case "simple":
        parts.push("Tap to verify");
        return parts.join(" · ");
      case "checkin":
        parts.push(task.locationName ? `${task.locationName} (${task.radiusMeters || 150}m)` : `${task.startTime || "5:00 AM"} · ${task.locations?.length || 0} location(s)`);
        return parts.join(" · ");
      default:
        return parts.join(" · ");
    }
  };

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Define your challenge</Text>
      <Text style={styles.stepSubtitle}>Set up your challenge</Text>
      <Text style={styles.stepHelper}>Most people finish this in under 2 minutes.</Text>

      <View style={styles.fieldGroup}>
        <CreateFlowInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. 75 Day Hard"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Who&apos;s in this challenge?</Text>
        <View style={styles.challengeTypeRow}>
          {PARTICIPATION_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.participationCard,
                  participationType === opt.id && styles.participationCardActive,
                ]}
                onPress={() => setParticipationType(opt.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.participationIconWrap, participationType === opt.id && styles.participationIconWrapActive]}>
                  <Icon size={22} color={participationType === opt.id ? "#fff" : Colors.text.tertiary} />
                </View>
                <Text style={[styles.participationLabel, participationType === opt.id && styles.participationLabelActive]}>{opt.label}</Text>
                <Text style={styles.participationDesc} numberOfLines={2}>{opt.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isTeamOrShared && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Team size</Text>
          <Text style={styles.stepHelper}>How many people? (2–10)</Text>
          <View style={styles.durationRow}>
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <DurationPill
                key={n}
                label={String(n)}
                selected={teamSize === n}
                onPress={() => setTeamSize(n)}
              />
            ))}
          </View>
        </View>
      )}

      {isSharedGoal && (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Goal target</Text>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. 100"
                placeholderTextColor={Colors.text.tertiary}
                value={sharedGoalTarget}
                onChangeText={setSharedGoalTarget}
                keyboardType="number-pad"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. miles, pages"
                placeholderTextColor={Colors.text.tertiary}
                value={sharedGoalUnit}
                onChangeText={setSharedGoalUnit}
              />
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Deadline</Text>
            <View style={styles.replayPolicyRow}>
              {DEADLINE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.replayPolicyCard,
                    deadlineType === opt.id && styles.replayPolicyCardActive,
                  ]}
                  onPress={() => setDeadlineType(opt.id)}
                >
                  <Text style={[styles.replayPolicyLabel, deadlineType === opt.id && styles.replayPolicyLabelActive]}>{opt.label}</Text>
                  <Text style={styles.replayPolicyDesc}>{opt.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(deadlineType === "soft" || deadlineType === "hard") && (
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.text.tertiary}
                value={deadlineDate}
                onChangeText={setDeadlineDate}
              />
            )}
          </View>
        </>
      )}

      {(participationType === "solo" || participationType === "team") && (
        <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Challenge type</Text>
        <View style={styles.challengeTypeRow}>
          {CHALLENGE_TYPES.map((type) => (
            <ChallengeTypeCard
              key={type.id}
              title={type.label}
              description={type.description}
              selected={challengeType === type.id}
              onPress={() => {
                setChallengeType(type.id);
                if (type.id === "one_day") {
                  setDurationDays(1);
                  setCustomDuration("");
                }
              }}
            />
          ))}
        </View>
      </View>

      {challengeType === "standard" ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATION_PRESETS.map((d) => (
              <DurationPill
                key={d}
                label={`${d} days`}
                selected={durationDays === d}
                onPress={() => {
                  setDurationDays(d);
                  setCustomDuration("");
                }}
              />
            ))}
            <DurationPill
              label="Custom"
              selected={durationDays === null}
              onPress={() => setDurationDays(null)}
            />
            {(!durationDays || durationDays === null) && (
              <TextInput
                style={[styles.durationInput, customDuration && styles.durationInputActive]}
                placeholder="Days"
                placeholderTextColor={Colors.text.tertiary}
                value={customDuration}
                onChangeText={(v) => {
                  setCustomDuration(v);
                  setDurationDays(null);
                }}
                keyboardType="number-pad"
              />
            )}
          </View>
          <Text style={styles.durationHint}>Pick a preset or enter custom days</Text>
        </View>
      ) : (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Live Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.text.tertiary}
              value={liveDate}
              onChangeText={setLiveDate}
            />
            <Text style={styles.durationHint}>When should this challenge go live?</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Replay Policy</Text>
            <View style={styles.replayPolicyRow}>
              {REPLAY_POLICIES.map((policy) => (
                <TouchableOpacity
                  key={policy.id}
                  style={[
                    styles.replayPolicyCard,
                    replayPolicy === policy.id && styles.replayPolicyCardActive,
                  ]}
                  onPress={() => setReplayPolicy(policy.id)}
                >
                  <Text
                    style={[
                      styles.replayPolicyLabel,
                      replayPolicy === policy.id && styles.replayPolicyLabelActive,
                    ]}
                  >
                    {policy.label}
                  </Text>
                  <Text style={styles.replayPolicyDesc}>{policy.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {replayPolicy === "allow_replay" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Replay Rules</Text>
              <TouchableOpacity
                style={styles.replayToggleRow}
                onPress={() => setRequireSameRules(!requireSameRules)}
              >
                <View style={[styles.replayToggleBox, requireSameRules && styles.replayToggleBoxActive]}>
                  {requireSameRules && <Check size={14} color="#fff" />}
                </View>
                <View style={styles.replayToggleContent}>
                  <Text style={styles.replayToggleLabel}>Require same verification rules</Text>
                  <Text style={styles.replayToggleDesc}>Replay attempts must follow original rules</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.replayToggleRow}
                onPress={() => setShowReplayLabel(!showReplayLabel)}
              >
                <View style={[styles.replayToggleBox, showReplayLabel && styles.replayToggleBoxActive]}>
                  {showReplayLabel && <Check size={14} color="#fff" />}
                </View>
                <View style={styles.replayToggleContent}>
                  <Text style={styles.replayToggleLabel}>Show Replay label</Text>
                  <Text style={styles.replayToggleDesc}>Distinguish replay completions from live</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </>
  )}

      <View style={styles.fieldGroup}>
        {!showPurposeSection && !description.trim() ? (
          <TouchableOpacity
            style={styles.optionalPurposeTrigger}
            onPress={() => setShowPurposeSection(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionalPurposeTriggerText}>Add purpose (optional)</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.labelOptional}>Purpose (optional)</Text>
            <CreateFlowInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's the goal of this challenge?"
              multiline
            />
          </>
        )}
      </View>

      <View style={[styles.fieldGroup, styles.categoryGroupSecondary]}>
        <Text style={styles.labelOptional}>Category (optional)</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <CategoryTag
              key={c}
              label={c}
              selected={categories.includes(c)}
              onPress={() => setCategories(prev => prev.includes(c) ? prev.filter(cat => cat !== c) : [...prev, c])}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Daily Tasks</Text>
      <Text style={styles.stepSubtitle}>
        {isSharedGoal
          ? "Your team will log progress toward the goal. Add optional daily habits below."
          : "Add the actions people must complete daily"}
      </Text>
      <Text style={styles.stepHelper}>
        {isSharedGoal
          ? `Goal: ${sharedGoalTarget || "—"} ${sharedGoalUnit.trim() || ""}. Tasks are optional for shared goals.`
          : "The best challenges are simple and repeatable."}
      </Text>

      {isSharedGoal && (
        <View style={[styles.reviewSummaryCard, { marginBottom: 20 }]}>
          <Text style={styles.reviewSummaryMetaText}>
            Your team will log <Text style={{ fontWeight: "700" }}>{sharedGoalUnit.trim() || "units"}</Text> toward the goal of{" "}
            <Text style={{ fontWeight: "700" }}>{sharedGoalTarget || "—"} {sharedGoalUnit.trim() || ""}</Text>.
          </Text>
        </View>
      )}

      <View style={step2Styles.packsSection}>
        <Text style={step2Styles.packsTitle}>Quick start with packs</Text>
        <Text style={step2Styles.packsSubtitle}>One tap applies a full set of daily tasks</Text>
        <View style={step2Styles.packsGrid}>
          {CHALLENGE_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[step2Styles.packCard, { borderColor: PACK_CARD_BORDER[pack.id] ?? Colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTasks(pack.buildTasks());
              }}
              activeOpacity={0.7}
            >
              <Text style={step2Styles.packIcon}>{pack.icon}</Text>
              <Text style={step2Styles.packTitle} numberOfLines={1}>{pack.title}</Text>
              <Text style={step2Styles.packDesc} numberOfLines={2}>{pack.description}</Text>
              <Text style={step2Styles.packTaskCount}>{pack.taskCount} tasks</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tasks.length === 0 ? (
        <View style={step2Styles.emptyState}>
          <View style={step2Styles.emptyIcon}>
            <Plus size={28} color={Colors.text.tertiary} />
          </View>
          <Text style={step2Styles.emptyTitle}>Add your daily tasks</Text>
          <Text style={step2Styles.emptyDesc}>Start with 1–3 tasks people can realistically complete every day.</Text>
          <Text style={step2Styles.emptyHelper}>Best challenges usually have 2–5 daily tasks.</Text>
        </View>
      ) : (
        <View style={step2Styles.taskList}>
          {tasks.map((task) => {
            const config = TASK_TYPE_CONFIG[task.type];
            const Icon = config.icon;
            return (
              <TouchableOpacity
                key={task.id}
                style={step2Styles.taskCard}
                onPress={() => handleEditTask(task)}
                activeOpacity={0.7}
              >
                <View style={[step2Styles.taskIcon, { backgroundColor: `${config.color}12` }]}>
                  <Icon size={20} color={config.color} />
                </View>
                <View style={step2Styles.taskContent}>
                  <View style={step2Styles.taskTitleRow}>
                    <Text style={step2Styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    {task.type === "journal" && (
                      <View style={step2Styles.typePill}>
                        <Text style={step2Styles.typePillText}>Journal</Text>
                      </View>
                    )}
                  </View>
                  <Text style={step2Styles.taskMeta} numberOfLines={2}>{getVerificationSummary(task)}</Text>
                  {task.timeEnforcementEnabled && task.anchorTimeLocal && (
                    <View style={step2Styles.timeBadge}>
                      <Clock size={11} color="#0EA5E9" />
                      <Text style={step2Styles.timeBadgeText}>{formatTimeHHMM(task.anchorTimeLocal)}</Text>
                    </View>
                  )}
                  {task.wordLimitEnabled && task.wordLimitWords && (
                    <View style={step2Styles.timeBadge}>
                      <Text style={[step2Styles.timeBadgeText, { color: '#6366F1' }]}>{task.wordLimitWords}w limit</Text>
                    </View>
                  )}
                </View>
                <View style={step2Styles.taskActions}>
                  <Text style={step2Styles.editLabel}>Edit</Text>
                  <TouchableOpacity
                    style={step2Styles.deleteBtn}
                    onPress={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={step2Styles.addBtn}
        onPress={() => { setEditingTask(null); setShowTaskBuilder(true); }}
        activeOpacity={0.7}
      >
        <Plus size={18} color="#fff" />
        <Text style={step2Styles.addBtnText}>{tasks.length === 0 ? "Add your first daily task" : "+ Add Task"}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Review</Text>
      <Text style={styles.stepSubtitle}>Review before publishing</Text>

      <View style={styles.reviewSummaryCard}>
        <Text style={styles.reviewSummaryTitle}>{title || "Untitled"}</Text>
        <View style={styles.reviewSummaryMeta}>
          <Text style={styles.reviewSummaryMetaText}>
            {participationType === "solo" && (challengeType === "one_day" ? "24-Hour" : "Standard")}
            {participationType === "team" && "Team Challenge"}
            {participationType === "shared_goal" && "Shared Goal"}
            {participationType === "team" && ` · ${teamSize} people`}
            {participationType === "shared_goal" && ` · ${teamSize} people`}
            {(participationType === "solo" || participationType === "team") && (
              <> · {challengeType === "one_day" ? liveDate || "—" : `${getDuration()} days`}</>
            )}
            {participationType === "shared_goal" && (
              <> · Goal: {sharedGoalTarget || "—"} {sharedGoalUnit.trim() || ""}</>
            )}
            {participationType === "shared_goal" && (
              <> · Deadline: {deadlineType === "none" ? "No deadline" : deadlineType === "soft" ? `Soft: ${deadlineDate || "—"}` : `Hard: ${deadlineDate || "—"}`}</>
            )}
          </Text>
          {participationType === "team" && (
            <Text style={styles.reviewSummaryMetaText}>If anyone misses a day or quits, the challenge fails for everyone.</Text>
          )}
          {participationType === "shared_goal" && (
            <Text style={styles.reviewSummaryMetaText}>Your team works together to reach the goal. Any member can log progress.</Text>
          )}
          {categories.length > 0 && (
            <Text style={styles.reviewSummaryMetaText}>{categories.join(", ")}</Text>
          )}
          <Text style={styles.reviewSummaryMetaText}>
            Visible to: {VISIBILITY_OPTIONS.find(o => o.value === visibility)?.label}
          </Text>
        </View>
        {description.trim() ? (
          <Text style={styles.reviewSummaryDesc} numberOfLines={2}>{description}</Text>
        ) : null}
      </View>

      <Text style={styles.reviewSectionTitle}>
        {isSharedGoal ? "Daily tasks (optional)" : "Daily tasks"} ({tasks.length})
      </Text>
      <View style={styles.reviewTaskList}>
        {tasks.map((task, idx) => {
          const config = TASK_TYPE_CONFIG[task.type];
          const Icon = config.icon;
          return (
            <DailyTaskRow
              key={task.id}
              icon={<Icon size={20} color={config.color} />}
              iconBackgroundColor={`${config.color}15`}
              title={task.title}
              metadata={getVerificationSummary(task)}
              showDivider={idx < tasks.length - 1}
            />
          );
        })}
      </View>

      <View style={visStyles.section}>
        <Text style={styles.reviewSectionTitle}>Visibility</Text>
        <View style={visStyles.cardList}>
          {VISIBILITY_OPTIONS.map((opt) => {
            const isSelected = visibility === opt.value;
            const IconComp = opt.icon;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[visStyles.card, isSelected && visStyles.cardSelected]}
                onPress={() => setVisibility(opt.value)}
                activeOpacity={0.7}
                testID={`visibility-${opt.value}`}
              >
                <View style={[visStyles.iconWrap, isSelected && visStyles.iconWrapSelected]}>
                  <IconComp size={18} color={isSelected ? "#fff" : Colors.text.tertiary} />
                </View>
                <View style={visStyles.cardContent}>
                  <Text style={[visStyles.cardTitle, isSelected && visStyles.cardTitleSelected]}>{opt.label}</Text>
                  <Text style={visStyles.cardDesc}>{opt.description}</Text>
                </View>
                {isSelected && (
                  <View style={visStyles.checkCircle}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.reviewNote}>
        <Text style={styles.reviewNoteText}>You can edit this later.</Text>
      </View>

      {__DEV__ && (
        <View style={diagStyles.container}>
          <View style={diagStyles.headerRow}>
            <Text style={diagStyles.headerTitle}>Server</Text>
            <View style={[
              diagStyles.statusBadge,
              apiStatus === 'ready' && diagStyles.statusReady,
              apiStatus === 'checking' && diagStyles.statusChecking,
              apiStatus === 'down' && diagStyles.statusDown,
            ]}>
              <View style={[
                diagStyles.statusDot,
                apiStatus === 'ready' && diagStyles.dotReady,
                apiStatus === 'checking' && diagStyles.dotChecking,
                apiStatus === 'down' && diagStyles.dotDown,
              ]} />
              <Text style={[
                diagStyles.statusLabel,
                apiStatus === 'ready' && diagStyles.labelReady,
                apiStatus === 'checking' && diagStyles.labelChecking,
                apiStatus === 'down' && diagStyles.labelDown,
              ]}>
                {apiStatus === 'ready' ? 'Ready' : apiStatus === 'checking' ? 'Checking...' : 'Down'}
              </Text>
            </View>
          </View>
          <View style={diagStyles.infoRow}>
            <Text style={diagStyles.infoLabel}>Base URL</Text>
            <Text style={diagStyles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {(() => { try { return getApiBaseUrl(); } catch { return 'NOT SET'; } })()}
            </Text>
          </View>
          <View style={diagStyles.actionsRow}>
            <TouchableOpacity style={diagStyles.actionBtn} onPress={() => retryApi()}>
              <RefreshCw size={13} color={Colors.accent} />
              <Text style={diagStyles.actionBtnText}>Re-check</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={diagStyles.actionBtn}
              onPress={() => {
                const diagStr = getDiagnosticsString();
                if (Platform.OS === 'web') {
                  try { navigator.clipboard.writeText(diagStr); } catch { /* ignore */ }
                }
                Alert.alert('Diagnostics', diagStr);
              }}
            >
              <Text style={diagStyles.actionBtnText}>Copy diagnostics</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <CreateFlowHeader
          title="Create Challenge"
          onCancel={() => router.back()}
          rightLabel={step === 1 ? "Next" : step === 2 ? "Review" : undefined}
          onRight={step < 3 ? handleNext : undefined}
          rightDisabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
        />
        <View style={styles.stepperWrap}>
          <ChallengeStepper currentStep={step} totalSteps={3} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <TaskEditorModal
          visible={showTaskBuilder}
          editingTask={editingTask}
          onSave={handleTaskSave}
          onCancel={() => { setShowTaskBuilder(false); setEditingTask(null); }}
        />

        <Modal
          visible={showRecoveryModal}
          transparent
          animationType="fade"
          onRequestClose={handleDismissRecovery}
        >
          <View style={recoveryStyles.overlay}>
            <View style={recoveryStyles.modal}>
              <View style={recoveryStyles.iconWrap}>
                <AlertTriangle size={28} color="#E67E55" />
              </View>
              <Text style={recoveryStyles.title}>Server not responding</Text>
              <Text style={recoveryStyles.message}>{recoveryMessage}</Text>
              <TouchableOpacity style={recoveryStyles.retryBtn} onPress={handleRetryFromModal}>
                <RefreshCw size={16} color="#fff" />
                <Text style={recoveryStyles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={recoveryStyles.secondaryBtn} onPress={handleDismissRecovery}>
                <Text style={recoveryStyles.secondaryBtnText}>Back to Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeft size={20} color={Colors.text.secondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={styles.footerSpacer} />
          {step < 3 ? (
            <View style={{ flex: 1 }}>
              <PrimaryButtonCreate
                label={step === 2 ? "Review Challenge" : "Continue to Tasks"}
                onPress={handleNext}
                variant="orange"
                fullWidth
                disabled={!(step === 1 ? canProceedStep1 : canProceedStep2)}
              />
            </View>
          ) : (
            <View style={recoveryStyles.footerColumn}>
              {apiStatus === 'down' && submitStatus !== 'submitting' && (
                <View style={recoveryStyles.serverStatusRow}>
                  <WifiOff size={14} color="#DC2626" />
                  <Text style={recoveryStyles.serverStatusText}>Server unreachable</Text>
                  <TouchableOpacity onPress={() => retryApi()} style={recoveryStyles.retryLink}>
                    <Text style={recoveryStyles.retryLinkText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              <PrimaryButtonCreate
                label={submitStatus === "submitting" ? "Creating..." : apiStatus === "down" ? "Create Challenge" : apiStatus === "checking" ? "Checking server..." : "Create Challenge"}
                onPress={handleCreate}
                variant="green"
                fullWidth
                disabled={submitStatus === "submitting" || !canCreateChallenge}
                loading={submitStatus === "submitting"}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const visStyles = RNStyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: 14,
    lineHeight: 18,
  },
  cardList: {
    gap: 10,
  },
  card: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(230,126,85,0.04)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  iconWrapSelected: {
    backgroundColor: Colors.accent,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: Colors.accent,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.text.tertiary,
    lineHeight: 17,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  confirmPill: {
    marginTop: 12,
    backgroundColor: "rgba(230,126,85,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(230,126,85,0.18)",
  },
  confirmText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#C86A3A",
    textAlign: "center" as const,
  },
});

const recoveryStyles = RNStyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E67E55',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  footerColumn: {
    flex: 1,
    gap: 6,
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  serverStatusText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500' as const,
  },
  retryLink: {
    marginLeft: 'auto',
  },
  retryLinkText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#E67E55',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const diagStyles = RNStyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  statusReady: {
    backgroundColor: '#ECFDF5',
  },
  statusChecking: {
    backgroundColor: '#FFFBEB',
  },
  statusDown: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  dotReady: {
    backgroundColor: '#10B981',
  },
  dotChecking: {
    backgroundColor: '#F59E0B',
  },
  dotDown: {
    backgroundColor: '#EF4444',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  labelReady: {
    color: '#059669',
  },
  labelChecking: {
    color: '#D97706',
  },
  labelDown: {
    color: '#DC2626',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '400' as const,
    maxWidth: '65%' as any,
    textAlign: 'right' as const,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#4B5563',
  },
});

const step2Styles = RNStyleSheet.create({
  taskList: {
    gap: 10,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  typePill: {
    backgroundColor: '#6366F115',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#6366F1',
  },
  taskMeta: {
    fontSize: 13,
    color: Colors.text.tertiary,
    lineHeight: 18,
    marginBottom: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#0EA5E9',
  },
  taskActions: {
    alignItems: 'center',
    gap: 8,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.accent,
  },
  deleteBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  emptyHelper: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  packsSection: {
    marginBottom: 20,
  },
  packsTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  packsSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 16,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  packCard: {
    width: '47%',
    minWidth: 140,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  packIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  packTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  packDesc: {
    fontSize: 13,
    color: Colors.text.tertiary,
    lineHeight: 18,
    marginBottom: 8,
  },
  packTaskCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

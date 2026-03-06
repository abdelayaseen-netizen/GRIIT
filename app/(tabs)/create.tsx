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
  ActivityIndicator,
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
  X,
  Check,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Globe,
  Users,
  Lock,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import * as Haptics from 'expo-haptics';
import { ChallengeType, ReplayPolicy, JournalCategory, WordLimitMode, ScheduleType, WindowMode, TimezoneMode, ChallengeVisibility } from "@/types";
import { trpcMutate } from "@/lib/trpc";
import { useApi } from "@/contexts/ApiContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { formatTimeHHMM, computeWindowSummary, validateTimeEnforcement } from "@/lib/time-enforcement";

import { formatTRPCError, getApiBaseUrl, formatError } from "@/lib/api";
import { styles } from "@/styles/create-styles";
import TaskEditorModal from '@/components/TaskEditorModal';
import {
  ChallengeStepper,
  ChallengeTypeCard,
  CreateFlowHeader,
  CreateFlowInput,
  DurationPill,
  CategoryTag,
  PrimaryButtonCreate,
  PreviewCard,
  DailyTaskRow,
} from "@/src/components/ui";
import { colors as tokenColors } from "@/src/theme/tokens";

type TaskType = "journal" | "timer" | "run" | "simple" | "checkin";
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
}

const JOURNAL_CATEGORIES: { id: JournalCategory; label: string }[] = [
  { id: "self_reflection", label: "Self-reflection" },
  { id: "emotions", label: "Emotions & feelings" },
  { id: "mental_clarity", label: "Mental clarity" },
  { id: "physical_state", label: "Physical state" },
  { id: "gratitude", label: "Gratitude" },
  { id: "wins_losses", label: "Wins & losses" },
  { id: "discipline_check", label: "Discipline check" },
  { id: "free_write", label: "Free write" },
];

const JOURNAL_PROMPT_EXAMPLES = [
  "What did you learn about yourself today?",
  "Describe your emotions before vs after completing this.",
  "How did your body feel today? Energy, soreness, recovery.",
  "What was the hardest part of today and how did you push through?",
  "Write about one win and one loss from today.",
];

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
  simple: { icon: CheckCircle, label: "Simple Check", color: "#6B7280" },
  checkin: { icon: MapPin, label: "Location Check-in", color: "#0EA5E9" },
};

export default function CreateScreen() {
  const router = useRouter();
  const isGuest = useIsGuest();
  const { showGate } = useAuthGate();
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

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType | null>(null);
  const [newTaskMinWords, setNewTaskMinWords] = useState("50");
  const [journalType, setJournalType] = useState<JournalCategory[]>([]);
  const [journalPrompt, setJournalPrompt] = useState("");
  const [allowFreeWrite, setAllowFreeWrite] = useState(false);
  const [captureMood, setCaptureMood] = useState(true);
  const [captureEnergy, setCaptureEnergy] = useState(true);
  const [captureBodyState, setCaptureBodyState] = useState(false);
  const [wordLimitEnabled, setWordLimitEnabled] = useState(false);
  const [wordLimitMode, setWordLimitMode] = useState<WordLimitMode>("PRESET");
  const [wordLimitWords, setWordLimitWords] = useState<number | null>(120);
  const [customWordLimit, setCustomWordLimit] = useState("");
  const [journalPromptPlaceholderIndex] = useState(() => Math.floor(Math.random() * JOURNAL_PROMPT_EXAMPLES.length));
  const [timeEnforcementEnabled, setTimeEnforcementEnabled] = useState(false);
  const [teAnchorTime, setTeAnchorTime] = useState("05:00");
  const [teTaskDuration, setTeTaskDuration] = useState("");
  const [teWindowStartOffset, setTeWindowStartOffset] = useState("0");
  const [teWindowEndOffset, setTeWindowEndOffset] = useState("60");
  const [teHardWindowEnabled, setTeHardWindowEnabled] = useState(false);
  const [teHardStartOffset, setTeHardStartOffset] = useState("0");
  const [teHardEndOffset, setTeHardEndOffset] = useState("30");
  const [teTimezoneMode, setTeTimezoneMode] = useState<TimezoneMode>("USER_LOCAL");
  const [teChallengeTimezone, setTeChallengeTimezone] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("10");
  const [newTaskMustComplete, setNewTaskMustComplete] = useState(true);
  const [newTaskStrictTimerMode, setNewTaskStrictTimerMode] = useState(false);
  const [newTaskRequirePhotoProof, setNewTaskRequirePhotoProof] = useState(false);
  const [newTaskLocations, setNewTaskLocations] = useState<LocationItem[]>([]);
  const [newTaskStartTime, setNewTaskStartTime] = useState("05:00");
  const [newTaskWindowMinutes, setNewTaskWindowMinutes] = useState("10");
  const [newTaskSessionMinutes, setNewTaskSessionMinutes] = useState("15");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tempLocationName, setTempLocationName] = useState("");
  const [strictTimeLock, setStrictTimeLock] = useState(false);
  const [strictLocationLock, setStrictLocationLock] = useState(false);
  const [strictHardModeFail, setStrictHardModeFail] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("distance");
  const [targetDistance, setTargetDistance] = useState("5");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("miles");
  const [locationName, setLocationName] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("150");

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

  const { apiStatus, apiReady, retryNow: retryApi, lastResponseTimeMs, lastStatusCode, lastErrorMessage, getDiagnosticsString, getTrpcUrl } = useApi();
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

  const getDuration = (): number => {
    if (challengeType === "one_day") return 1;
    if (durationDays) return durationDays;
    const custom = parseInt(customDuration, 10);
    return isNaN(custom) ? 0 : custom;
  };

  const canProceedStep1 = title.trim() && description.trim() && getDuration() > 0 && (challengeType === "standard" || liveDate);
  const canProceedStep2 = tasks.length > 0;

  const validateTasks = (): { valid: boolean; error?: string } => {
    if (tasks.length === 0) {
      return { valid: false, error: "Add at least one task" };
    }

    for (const task of tasks) {
      if (!task.title.trim()) {
        return { valid: false, error: `Task is missing a title` };
      }

      switch (task.type) {
        case "journal":
          if (!task.journalPrompt || task.journalPrompt.trim().length < 20) {
            return { valid: false, error: `Task "${task.title}" needs a prompt (min 20 chars)` };
          }
          if ((!task.journalType || task.journalType.length === 0) && !task.allowFreeWrite) {
            return { valid: false, error: `Task "${task.title}" needs at least one journal type` };
          }
          break;
        case "timer":
          if (!task.durationMinutes || task.durationMinutes <= 0) {
            return { valid: false, error: `Task "${task.title}" needs duration` };
          }
          break;
        case "run":
          if (task.trackingMode === "distance") {
            if (!task.targetValue || task.targetValue <= 0) {
              return { valid: false, error: `Task "${task.title}" needs distance` };
            }
          } else if (task.trackingMode === "time") {
            if (!task.targetValue || task.targetValue <= 0) {
              return { valid: false, error: `Task "${task.title}" needs time duration` };
            }
          }
          break;
        case "checkin":
          if (!task.locationName || !task.locationName.trim()) {
            return { valid: false, error: `Task "${task.title}" needs location name` };
          }
          if (!task.radiusMeters || task.radiusMeters <= 0) {
            return { valid: false, error: `Task "${task.title}" needs radius` };
          }
          break;
      }
    }

    return { valid: true };
  };

  const canCreateChallenge = canProceedStep1 && canProceedStep2 && validateTasks().valid;

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      Alert.alert("Missing Info", "Please fill in title, description, and duration");
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

  const resetTaskBuilder = () => {
    setNewTaskTitle("");
    setNewTaskType(null);
    setNewTaskMinWords("50");
    setNewTaskDuration("10");
    setNewTaskMustComplete(true);
    setNewTaskStrictTimerMode(false);
    setNewTaskRequirePhotoProof(false);
    setNewTaskLocations([]);
    setNewTaskStartTime("05:00");
    setNewTaskWindowMinutes("10");
    setNewTaskSessionMinutes("15");
    setShowLocationInput(false);
    setTempLocationName("");
    setStrictTimeLock(false);
    setStrictLocationLock(false);
    setStrictHardModeFail(false);
    setTrackingMode("distance");
    setTargetDistance("5");
    setDistanceUnit("miles");
    setLocationName("");
    setRadiusMeters("150");
    setEditingTask(null);
    setShowTaskBuilder(false);
    setJournalType([]);
    setJournalPrompt("");
    setAllowFreeWrite(false);
    setCaptureMood(true);
    setCaptureEnergy(true);
    setCaptureBodyState(false);
    setWordLimitEnabled(false);
    setWordLimitMode("PRESET");
    setWordLimitWords(120);
    setCustomWordLimit("");
    setTimeEnforcementEnabled(false);
    setTeAnchorTime("05:00");
    setTeTaskDuration("");
    setTeWindowStartOffset("0");
    setTeWindowEndOffset("60");
    setTeHardWindowEnabled(false);
    setTeHardStartOffset("0");
    setTeHardEndOffset("30");
    setTeTimezoneMode("USER_LOCAL");
    setTeChallengeTimezone("");
  };

  const canAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskType) return false;

    if (timeEnforcementEnabled) {
      const teValidation = validateTimeEnforcement({
        timeEnforcementEnabled: true,
        anchorTimeLocal: teAnchorTime,
        windowStartOffsetMin: parseInt(teWindowStartOffset, 10) || 0,
        windowEndOffsetMin: parseInt(teWindowEndOffset, 10) || 60,
        hardWindowStartOffsetMin: teHardWindowEnabled ? (parseInt(teHardStartOffset, 10) || 0) : null,
        hardWindowEndOffsetMin: teHardWindowEnabled ? (parseInt(teHardEndOffset, 10) || 30) : null,
        timezoneMode: teTimezoneMode,
        challengeTimezone: teChallengeTimezone || null,
      });
      if (!teValidation.valid) return false;
    }

    switch (newTaskType) {
      case "journal": {
        const hasPrompt = journalPrompt.trim().length >= 20;
        const hasType = journalType.length > 0 || allowFreeWrite;
        if (wordLimitEnabled) {
          const limit = wordLimitMode === "CUSTOM" ? parseInt(customWordLimit, 10) : wordLimitWords;
          if (!limit || limit < 20 || limit > 1000) return false;
        }
        return hasPrompt && hasType;
      }
      case "timer":
        return parseInt(newTaskDuration, 10) > 0;
      case "run":
        if (trackingMode === "distance") {
          return parseFloat(targetDistance) > 0;
        } else {
          return parseInt(newTaskDuration, 10) > 0;
        }
      case "checkin":
        return locationName.trim().length > 0 && parseInt(radiusMeters, 10) > 0;
      case "simple":
        return true;
      default:
        return false;
    }
  };

  const handleAddTask = () => {
    if (!canAddTask()) {
      Alert.alert("Missing Info", "Please fill in all required fields");
      return;
    }

    const teFields: Partial<TaskTemplate> = timeEnforcementEnabled ? {
      timeEnforcementEnabled: true,
      scheduleType: "DAILY" as const,
      anchorTimeLocal: teAnchorTime,
      taskDurationMinutes: teTaskDuration ? parseInt(teTaskDuration, 10) : null,
      windowMode: "WINDOW" as const,
      windowStartOffsetMin: parseInt(teWindowStartOffset, 10) || 0,
      windowEndOffsetMin: parseInt(teWindowEndOffset, 10) || 60,
      hardWindowEnabled: teHardWindowEnabled,
      hardWindowStartOffsetMin: teHardWindowEnabled ? (parseInt(teHardStartOffset, 10) || 0) : null,
      hardWindowEndOffsetMin: teHardWindowEnabled ? (parseInt(teHardEndOffset, 10) || 30) : null,
      timezoneMode: teTimezoneMode,
      challengeTimezone: teTimezoneMode === "CHALLENGE_TIMEZONE" ? teChallengeTimezone : null,
    } : {
      timeEnforcementEnabled: false,
    };

    const baseTask = {
      id: editingTask?.id || Date.now().toString(),
      title: newTaskTitle.trim(),
      type: newTaskType!,
      required: true,
      requirePhotoProof: newTaskRequirePhotoProof,
      ...teFields,
    };

    let task: TaskTemplate = baseTask;

    switch (newTaskType) {
      case "journal":
        task = {
          ...baseTask,
          minWords: parseInt(newTaskMinWords, 10) || 50,
          journalType: journalType,
          journalPrompt: journalPrompt.trim(),
          allowFreeWrite,
          captureMood,
          captureEnergy,
          captureBodyState,
          wordLimitEnabled,
          wordLimitMode: wordLimitEnabled ? wordLimitMode : undefined,
          wordLimitWords: wordLimitEnabled
            ? (wordLimitMode === "CUSTOM" ? (parseInt(customWordLimit, 10) || null) : wordLimitWords)
            : null,
        };
        break;
      case "timer":
        task = {
          ...baseTask,
          targetValue: parseInt(newTaskDuration, 10) || 10,
          unit: "minutes" as const,
          durationMinutes: parseInt(newTaskDuration, 10) || 10,
          mustCompleteInSession: newTaskMustComplete,
          strictTimerMode: newTaskStrictTimerMode,
          requirePhotoProof: newTaskRequirePhotoProof,
        };
        break;
      case "run":
        if (trackingMode === "distance") {
          task = {
            ...baseTask,
            trackingMode,
            targetValue: parseFloat(targetDistance),
            unit: distanceUnit,
          };
        } else {
          task = {
            ...baseTask,
            trackingMode,
            targetValue: parseInt(newTaskDuration, 10),
            unit: "minutes" as const,
          };
        }
        break;
      case "simple":
        task = baseTask;
        break;
      case "checkin":
        task = {
          ...baseTask,
          locationName: locationName.trim(),
          radiusMeters: parseInt(radiusMeters, 10) || 150,
          locations: newTaskLocations,
          startTime: newTaskStartTime,
          startWindowMinutes: parseInt(newTaskWindowMinutes, 10) || 10,
          minSessionMinutes: parseInt(newTaskSessionMinutes, 10) || 15,
        };
        break;
    }

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? task : t)));
    } else {
      setTasks([...tasks, task]);
    }
    resetTaskBuilder();
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

  const handleTaskSave = useCallback((task: TaskTemplate) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
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

    if (!description.trim()) {
      Alert.alert("Missing Description", "Please enter a description");
      return;
    }

    if (getDuration() <= 0) {
      Alert.alert("Invalid Duration", "Please select a valid duration");
      return;
    }

    if (tasks.length === 0) {
      Alert.alert("No Tasks", "Add at least one task to your challenge");
      return;
    }

    setSubmitStatus('submitting');
    startWatchdog();
    createMutationPendingRef.current = true;

    const payload = {
      title,
      description,
      type: challengeType,
      durationDays: getDuration(),
      categories,
      liveDate: challengeType === "one_day" ? liveDate : undefined,
      replayPolicy: challengeType === "one_day" ? replayPolicy : undefined,
      requireSameRules,
      showReplayLabel,
      visibility,
      tasks: tasks.map(task => ({
        title: task.title,
        type: task.type,
        required: task.required,
        minWords: task.minWords,
        targetValue: task.targetValue,
        unit: task.unit,
        trackingMode: task.trackingMode,
        photoRequired: task.photoRequired,
        requirePhotoProof: task.requirePhotoProof,
        strictTimerMode: task.type === "timer" ? task.strictTimerMode : undefined,
        locationName: task.locationName,
        radiusMeters: task.radiusMeters,
        durationMinutes: task.durationMinutes,
        mustCompleteInSession: task.mustCompleteInSession,
        locations: task.locations,
        startTime: task.startTime,
        startWindowMinutes: task.startWindowMinutes,
        minSessionMinutes: task.minSessionMinutes,
        journalType: task.journalType,
        journalPrompt: task.journalPrompt,
        allowFreeWrite: task.allowFreeWrite,
        captureMood: task.captureMood,
        captureEnergy: task.captureEnergy,
        captureBodyState: task.captureBodyState,
        wordLimitEnabled: task.wordLimitEnabled,
        wordLimitMode: task.wordLimitMode,
        wordLimitWords: task.wordLimitWords,
        timeEnforcementEnabled: task.timeEnforcementEnabled,
        scheduleType: task.timeEnforcementEnabled ? (task.scheduleType || "DAILY") : undefined,
        anchorTimeLocal: task.timeEnforcementEnabled ? task.anchorTimeLocal : undefined,
        taskDurationMinutes: task.timeEnforcementEnabled ? task.taskDurationMinutes : undefined,
        windowStartOffsetMin: task.timeEnforcementEnabled ? task.windowStartOffsetMin : undefined,
        windowEndOffsetMin: task.timeEnforcementEnabled ? task.windowEndOffsetMin : undefined,
        hardWindowEnabled: task.timeEnforcementEnabled ? task.hardWindowEnabled : undefined,
        hardWindowStartOffsetMin: task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowStartOffsetMin : undefined,
        hardWindowEndOffsetMin: task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowEndOffsetMin : undefined,
        timezoneMode: task.timeEnforcementEnabled ? task.timezoneMode : undefined,
        challengeTimezone: task.timeEnforcementEnabled && task.timezoneMode === "CHALLENGE_TIMEZONE" ? task.challengeTimezone : undefined,
      })),
    };

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
            duration: String(challenge.duration_days ?? duration),
            tasksCount: String(challenge.tasks?.length ?? tasks.length),
            difficulty: challenge.difficulty ?? "medium",
            isCreateSuccess: "true",
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
  }, [submitStatus, title, description, challengeType, categories, tasks, liveDate, replayPolicy, requireSameRules, showReplayLabel, visibility, apiStatus, startWatchdog, clearWatchdog]);

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

  const addLocation = () => {
    if (!tempLocationName.trim()) return;
    const newLocation: LocationItem = {
      id: Date.now().toString(),
      name: tempLocationName.trim(),
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      radiusMeters: 100,
    };
    setNewTaskLocations([...newTaskLocations, newLocation]);
    setTempLocationName("");
    setShowLocationInput(false);
  };

  const removeLocation = (id: string) => {
    setNewTaskLocations(newTaskLocations.filter((l) => l.id !== id));
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
      <Text style={styles.stepTitle}>Challenge Basics</Text>
      <Text style={styles.stepSubtitle}>What are you building?</Text>

      <View style={styles.fieldGroup}>
        <CreateFlowInput
          label="TITLE"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. 75 Day Hard"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CHALLENGE TYPE</Text>
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

      <View style={styles.fieldGroup}>
        <CreateFlowInput
          label="PURPOSE"
          value={description}
          onChangeText={setDescription}
          placeholder="What's the goal of this challenge?"
          multiline
        />
      </View>

      {challengeType === "standard" ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DURATION</Text>
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
            <TextInput
              style={[styles.durationInput, customDuration && styles.durationInputActive]}
              placeholder="Custom"
              placeholderTextColor={Colors.text.tertiary}
              value={customDuration}
              onChangeText={(v) => {
                setCustomDuration(v);
                setDurationDays(null);
              }}
              keyboardType="number-pad"
            />
          </View>
          <Text style={styles.durationHint}>Enter number of days</Text>
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

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CATEGORY (OPTIONAL)</Text>
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

  const renderTaskTypeSelector = () => (
    <View style={styles.taskTypeGrid}>
      {(Object.keys(TASK_TYPE_CONFIG) as TaskType[]).map((type) => {
        const config = TASK_TYPE_CONFIG[type];
        const Icon = config.icon;
        const isSelected = newTaskType === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.taskTypeCard, isSelected && { borderColor: config.color, backgroundColor: `${config.color}15` }]}
            onPress={() => setNewTaskType(type)}
          >
            <View style={[styles.taskTypeIcon, { backgroundColor: `${config.color}20` }]}>
              <Icon size={18} color={config.color} />
            </View>
            <Text style={[styles.taskTypeLabel, isSelected && { color: config.color, fontWeight: "600" as const }]}>{config.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStrictToggles = () => {
    if (!newTaskType) return null;
    
    const showTimeLock = ["timer", "checkin", "simple"].includes(newTaskType);
    const showLocationLock = ["checkin", "run"].includes(newTaskType);
    const showHardModeFail = true;

    return (
      <View style={styles.strictTogglesSection}>
        <Text style={styles.strictTogglesTitle}>Strict Verification (Optional)</Text>
        <Text style={styles.strictTogglesHint}>Make this task stricter</Text>

        <TouchableOpacity
          style={styles.strictToggleRow}
          onPress={() => setNewTaskRequirePhotoProof(!newTaskRequirePhotoProof)}
        >
          <View style={[styles.strictToggleBox, newTaskRequirePhotoProof && styles.strictToggleBoxActive]}>
            {newTaskRequirePhotoProof && <Check size={14} color="#fff" />}
          </View>
          <View style={styles.strictToggleContent}>
            <Text style={styles.strictToggleLabel}>Require photo proof</Text>
            <Text style={styles.strictToggleDesc}>User must take or upload a photo to complete</Text>
          </View>
        </TouchableOpacity>

        {showTimeLock && (
          <TouchableOpacity
            style={styles.strictToggleRow}
            onPress={() => setStrictTimeLock(!strictTimeLock)}
          >
            <View style={[styles.strictToggleBox, strictTimeLock && styles.strictToggleBoxActive]}>
              {strictTimeLock && <Check size={14} color="#fff" />}
            </View>
            <View style={styles.strictToggleContent}>
              <Text style={styles.strictToggleLabel}>Strict: check-in on time</Text>
              <Text style={styles.strictToggleDesc}>Must start within time window</Text>
            </View>
          </TouchableOpacity>
        )}

        {showLocationLock && (
          <TouchableOpacity
            style={styles.strictToggleRow}
            onPress={() => setStrictLocationLock(!strictLocationLock)}
          >
            <View style={[styles.strictToggleBox, strictLocationLock && styles.strictToggleBoxActive]}>
              {strictLocationLock && <Check size={14} color="#fff" />}
            </View>
            <View style={styles.strictToggleContent}>
              <Text style={styles.strictToggleLabel}>Strict: must be at location</Text>
              <Text style={styles.strictToggleDesc}>Physical presence required</Text>
            </View>
          </TouchableOpacity>
        )}

        {showHardModeFail && (
          <TouchableOpacity
            style={styles.strictToggleRow}
            onPress={() => setStrictHardModeFail(!strictHardModeFail)}
          >
            <View style={[styles.strictToggleBox, strictHardModeFail && styles.strictToggleBoxActive]}>
              {strictHardModeFail && <Check size={14} color="#fff" />}
            </View>
            <View style={styles.strictToggleContent}>
              <Text style={styles.strictToggleLabel}>Hard Mode: miss = fail</Text>
              <Text style={styles.strictToggleDesc}>Missing this task fails the challenge</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderVerificationOptions = () => {
    if (!newTaskType) return null;

    switch (newTaskType) {
      case "journal":
        return (
          <View style={styles.verificationSection}>
            <View style={styles.compactFieldGroup}>
              <Text style={styles.verificationLabel}>What is this journal about?</Text>
              <View style={jStyles.chipGrid}>
                {JOURNAL_CATEGORIES.map((cat) => {
                  const isSelected = journalType.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[jStyles.journalChip, isSelected && jStyles.journalChipActive]}
                      onPress={() => {
                        setJournalType(prev =>
                          prev.includes(cat.id)
                            ? prev.filter(c => c !== cat.id)
                            : [...prev, cat.id]
                        );
                        if (cat.id === "free_write") setAllowFreeWrite(!journalType.includes(cat.id));
                      }}
                    >
                      <Text style={[jStyles.journalChipText, isSelected && jStyles.journalChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={styles.verificationLabel}>Prompt (what should they write about?)</Text>
              <Text style={jStyles.promptHelper}>This appears at the top when the user journals.</Text>
              <TextInput
                style={[styles.verificationInput, jStyles.promptInput]}
                value={journalPrompt}
                onChangeText={setJournalPrompt}
                placeholder={JOURNAL_PROMPT_EXAMPLES[journalPromptPlaceholderIndex]}
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={240}
              />
              <View style={jStyles.charCountRow}>
                {journalPrompt.trim().length > 0 && journalPrompt.trim().length < 20 && (
                  <Text style={jStyles.promptError}>Min 20 characters</Text>
                )}
                <View style={jStyles.charCountSpacer} />
                <Text style={[
                  jStyles.charCount,
                  journalPrompt.length > 220 && jStyles.charCountWarn,
                ]}>
                  {journalPrompt.length}/240
                </Text>
              </View>
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={styles.verificationLabel}>Quick check-ins</Text>
              <TouchableOpacity style={jStyles.toggleItem} onPress={() => setCaptureMood(!captureMood)}>
                <View style={[styles.toggleBox, captureMood && styles.toggleBoxActive]}>
                  {captureMood && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.toggleLabel}>Capture mood</Text>
              </TouchableOpacity>
              <TouchableOpacity style={jStyles.toggleItem} onPress={() => setCaptureEnergy(!captureEnergy)}>
                <View style={[styles.toggleBox, captureEnergy && styles.toggleBoxActive]}>
                  {captureEnergy && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.toggleLabel}>Capture energy level</Text>
              </TouchableOpacity>
              <TouchableOpacity style={jStyles.toggleItem} onPress={() => setCaptureBodyState(!captureBodyState)}>
                <View style={[styles.toggleBox, captureBodyState && styles.toggleBoxActive]}>
                  {captureBodyState && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.toggleLabel}>Capture body state</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={styles.verificationLabel}>Word limit</Text>
              <TouchableOpacity style={jStyles.toggleItem} onPress={() => setWordLimitEnabled(!wordLimitEnabled)}>
                <View style={[styles.toggleBox, wordLimitEnabled && styles.toggleBoxActive]}>
                  {wordLimitEnabled && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.toggleLabel}>Limit entry length</Text>
              </TouchableOpacity>
              {!wordLimitEnabled && (
                <Text style={jStyles.wordLimitHint}>Limits keep journaling quick and consistent. Turn off if you want free writing.</Text>
              )}

              {wordLimitEnabled && (
                <View style={jStyles.wordLimitSection}>
                  <View style={jStyles.wordLimitModeRow}>
                    <TouchableOpacity
                      style={[jStyles.wordLimitModeBtn, wordLimitMode === "PRESET" && jStyles.wordLimitModeBtnActive]}
                      onPress={() => setWordLimitMode("PRESET")}
                    >
                      <Text style={[jStyles.wordLimitModeBtnText, wordLimitMode === "PRESET" && jStyles.wordLimitModeBtnTextActive]}>Fair preset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[jStyles.wordLimitModeBtn, wordLimitMode === "CUSTOM" && jStyles.wordLimitModeBtnActive]}
                      onPress={() => setWordLimitMode("CUSTOM")}
                    >
                      <Text style={[jStyles.wordLimitModeBtnText, wordLimitMode === "CUSTOM" && jStyles.wordLimitModeBtnTextActive]}>Custom</Text>
                    </TouchableOpacity>
                  </View>

                  {wordLimitMode === "PRESET" ? (
                    <View style={jStyles.presetGrid}>
                      {([{ words: 50, label: "Short" }, { words: 120, label: "Standard" }, { words: 250, label: "Deep" }, { words: 500, label: "Long" }] as const).map((preset) => (
                        <TouchableOpacity
                          key={preset.words}
                          style={[jStyles.presetCard, wordLimitWords === preset.words && jStyles.presetCardActive]}
                          onPress={() => setWordLimitWords(preset.words)}
                        >
                          <Text style={[jStyles.presetNumber, wordLimitWords === preset.words && jStyles.presetNumberActive]}>{preset.words}</Text>
                          <Text style={[jStyles.presetLabel, wordLimitWords === preset.words && jStyles.presetLabelActive]}>{preset.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={jStyles.customLimitSection}>
                      <Text style={jStyles.customLimitLabel}>Max words</Text>
                      <TextInput
                        style={jStyles.customLimitInput}
                        value={customWordLimit}
                        onChangeText={setCustomWordLimit}
                        keyboardType="number-pad"
                        placeholder="e.g., 150"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                      <Text style={jStyles.customLimitHelper}>Min 20, max 1000</Text>
                      {customWordLimit && parseInt(customWordLimit, 10) >= 20 && parseInt(customWordLimit, 10) <= 1000 && (
                        <Text style={jStyles.customLimitPreview}>Users can write up to {customWordLimit} words.</Text>
                      )}
                      {customWordLimit && (parseInt(customWordLimit, 10) < 20 || parseInt(customWordLimit, 10) > 1000) && (
                        <Text style={jStyles.customLimitError}>Must be between 20 and 1000</Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>

            {journalPrompt.trim().length >= 20 && (
              <View style={jStyles.previewCard}>
                <Text style={jStyles.previewTitle}>Preview</Text>
                <Text style={jStyles.previewPrompt}>{journalPrompt.trim()}</Text>
                {journalType.length > 0 && (
                  <View style={jStyles.previewChips}>
                    {journalType.map(jt => {
                      const cat = JOURNAL_CATEGORIES.find(c => c.id === jt);
                      return (
                        <View key={jt} style={jStyles.previewChip}>
                          <Text style={jStyles.previewChipText}>{cat?.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
                <View style={jStyles.previewCheckins}>
                  {captureMood && <Text style={jStyles.previewCheckinText}>Mood</Text>}
                  {captureEnergy && <Text style={jStyles.previewCheckinText}>Energy</Text>}
                  {captureBodyState && <Text style={jStyles.previewCheckinText}>Body</Text>}
                </View>
                {wordLimitEnabled && (() => {
                  const limit = wordLimitMode === "CUSTOM" ? parseInt(customWordLimit, 10) : wordLimitWords;
                  return limit && limit >= 20 ? (
                    <Text style={jStyles.previewWordLimit}>{limit} word limit</Text>
                  ) : null;
                })()}
              </View>
            )}
          </View>
        );
      case "timer":
        return (
          <View style={styles.verificationSection}>
            <Text style={styles.verificationLabel}>Target minutes</Text>
            <TextInput
              style={styles.verificationInput}
              value={newTaskDuration}
              onChangeText={setNewTaskDuration}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={Colors.text.tertiary}
            />
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setNewTaskMustComplete(!newTaskMustComplete)}
            >
              <View style={[styles.toggleBox, newTaskMustComplete && styles.toggleBoxActive]}>
                {newTaskMustComplete && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.toggleLabel}>Must complete without exiting</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setNewTaskStrictTimerMode(!newTaskStrictTimerMode)}
            >
              <View style={[styles.toggleBox, newTaskStrictTimerMode && styles.toggleBoxActive]}>
                {newTaskStrictTimerMode && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.toggleLabel}>Require participants to stay on timer screen (resets if they leave)</Text>
            </TouchableOpacity>
          </View>
        );
      case "run":
        return (
          <View style={styles.verificationSection}>
            <Text style={styles.verificationLabel}>Tracking Mode</Text>
            <View style={styles.trackingModeRow}>
              <TouchableOpacity
                style={[styles.trackingModeBtn, trackingMode === "distance" && styles.trackingModeBtnActive]}
                onPress={() => setTrackingMode("distance")}
              >
                <Text style={[styles.trackingModeText, trackingMode === "distance" && styles.trackingModeTextActive]}>Distance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.trackingModeBtn, trackingMode === "time" && styles.trackingModeBtnActive]}
                onPress={() => setTrackingMode("time")}
              >
                <Text style={[styles.trackingModeText, trackingMode === "time" && styles.trackingModeTextActive]}>Time</Text>
              </TouchableOpacity>
            </View>
            {trackingMode === "distance" ? (
              <>
                <Text style={[styles.verificationLabel, { marginTop: 12 }]}>Target Distance</Text>
                <View style={styles.distanceRow}>
                  <TextInput
                    style={[styles.verificationInput, styles.distanceInput]}
                    value={targetDistance}
                    onChangeText={setTargetDistance}
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                  <View style={styles.unitSelector}>
                    {["miles", "km", "meters"].map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitBtn, distanceUnit === u && styles.unitBtnActive]}
                        onPress={() => setDistanceUnit(u as DistanceUnit)}
                      >
                        <Text style={[styles.unitBtnText, distanceUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.verificationLabel, { marginTop: 12 }]}>Target minutes</Text>
                <TextInput
                  style={styles.verificationInput}
                  value={newTaskDuration}
                  onChangeText={setNewTaskDuration}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </>
            )}
          </View>
        );
      case "simple":
        return (
          <View style={styles.verificationSection}>
            <View style={styles.lockedOption}>
              <CheckCircle size={16} color={Colors.text.secondary} />
              <Text style={styles.lockedOptionText}>User taps complete (confirm modal shown)</Text>
            </View>
          </View>
        );
      case "checkin":
        return (
          <View style={styles.verificationSection}>
            <Text style={styles.verificationLabel}>Location Name</Text>
            <TextInput
              style={styles.verificationInput}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="e.g. LA Fitness, Central Park"
              placeholderTextColor={Colors.text.tertiary}
            />
            <Text style={[styles.verificationLabel, { marginTop: 12 }]}>Radius (meters)</Text>
            <TextInput
              style={styles.verificationInput}
              value={radiusMeters}
              onChangeText={setRadiusMeters}
              keyboardType="number-pad"
              placeholder="150"
              placeholderTextColor={Colors.text.tertiary}
            />
            <Text style={styles.verificationHint}>User must check in within this radius</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTimeEnforcement = () => {
    if (!newTaskType) return null;

    return (
      <View style={teStyles.section}>
        <Text style={teStyles.sectionTitle}>Time enforcement</Text>
        <TouchableOpacity style={jStyles.toggleItem} onPress={() => setTimeEnforcementEnabled(!timeEnforcementEnabled)}>
          <View style={[styles.toggleBox, timeEnforcementEnabled && styles.toggleBoxActive]}>
            {timeEnforcementEnabled && <Check size={14} color="#fff" />}
          </View>
          <Text style={styles.toggleLabel}>Require completion at a specific time</Text>
        </TouchableOpacity>

        {timeEnforcementEnabled && (
          <View style={teStyles.body}>
            <View style={styles.compactFieldGroup}>
              <Text style={teStyles.fieldLabel}>Target time</Text>
              <TextInput
                style={teStyles.timeInput}
                value={teAnchorTime}
                onChangeText={setTeAnchorTime}
                placeholder="05:00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={teStyles.hint}>24h format (HH:mm)</Text>
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={teStyles.fieldLabel}>Expected duration (optional)</Text>
              <TextInput
                style={teStyles.timeInput}
                value={teTaskDuration}
                onChangeText={setTeTaskDuration}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
              />
              <Text style={teStyles.hint}>Minutes</Text>
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={teStyles.fieldLabel}>Allowed window</Text>
              <View style={teStyles.offsetRow}>
                <View style={teStyles.offsetField}>
                  <Text style={teStyles.offsetLabel}>Starts (min)</Text>
                  <TextInput
                    style={teStyles.offsetInput}
                    value={teWindowStartOffset}
                    onChangeText={setTeWindowStartOffset}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={teStyles.offsetField}>
                  <Text style={teStyles.offsetLabel}>Ends (min)</Text>
                  <TextInput
                    style={teStyles.offsetInput}
                    value={teWindowEndOffset}
                    onChangeText={setTeWindowEndOffset}
                    keyboardType="number-pad"
                    placeholder="60"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>
              {teAnchorTime && (
                <View style={teStyles.summaryPill}>
                  <Text style={teStyles.summaryText}>
                    Allowed: {computeWindowSummary(
                      teAnchorTime,
                      parseInt(teWindowStartOffset, 10) || 0,
                      parseInt(teWindowEndOffset, 10) || 60
                    )}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.compactFieldGroup}>
              <TouchableOpacity style={jStyles.toggleItem} onPress={() => setTeHardWindowEnabled(!teHardWindowEnabled)}>
                <View style={[styles.toggleBox, teHardWindowEnabled && styles.toggleBoxActive]}>
                  {teHardWindowEnabled && <Check size={14} color="#fff" />}
                </View>
                <Text style={styles.toggleLabel}>Hard mode stricter window</Text>
              </TouchableOpacity>

              {teHardWindowEnabled && (
                <>
                  <View style={teStyles.offsetRow}>
                    <View style={teStyles.offsetField}>
                      <Text style={teStyles.offsetLabel}>Starts (min)</Text>
                      <TextInput
                        style={teStyles.offsetInput}
                        value={teHardStartOffset}
                        onChangeText={setTeHardStartOffset}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                    </View>
                    <View style={teStyles.offsetField}>
                      <Text style={teStyles.offsetLabel}>Ends (min)</Text>
                      <TextInput
                        style={teStyles.offsetInput}
                        value={teHardEndOffset}
                        onChangeText={setTeHardEndOffset}
                        keyboardType="number-pad"
                        placeholder="30"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                    </View>
                  </View>
                  {teAnchorTime && (
                    <View style={[teStyles.summaryPill, teStyles.hardSummaryPill]}>
                      <Text style={[teStyles.summaryText, teStyles.hardSummaryText]}>
                        Hard mode: {computeWindowSummary(
                          teAnchorTime,
                          parseInt(teHardStartOffset, 10) || 0,
                          parseInt(teHardEndOffset, 10) || 30
                        )}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={styles.compactFieldGroup}>
              <Text style={teStyles.fieldLabel}>Timezone</Text>
              <View style={teStyles.tzRow}>
                <TouchableOpacity
                  style={[teStyles.tzBtn, teTimezoneMode === "USER_LOCAL" && teStyles.tzBtnActive]}
                  onPress={() => setTeTimezoneMode("USER_LOCAL")}
                >
                  <Text style={[teStyles.tzBtnText, teTimezoneMode === "USER_LOCAL" && teStyles.tzBtnTextActive]}>User local</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[teStyles.tzBtn, teTimezoneMode === "CHALLENGE_TIMEZONE" && teStyles.tzBtnActive]}
                  onPress={() => setTeTimezoneMode("CHALLENGE_TIMEZONE")}
                >
                  <Text style={[teStyles.tzBtnText, teTimezoneMode === "CHALLENGE_TIMEZONE" && teStyles.tzBtnTextActive]}>Locked timezone</Text>
                </TouchableOpacity>
              </View>
              {teTimezoneMode === "CHALLENGE_TIMEZONE" && (
                <TextInput
                  style={[teStyles.timeInput, { marginTop: 8 }]}
                  value={teChallengeTimezone}
                  onChangeText={setTeChallengeTimezone}
                  placeholder="e.g. America/New_York"
                  placeholderTextColor={Colors.text.tertiary}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTaskBuilder = () => (
    <Modal
      visible={showTaskBuilder}
      animationType="slide"
      transparent={true}
      onRequestClose={resetTaskBuilder}
    >
      <TouchableOpacity 
        style={styles.taskBuilderOverlay} 
        activeOpacity={1}
        onPress={resetTaskBuilder}
      >
        <SafeAreaView style={styles.taskBuilderSafeArea} edges={["top", "bottom"]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.taskBuilderKeyboardView}
          >
            <TouchableOpacity 
              style={styles.taskBuilderSheet}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHandle}>
                <View style={styles.sheetHandleBar} />
              </View>

              <View style={styles.taskBuilderHeader}>
                <Text style={styles.taskBuilderTitle}>{editingTask ? "Edit Task" : "Add Task"}</Text>
                <TouchableOpacity onPress={resetTaskBuilder} style={styles.taskBuilderClose}>
                  <X size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.fixedSection}>
                <View style={styles.compactFieldGroup}>
                  <Text style={styles.compactLabel}>Task Name</Text>
                  <TextInput
                    style={styles.compactInput}
                    placeholder="e.g. Morning Journal"
                    placeholderTextColor={Colors.text.tertiary}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    autoFocus
                  />
                </View>

                <View style={styles.compactFieldGroup}>
                  <Text style={styles.compactLabel}>Task Type</Text>
                  {renderTaskTypeSelector()}
                </View>
              </View>

              <ScrollView 
                style={styles.taskBuilderScroll}
                contentContainerStyle={styles.taskBuilderScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {renderVerificationOptions()}
                {renderTimeEnforcement()}
                {renderStrictToggles()}
              </ScrollView>

              <View style={styles.stickyActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetTaskBuilder}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.addTaskButton, !canAddTask() && styles.addTaskButtonDisabled]} 
                  onPress={handleAddTask}
                  disabled={!canAddTask()}
                >
                  <Text style={styles.addTaskButtonText}>{editingTask ? "Save" : "Add Task"}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Daily Tasks</Text>
      <Text style={styles.stepSubtitle}>What must be done each day?</Text>

      {tasks.length === 0 && (
        <View style={step2Styles.emptyState}>
          <View style={step2Styles.emptyIcon}>
            <Plus size={28} color={Colors.text.tertiary} />
          </View>
          <Text style={step2Styles.emptyTitle}>No tasks yet</Text>
          <Text style={step2Styles.emptyDesc}>Add your first daily task to get started</Text>
        </View>
      )}

      {tasks.length > 0 && (
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
        <Text style={step2Styles.addBtnText}>+ Add Task</Text>
      </TouchableOpacity>

      <View style={step2Styles.packsSection}>
        <Text style={step2Styles.packsTitle}>QUICK START WITH PACKS</Text>
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
    </Animated.View>
  );

  const reviewTags = [
    ...(challengeType === "one_day" ? ["24-Hour", replayPolicy === "live_only" ? "Live Only" : "Replayable"] : [`${getDuration()} days`]),
    ...categories,
  ];

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.stepTitle}>Review</Text>
      <Text style={styles.stepSubtitle}>Everything look good?</Text>

      <PreviewCard
        title={title}
        subtitle={description}
        tags={reviewTags}
      />
      {challengeType === "one_day" && liveDate ? (
        <Text style={styles.reviewLiveDate}>Live Date: {liveDate}</Text>
      ) : null}

      <Text style={styles.reviewSectionTitle}>Daily Tasks ({tasks.length})</Text>
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
        <Text style={visStyles.subtitle}>Choose who can see and join this challenge.</Text>
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
        <View style={visStyles.confirmPill}>
          <Text style={visStyles.confirmText}>
            This challenge will be visible to: {VISIBILITY_OPTIONS.find(o => o.value === visibility)?.label}
          </Text>
        </View>
      </View>

      <View style={styles.reviewNote}>
        <Text style={styles.reviewNoteText}>
          Participants secure a day only when all tasks are verified.
        </Text>
      </View>

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

        <View style={diagStyles.infoRow}>
          <Text style={diagStyles.infoLabel}>tRPC URL</Text>
          <Text style={diagStyles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {(() => { try { return getTrpcUrl(); } catch { return 'NOT SET'; } })()}
          </Text>
        </View>

        {lastStatusCode !== null && (
          <View style={diagStyles.infoRow}>
            <Text style={diagStyles.infoLabel}>Last status</Text>
            <Text style={diagStyles.infoValue}>{lastStatusCode}</Text>
          </View>
        )}

        {lastResponseTimeMs !== null && (
          <View style={diagStyles.infoRow}>
            <Text style={diagStyles.infoLabel}>Response</Text>
            <Text style={diagStyles.infoValue}>{lastResponseTimeMs}ms</Text>
          </View>
        )}

        {apiStatus === 'down' && lastErrorMessage && (
          <View style={diagStyles.errorRow}>
            <AlertTriangle size={12} color="#DC2626" />
            <Text style={diagStyles.errorText} numberOfLines={2}>{lastErrorMessage}</Text>
          </View>
        )}

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
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokenColors.bgMain }]} edges={["top"]}>
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
                label={step === 2 ? "Review >" : "Next: Add Tasks"}
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

const jStyles = RNStyleSheet.create({
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  journalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  journalChipActive: {
    backgroundColor: "#6366F115",
    borderColor: "#6366F1",
  },
  journalChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  journalChipTextActive: {
    color: "#6366F1",
  },
  promptHelper: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  promptInput: {
    minHeight: 72,
    paddingTop: 12,
  },
  charCountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  charCountSpacer: {
    flex: 1,
  },
  charCount: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  charCountWarn: {
    color: Colors.warning,
  },
  promptError: {
    fontSize: 11,
    color: "#DC2626",
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  previewCard: {
    marginTop: 12,
    backgroundColor: "#F8F7FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E6F7",
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#6366F1",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewPrompt: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  previewChip: {
    backgroundColor: "#6366F112",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewChipText: {
    fontSize: 11,
    color: "#6366F1",
    fontWeight: "500" as const,
  },
  previewCheckins: {
    flexDirection: "row",
    gap: 12,
  },
  previewCheckinText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: "500" as const,
  },
  previewWordLimit: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#6366F1",
    marginTop: 8,
  },
  wordLimitHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: -4,
    marginBottom: 4,
    lineHeight: 17,
  },
  wordLimitSection: {
    marginTop: 8,
  },
  wordLimitModeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  wordLimitModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  wordLimitModeBtnActive: {
    backgroundColor: "#6366F115",
    borderColor: "#6366F1",
  },
  wordLimitModeBtnText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  wordLimitModeBtnTextActive: {
    color: "#6366F1",
    fontWeight: "600" as const,
  },
  presetGrid: {
    flexDirection: "row",
    gap: 8,
  },
  presetCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  presetCardActive: {
    borderColor: "#6366F1",
    backgroundColor: "#6366F10A",
  },
  presetNumber: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  presetNumberActive: {
    color: "#6366F1",
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
  },
  presetLabelActive: {
    color: "#6366F1",
  },
  customLimitSection: {
    gap: 4,
  },
  customLimitLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customLimitInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text.primary,
  },
  customLimitHelper: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  customLimitPreview: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "500" as const,
  },
  customLimitError: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500" as const,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  journalPill: {
    backgroundColor: "#6366F115",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  journalPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
});

const teStyles = RNStyleSheet.create({
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 10,
  },
  body: {
    marginTop: 8,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  },
  timeInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text.primary,
  },
  hint: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  offsetRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 4,
  },
  offsetField: {
    flex: 1,
  },
  offsetLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  offsetInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "center" as const,
  },
  summaryPill: {
    marginTop: 8,
    backgroundColor: "rgba(16,185,129,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#059669",
  },
  hardSummaryPill: {
    backgroundColor: "rgba(220,38,38,0.06)",
    borderColor: "rgba(220,38,38,0.15)",
  },
  hardSummaryText: {
    color: "#DC2626",
  },
  tzRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  tzBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center" as const,
  },
  tzBtnActive: {
    backgroundColor: "rgba(14,165,233,0.1)",
    borderColor: "#0EA5E9",
  },
  tzBtnText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  tzBtnTextActive: {
    color: "#0EA5E9",
    fontWeight: "600" as const,
  },
  timePill: {
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timePillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
});

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
  packsSection: {
    marginTop: 28,
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

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  Timer,
  Camera,
  Footprints,
  CheckCircle,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import {
  CreateFlowHeader,
  CreateFlowInput,
  TaskTypeCard,
  EnforcementBlock,
  DurationPill,
  CreateFlowCheckbox,
} from "@/src/components/ui";
import { colors as tokenColors } from "@/src/theme/tokens";
import { createFlowStyles as cfs } from "@/src/theme/createFlowStyles";
import {
  JournalCategory,
  WordLimitMode,
  ScheduleType,
  WindowMode,
  TimezoneMode,
} from "@/types";
import {
  formatTimeHHMM,
  computeWindowSummary,
  validateTimeEnforcement,
} from "@/lib/time-enforcement";

type TaskType = "journal" | "timer" | "photo" | "run" | "simple" | "checkin";
type TrackingMode = "distance" | "time";
type DistanceUnit = "miles" | "km" | "meters";

interface LocationItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface TaskEditorTask {
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
  requirePhotoProof?: boolean;
  verificationMethod?: string;
  verificationRuleJson?: { sport?: string; min_distance_m?: number; min_moving_time_s?: number } | null;
}

interface Props {
  visible: boolean;
  editingTask: TaskEditorTask | null;
  onSave: (task: TaskEditorTask) => void;
  onCancel: () => void;
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

const JOURNAL_PROMPTS = [
  "What did you learn about yourself today?",
  "Describe your emotions before vs after completing this.",
  "How did your body feel today? Energy, soreness, recovery.",
  "What was the hardest part of today and how did you push through?",
  "Write about one win and one loss from today.",
];

const TASK_TYPES: {
  id: TaskType;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  color: string;
}[] = [
  { id: "journal", icon: BookOpen, label: "Journal", description: "Write a short reflection", color: tokenColors.accentPurple },
  { id: "timer", icon: Timer, label: "Timer", description: "Stay focused for a set duration", color: tokenColors.accentYellow },
  { id: "photo", icon: Camera, label: "Photo", description: "Upload proof", color: tokenColors.accentPink },
  { id: "run", icon: Footprints, label: "Run", description: "Track distance or time", color: tokenColors.accentGreen },
  { id: "simple", icon: CheckCircle, label: "Basic", description: "Mark complete manually", color: tokenColors.accentGray },
  { id: "checkin", icon: MapPin, label: "Check-in", description: "Verify at a place", color: tokenColors.accentBlue },
];

const TASK_TYPE_MAP: Record<
  TaskType,
  { icon: React.ComponentType<any>; label: string; color: string }
> = {
  journal: { icon: BookOpen, label: "Journal", color: tokenColors.accentPurple },
  timer: { icon: Timer, label: "Timer", color: tokenColors.accentYellow },
  photo: { icon: Camera, label: "Photo", color: tokenColors.accentPink },
  run: { icon: Footprints, label: "Run / Workout", color: tokenColors.accentGreen },
  simple: { icon: CheckCircle, label: "Basic", color: tokenColors.accentGray },
  checkin: { icon: MapPin, label: "Location Check-in", color: tokenColors.accentBlue },
};

export default function TaskEditorModal({
  visible,
  editingTask,
  onSave,
  onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType | null>(null);

  const [journalType, setJournalType] = useState<JournalCategory[]>([]);
  const [journalPrompt, setJournalPrompt] = useState("");
  const [allowFreeWrite, setAllowFreeWrite] = useState(false);
  const [captureMood, setCaptureMood] = useState(true);
  const [captureEnergy, setCaptureEnergy] = useState(true);
  const [captureBodyState, setCaptureBodyState] = useState(false);
  const [minWords, setMinWords] = useState("50");
  const [wordLimitEnabled, setWordLimitEnabled] = useState(false);
  const [wordLimitMode, setWordLimitMode] = useState<WordLimitMode>("PRESET");
  const [wordLimitWords, setWordLimitWords] = useState<number | null>(120);
  const [customWordLimit, setCustomWordLimit] = useState("");
  const [promptIdx] = useState(
    () => Math.floor(Math.random() * JOURNAL_PROMPTS.length)
  );

  const [duration, setDuration] = useState("10");
  const [mustComplete, setMustComplete] = useState(true);

  const [trackingMode, setTrackingMode] = useState<TrackingMode>("distance");
  const [targetDistance, setTargetDistance] = useState("5");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("miles");

  const [locationName, setLocationName] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("150");

  const [teEnabled, setTeEnabled] = useState(false);
  const [teAnchor, setTeAnchor] = useState("05:00");
  const [teDuration, setTeDuration] = useState("");
  const [teWinStart, setTeWinStart] = useState("0");
  const [teWinEnd, setTeWinEnd] = useState("60");
  const [teHardEnabled, setTeHardEnabled] = useState(false);
  const [teHardStart, setTeHardStart] = useState("0");
  const [teHardEnd, setTeHardEnd] = useState("30");
  const [teTzMode, setTeTzMode] = useState<TimezoneMode>("USER_LOCAL");
  const [teTz, setTeTz] = useState("");
  const [requirePhotoProof, setRequirePhotoProof] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"manual" | "photo_proof" | "strava_activity">("manual");
  const [stravaSport, setStravaSport] = useState("Run");
  const [stravaMinDistanceM, setStravaMinDistanceM] = useState("3000");
  const [stravaMinMovingTimeS, setStravaMinMovingTimeS] = useState("900");

  const [advancedJournalOpen, setAdvancedJournalOpen] = useState(false);
  const [advancedTimerOpen, setAdvancedTimerOpen] = useState(false);
  const [advancedRunOpen, setAdvancedRunOpen] = useState(false);
  const [teDetailsExpanded, setTeDetailsExpanded] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setTaskType(null);
    setJournalType([]);
    setJournalPrompt("");
    setAllowFreeWrite(false);
    setCaptureMood(true);
    setCaptureEnergy(true);
    setCaptureBodyState(false);
    setMinWords("50");
    setWordLimitEnabled(false);
    setWordLimitMode("PRESET");
    setWordLimitWords(120);
    setCustomWordLimit("");
    setDuration("10");
    setMustComplete(true);
    setTrackingMode("distance");
    setTargetDistance("5");
    setDistanceUnit("miles");
    setLocationName("");
    setRadiusMeters("150");
    setTeEnabled(false);
    setTeAnchor("05:00");
    setTeDuration("");
    setTeWinStart("0");
    setTeWinEnd("60");
    setTeHardEnabled(false);
    setTeHardStart("0");
    setTeHardEnd("30");
    setTeTzMode("USER_LOCAL");
    setTeTz("");
    setRequirePhotoProof(false);
    setVerificationMethod("manual");
    setStravaSport("Run");
    setStravaMinDistanceM("3000");
    setStravaMinMovingTimeS("900");
    setAdvancedJournalOpen(false);
    setAdvancedTimerOpen(false);
    setAdvancedRunOpen(false);
    setTeDetailsExpanded(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setTaskType(editingTask.type);
      if (editingTask.journalType) setJournalType(editingTask.journalType);
      if (editingTask.journalPrompt) setJournalPrompt(editingTask.journalPrompt);
      if (editingTask.allowFreeWrite !== undefined)
        setAllowFreeWrite(editingTask.allowFreeWrite);
      if (editingTask.captureMood !== undefined)
        setCaptureMood(editingTask.captureMood);
      if (editingTask.captureEnergy !== undefined)
        setCaptureEnergy(editingTask.captureEnergy);
      if (editingTask.captureBodyState !== undefined)
        setCaptureBodyState(editingTask.captureBodyState);
      if (editingTask.minWords) setMinWords(editingTask.minWords.toString());
      if (editingTask.wordLimitEnabled !== undefined)
        setWordLimitEnabled(editingTask.wordLimitEnabled);
      if (editingTask.wordLimitMode) setWordLimitMode(editingTask.wordLimitMode);
      if (editingTask.wordLimitWords) {
        setWordLimitWords(editingTask.wordLimitWords);
        if (editingTask.wordLimitMode === "CUSTOM")
          setCustomWordLimit(editingTask.wordLimitWords.toString());
      }
      if (editingTask.durationMinutes)
        setDuration(editingTask.durationMinutes.toString());
      if (editingTask.targetValue) {
        if (
          editingTask.type === "run" &&
          editingTask.trackingMode === "distance"
        ) {
          setTargetDistance(editingTask.targetValue.toString());
        } else {
          setDuration(editingTask.targetValue.toString());
        }
      }
      if (editingTask.unit && editingTask.unit !== "minutes")
        setDistanceUnit(editingTask.unit as DistanceUnit);
      if (editingTask.trackingMode) setTrackingMode(editingTask.trackingMode);
      if (editingTask.mustCompleteInSession !== undefined)
        setMustComplete(editingTask.mustCompleteInSession);
      if (editingTask.locationName) setLocationName(editingTask.locationName);
      if (editingTask.radiusMeters)
        setRadiusMeters(editingTask.radiusMeters.toString());
      if (editingTask.requirePhotoProof) setRequirePhotoProof(true);
      if (editingTask.verificationMethod === "photo_proof" || (editingTask.requirePhotoProof && editingTask.type !== "photo")) setVerificationMethod("photo_proof");
      else if (editingTask.verificationMethod === "strava_activity") {
        setVerificationMethod("strava_activity");
        const r = editingTask.verificationRuleJson;
        if (r?.sport) setStravaSport(r.sport);
        if (r?.min_distance_m != null) setStravaMinDistanceM(String(r.min_distance_m));
        if (r?.min_moving_time_s != null) setStravaMinMovingTimeS(String(r.min_moving_time_s));
      } else setVerificationMethod("manual");
      if (editingTask.timeEnforcementEnabled) {
        setTeEnabled(true);
        setTeDetailsExpanded(true);
        if (editingTask.anchorTimeLocal)
          setTeAnchor(editingTask.anchorTimeLocal);
        if (editingTask.taskDurationMinutes)
          setTeDuration(editingTask.taskDurationMinutes.toString());
        if (editingTask.windowStartOffsetMin != null)
          setTeWinStart(editingTask.windowStartOffsetMin.toString());
        if (editingTask.windowEndOffsetMin != null)
          setTeWinEnd(editingTask.windowEndOffsetMin.toString());
        if (editingTask.hardWindowEnabled) {
          setTeHardEnabled(true);
          if (editingTask.hardWindowStartOffsetMin != null)
            setTeHardStart(editingTask.hardWindowStartOffsetMin.toString());
          if (editingTask.hardWindowEndOffsetMin != null)
            setTeHardEnd(editingTask.hardWindowEndOffsetMin.toString());
        }
        if (editingTask.timezoneMode) setTeTzMode(editingTask.timezoneMode);
        if (editingTask.challengeTimezone)
          setTeTz(editingTask.challengeTimezone);
      }
    } else {
      resetForm();
    }
  }, [visible, editingTask, resetForm]);

  const canSave = useCallback((): boolean => {
    if (!title.trim() || !taskType) return false;

    if (teEnabled) {
      const v = validateTimeEnforcement({
        timeEnforcementEnabled: true,
        anchorTimeLocal: teAnchor,
        windowStartOffsetMin: parseInt(teWinStart, 10) || 0,
        windowEndOffsetMin: parseInt(teWinEnd, 10) || 60,
        hardWindowStartOffsetMin: teHardEnabled
          ? parseInt(teHardStart, 10) || 0
          : null,
        hardWindowEndOffsetMin: teHardEnabled
          ? parseInt(teHardEnd, 10) || 30
          : null,
        timezoneMode: teTzMode,
        challengeTimezone: teTz || null,
      });
      if (!v.valid) return false;
    }

    switch (taskType) {
      case "journal": {
        const hasPrompt = journalPrompt.trim().length >= 20;
        const hasType = journalType.length > 0 || allowFreeWrite;
        if (wordLimitEnabled) {
          const limit =
            wordLimitMode === "CUSTOM"
              ? parseInt(customWordLimit, 10)
              : wordLimitWords;
          if (!limit || limit < 20 || limit > 1000) return false;
        }
        return hasPrompt || hasType;
      }
      case "timer":
        return parseInt(duration, 10) > 0;
      case "run":
        return trackingMode === "distance"
          ? parseFloat(targetDistance) > 0
          : parseInt(duration, 10) > 0;
      case "checkin":
        return (
          locationName.trim().length > 0 && parseInt(radiusMeters, 10) > 0
        );
      case "photo":
      case "simple":
        return true;
      default:
        return false;
    }
  }, [
    title,
    taskType,
    teEnabled,
    teAnchor,
    teWinStart,
    teWinEnd,
    teHardEnabled,
    teHardStart,
    teHardEnd,
    teTzMode,
    teTz,
    journalPrompt,
    journalType,
    allowFreeWrite,
    wordLimitEnabled,
    wordLimitMode,
    wordLimitWords,
    customWordLimit,
    duration,
    trackingMode,
    targetDistance,
    locationName,
    radiusMeters,
  ]);

  const handleSave = useCallback(() => {
    if (!canSave()) {
      Alert.alert("Missing Info", "Please fill in all required fields");
      return;
    }

    const teFields: Partial<TaskEditorTask> = teEnabled
      ? {
          timeEnforcementEnabled: true,
          scheduleType: "DAILY" as ScheduleType,
          anchorTimeLocal: teAnchor,
          taskDurationMinutes: teDuration
            ? parseInt(teDuration, 10)
            : null,
          windowMode: "WINDOW" as WindowMode,
          windowStartOffsetMin: parseInt(teWinStart, 10) || 0,
          windowEndOffsetMin: parseInt(teWinEnd, 10) || 60,
          hardWindowEnabled: teHardEnabled,
          hardWindowStartOffsetMin: teHardEnabled
            ? parseInt(teHardStart, 10) || 0
            : null,
          hardWindowEndOffsetMin: teHardEnabled
            ? parseInt(teHardEnd, 10) || 30
            : null,
          timezoneMode: teTzMode,
          challengeTimezone:
            teTzMode === "CHALLENGE_TIMEZONE" ? teTz : null,
        }
      : { timeEnforcementEnabled: false };

    const verMethod: "manual" | "photo_proof" | "strava_activity" =
      verificationMethod === "strava_activity" ? "strava_activity"
      : verificationMethod === "photo_proof" || (taskType === "photo" || requirePhotoProof) ? "photo_proof"
      : "manual";
    const verRuleJson =
      verMethod === "strava_activity"
        ? {
            sport: stravaSport,
            min_distance_m: parseInt(stravaMinDistanceM, 10) || 0,
            min_moving_time_s: parseInt(stravaMinMovingTimeS, 10) || 0,
          }
        : null;

    const base: TaskEditorTask = {
      id: editingTask?.id || Date.now().toString(),
      title: title.trim(),
      type: taskType!,
      required: true,
      requirePhotoProof: taskType === "photo" ? true : requirePhotoProof,
      verificationMethod: verMethod,
      verificationRuleJson: verRuleJson,
      ...teFields,
    };

    let task: TaskEditorTask = base;

    switch (taskType) {
      case "journal":
        task = {
          ...base,
          minWords: parseInt(minWords, 10) || 50,
          journalType,
          journalPrompt: journalPrompt.trim(),
          allowFreeWrite,
          captureMood,
          captureEnergy,
          captureBodyState,
          wordLimitEnabled,
          wordLimitMode: wordLimitEnabled ? wordLimitMode : undefined,
          wordLimitWords: wordLimitEnabled
            ? wordLimitMode === "CUSTOM"
              ? parseInt(customWordLimit, 10) || null
              : wordLimitWords
            : null,
        };
        break;
      case "timer":
        task = {
          ...base,
          targetValue: parseInt(duration, 10) || 10,
          unit: "minutes" as const,
          durationMinutes: parseInt(duration, 10) || 10,
          mustCompleteInSession: mustComplete,
        };
        break;
      case "photo":
        task = { ...base, photoRequired: true };
        break;
      case "run":
        task =
          trackingMode === "distance"
            ? { ...base, trackingMode, targetValue: parseFloat(targetDistance), unit: distanceUnit }
            : { ...base, trackingMode, targetValue: parseInt(duration, 10), unit: "minutes" as const };
        break;
      case "simple":
        task = base;
        break;
      case "checkin":
        task = {
          ...base,
          locationName: locationName.trim(),
          radiusMeters: parseInt(radiusMeters, 10) || 150,
        };
        break;
    }
    onSave(task);
  }, [
    canSave,
    editingTask,
    title,
    taskType,
    teEnabled,
    teAnchor,
    teDuration,
    teWinStart,
    teWinEnd,
    teHardEnabled,
    teHardStart,
    teHardEnd,
    teTzMode,
    teTz,
    minWords,
    journalType,
    journalPrompt,
    allowFreeWrite,
    captureMood,
    captureEnergy,
    captureBodyState,
    wordLimitEnabled,
    wordLimitMode,
    wordLimitWords,
    customWordLimit,
    duration,
    mustComplete,
    trackingMode,
    targetDistance,
    distanceUnit,
    locationName,
    radiusMeters,
    requirePhotoProof,
    verificationMethod,
    stravaSport,
    stravaMinDistanceM,
    stravaMinMovingTimeS,
    onSave,
  ]);

  const getPreviewMeta = (): string => {
    if (!taskType) return "";
    const parts: string[] = [];
    switch (taskType) {
      case "journal": {
        if (journalType.length > 0) {
          const labels = journalType.map(
            (jt) => JOURNAL_CATEGORIES.find((c) => c.id === jt)?.label || jt
          );
          parts.push(labels.slice(0, 2).join(", "));
        }
        if (wordLimitEnabled && wordLimitWords) {
          parts.push(`${wordLimitMode === "CUSTOM" ? parseInt(customWordLimit, 10) || wordLimitWords : wordLimitWords}w limit`);
        }
        break;
      }
      case "timer":
        parts.push(`${duration || 10} min${mustComplete ? " · no exit" : ""}`);
        break;
      case "photo":
        parts.push("In-app camera");
        break;
      case "run":
        parts.push(
          trackingMode === "distance"
            ? `${targetDistance} ${distanceUnit}`
            : `${duration} minutes`
        );
        break;
      case "simple":
        parts.push("Tap to verify");
        break;
      case "checkin":
        parts.push(
          locationName
            ? `${locationName} (${radiusMeters}m)`
            : "Location check-in"
        );
        break;
    }
    return parts.join(" · ");
  };

  const renderTypeSelector = () => (
    <View style={s.typeGrid}>
      {TASK_TYPES.map((t) => {
        const Icon = t.icon;
        return (
          <View key={t.id} style={s.typeGridItem}>
            <TaskTypeCard
              label={t.label}
              description={t.description}
              selected={taskType === t.id}
              onPress={() => setTaskType(t.id)}
              icon={<Icon size={22} color={t.color} />}
              accentColor={t.color}
            />
          </View>
        );
      })}
    </View>
  );

  const CollapsibleSection = ({
    title,
    open,
    onToggle,
    children,
  }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <View style={s.collapsibleWrap}>
      <TouchableOpacity style={s.collapsibleHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={s.collapsibleTitle}>{title}</Text>
        {open ? <ChevronUp size={18} color={tokenColors.textSecondaryCreate} /> : <ChevronDown size={18} color={tokenColors.textSecondaryCreate} />}
      </TouchableOpacity>
      {open ? <View style={s.collapsibleBody}>{children}</View> : null}
    </View>
  );

  const renderJournalSettings = () => (
    <View style={cfs.settingsCard}>
      <View style={cfs.fieldGroup}>
        <Text style={s.inputLabel}>Prompt (optional)</Text>
        <Text style={s.inputHint}>Appears at the top when the user journals.</Text>
        <CreateFlowInput
          value={journalPrompt}
          onChangeText={setJournalPrompt}
          placeholder={JOURNAL_PROMPTS[promptIdx]}
          multiline
        />
        <View style={s.charRow}>
          {journalPrompt.trim().length > 0 && journalPrompt.trim().length < 20 && (
            <Text style={s.errorText}>Min 20 characters</Text>
          )}
          <View style={{ flex: 1 }} />
          <Text style={[s.hintText, journalPrompt.length > 220 && { color: tokenColors.accentRed }]}>
            {journalPrompt.length}/240
          </Text>
        </View>
      </View>

      <CollapsibleSection
        title="Advanced options"
        open={advancedJournalOpen}
        onToggle={() => setAdvancedJournalOpen(!advancedJournalOpen)}
      >
        <View style={cfs.fieldGroup}>
          <Text style={s.inputLabel}>What is this journal about?</Text>
          <View style={s.chipGrid}>
            {JOURNAL_CATEGORIES.map((cat) => {
              const sel = journalType.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.chip, sel && s.chipSelected]}
                  onPress={() => {
                    setJournalType((prev) =>
                      prev.includes(cat.id)
                        ? prev.filter((c) => c !== cat.id)
                        : [...prev, cat.id]
                    );
                    if (cat.id === "free_write")
                      setAllowFreeWrite(!journalType.includes(cat.id));
                  }}
                >
                  <Text style={[s.chipText, sel && s.chipTextSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={cfs.fieldGroup}>
          <Text style={s.inputLabel}>Quick check-ins</Text>
          <CreateFlowCheckbox checked={captureMood} onPress={() => setCaptureMood(!captureMood)} label="Capture mood" />
          <CreateFlowCheckbox checked={captureEnergy} onPress={() => setCaptureEnergy(!captureEnergy)} label="Capture energy level" />
          <CreateFlowCheckbox checked={captureBodyState} onPress={() => setCaptureBodyState(!captureBodyState)} label="Capture body state" />
        </View>
        <View style={cfs.fieldGroup}>
          <CreateFlowCheckbox
            checked={wordLimitEnabled}
            onPress={() => setWordLimitEnabled(!wordLimitEnabled)}
            label="Limit entry length"
          />
          {wordLimitEnabled && (
            <View style={s.wordLimitBody}>
              <View style={s.modeRow}>
                <DurationPill label="Fair preset" selected={wordLimitMode === "PRESET"} onPress={() => setWordLimitMode("PRESET")} />
                <DurationPill label="Custom" selected={wordLimitMode === "CUSTOM"} onPress={() => setWordLimitMode("CUSTOM")} />
              </View>
              {wordLimitMode === "PRESET" ? (
                <View style={s.presetRow}>
                  {([50, 120, 250, 500] as const).map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[s.presetCard, wordLimitWords === w && s.presetCardActive]}
                      onPress={() => setWordLimitWords(w)}
                    >
                      <Text style={[s.presetNum, wordLimitWords === w && s.presetNumActive]}>{w}</Text>
                      <Text style={[s.presetLabel, wordLimitWords === w && s.presetLabelActive]}>
                        {w === 50 ? "Short" : w === 120 ? "Standard" : w === 250 ? "Deep" : "Long"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={cfs.fieldGroup}>
                  <Text style={s.inputLabel}>Max words</Text>
                  <CreateFlowInput
                    value={customWordLimit}
                    onChangeText={setCustomWordLimit}
                    placeholder="e.g., 150"
                  />
                  <Text style={s.inputHint}>Min 20, max 1000</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </CollapsibleSection>
    </View>
  );

  const renderTimerSettings = () => (
    <View style={cfs.settingsCard}>
      <View style={cfs.fieldGroup}>
        <CreateFlowInput label="Target minutes" value={duration} onChangeText={setDuration} placeholder="10" />
      </View>
      <CollapsibleSection
        title="Advanced options"
        open={advancedTimerOpen}
        onToggle={() => setAdvancedTimerOpen(!advancedTimerOpen)}
      >
        <CreateFlowCheckbox checked={mustComplete} onPress={() => setMustComplete(!mustComplete)} label="Must complete without exiting" />
      </CollapsibleSection>
    </View>
  );

  const renderPhotoSettings = () => (
    <View style={cfs.settingsCard}>
      <View style={s.lockedRow}>
        <Camera size={18} color={tokenColors.textSecondaryCreate} />
        <Text style={s.lockedText}>User uploads 1 photo</Text>
      </View>
    </View>
  );

  const renderRunSettings = () => (
    <View style={cfs.settingsCard}>
      {trackingMode === "distance" ? (
        <View style={cfs.fieldGroup}>
          <CreateFlowInput label="Target distance" value={targetDistance} onChangeText={setTargetDistance} placeholder="5" />
          <View style={s.modeRow}>
            {(["miles", "km", "meters"] as const).map((u) => (
              <DurationPill key={u} label={u} selected={distanceUnit === u} onPress={() => setDistanceUnit(u)} />
            ))}
          </View>
        </View>
      ) : (
        <View style={cfs.fieldGroup}>
          <CreateFlowInput label="Target minutes" value={duration} onChangeText={setDuration} placeholder="30" />
        </View>
      )}
      <CollapsibleSection
        title="Advanced options"
        open={advancedRunOpen}
        onToggle={() => setAdvancedRunOpen(!advancedRunOpen)}
      >
        <View style={cfs.fieldGroup}>
          <Text style={s.inputLabel}>Tracking mode</Text>
          <View style={s.modeRow}>
            <DurationPill label="Distance" selected={trackingMode === "distance"} onPress={() => setTrackingMode("distance")} />
            <DurationPill label="Time" selected={trackingMode === "time"} onPress={() => setTrackingMode("time")} />
          </View>
        </View>
      </CollapsibleSection>
    </View>
  );

  const renderSimpleSettings = () => (
    <View style={cfs.settingsCard}>
      <View style={s.lockedRow}>
        <CheckCircle size={18} color={tokenColors.textSecondaryCreate} />
        <Text style={s.lockedText}>User taps complete (confirm modal shown)</Text>
      </View>
    </View>
  );

  const renderCheckinSettings = () => (
    <View style={cfs.settingsCard}>
      <View style={cfs.fieldGroup}>
        <CreateFlowInput label="Location Name" value={locationName} onChangeText={setLocationName} placeholder="e.g. LA Fitness, Central Park" />
      </View>
      <View style={cfs.fieldGroup}>
        <CreateFlowInput label="Radius (meters)" value={radiusMeters} onChangeText={setRadiusMeters} placeholder="150" />
        <Text style={s.inputHint}>User must check in within this radius</Text>
      </View>
    </View>
  );

  const renderSettings = () => {
    if (!taskType) return null;
    switch (taskType) {
      case "journal":
        return renderJournalSettings();
      case "timer":
        return renderTimerSettings();
      case "photo":
        return renderPhotoSettings();
      case "run":
        return renderRunSettings();
      case "simple":
        return renderSimpleSettings();
      case "checkin":
        return renderCheckinSettings();
      default:
        return null;
    }
  };

  const renderTimeEnforcement = () => {
    if (!taskType) return null;
    return (
      <EnforcementBlock title="Time requirement (optional)">
        <CreateFlowCheckbox
          checked={teEnabled}
          onPress={() => {
            setTeEnabled(!teEnabled);
            if (!teEnabled) setTeDetailsExpanded(true);
          }}
          label="Require completion at a specific time"
        />

        {teEnabled && (
          <View style={s.collapsibleWrap}>
            <TouchableOpacity
              style={s.collapsibleHeader}
              onPress={() => setTeDetailsExpanded(!teDetailsExpanded)}
              activeOpacity={0.7}
            >
              <Text style={s.collapsibleTitle}>Time details</Text>
              {teDetailsExpanded ? <ChevronUp size={18} color={tokenColors.textSecondaryCreate} /> : <ChevronDown size={18} color={tokenColors.textSecondaryCreate} />}
            </TouchableOpacity>
            {teDetailsExpanded && (
              <View style={[s.teBody, s.collapsibleBody]}>
                <View style={cfs.fieldGroup}>
                  <CreateFlowInput
                    label="Complete around"
                    value={teAnchor}
                    onChangeText={setTeAnchor}
                    placeholder="05:00"
                  />
                  <Text style={s.inputHint}>24h format (HH:mm)</Text>
                </View>

                <View style={cfs.fieldGroup}>
                  <CreateFlowInput
                    label="Expected duration (optional)"
                    value={teDuration}
                    onChangeText={setTeDuration}
                    placeholder="e.g. 10"
                  />
                  <Text style={s.inputHint}>Minutes</Text>
                </View>

                <View style={cfs.fieldGroup}>
                  <Text style={s.inputLabel}>Allowed window</Text>
              <View style={s.offsetRow}>
                <View style={s.offsetField}>
                  <Text style={s.offsetLabel}>Starts (min)</Text>
                  <TextInput
                    style={s.offsetInput}
                    value={teWinStart}
                    onChangeText={setTeWinStart}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={tokenColors.textSecondaryCreate}
                  />
                </View>
                <View style={s.offsetField}>
                  <Text style={s.offsetLabel}>Ends (min)</Text>
                  <TextInput
                    style={s.offsetInput}
                    value={teWinEnd}
                    onChangeText={setTeWinEnd}
                    keyboardType="number-pad"
                    placeholder="60"
                    placeholderTextColor={tokenColors.textSecondaryCreate}
                  />
                </View>
              </View>
              {teAnchor && (
                <View style={cfs.allowedPill}>
                  <Text style={cfs.allowedPillText}>
                    {"Allowed: " +
                      computeWindowSummary(
                        teAnchor,
                        parseInt(teWinStart, 10) || 0,
                        parseInt(teWinEnd, 10) || 60
                      )}
                  </Text>
                </View>
              )}
            </View>

            <View style={cfs.fieldGroup}>
              <CreateFlowCheckbox
                checked={teHardEnabled}
                onPress={() => setTeHardEnabled(!teHardEnabled)}
                label="Strict window"
              />
              {teHardEnabled && (
                <>
                  <View style={s.offsetRow}>
                    <View style={s.offsetField}>
                      <Text style={s.offsetLabel}>Starts (min)</Text>
                      <TextInput
                        style={s.offsetInput}
                        value={teHardStart}
                        onChangeText={setTeHardStart}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={tokenColors.textSecondaryCreate}
                      />
                    </View>
                    <View style={s.offsetField}>
                      <Text style={s.offsetLabel}>Ends (min)</Text>
                      <TextInput
                        style={s.offsetInput}
                        value={teHardEnd}
                        onChangeText={setTeHardEnd}
                        keyboardType="number-pad"
                        placeholder="30"
                        placeholderTextColor={tokenColors.textSecondaryCreate}
                      />
                    </View>
                  </View>
                  {teAnchor && (
                    <View style={cfs.hardPill}>
                      <Text style={cfs.hardPillText}>
                        {"Hard mode: " +
                          computeWindowSummary(
                            teAnchor,
                            parseInt(teHardStart, 10) || 0,
                            parseInt(teHardEnd, 10) || 30
                          )}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={cfs.fieldGroup}>
              <Text style={s.inputLabel}>Timezone</Text>
              <View style={s.modeRow}>
                <DurationPill
                  label="User local"
                  selected={teTzMode === "USER_LOCAL"}
                  onPress={() => setTeTzMode("USER_LOCAL")}
                />
                <DurationPill
                  label="Locked timezone"
                  selected={teTzMode === "CHALLENGE_TIMEZONE"}
                  onPress={() => setTeTzMode("CHALLENGE_TIMEZONE")}
                />
              </View>
              {teTzMode === "CHALLENGE_TIMEZONE" && (
                <CreateFlowInput
                  value={teTz}
                  onChangeText={setTeTz}
                  placeholder="e.g. America/New_York"
                />
              )}
            </View>
          </View>
            )}
          </View>
        )}
      </EnforcementBlock>
    );
  };

  const renderPreview = () => {
    if (!taskType || !title.trim()) return null;
    const cfg = TASK_TYPE_MAP[taskType];
    const Icon = cfg.icon;
    const meta = getPreviewMeta();

    return (
      <View style={cfs.section}>
        <Text style={cfs.sectionLabel}>PREVIEW</Text>
        <View style={s.previewCard}>
          <View style={[s.previewIcon, { backgroundColor: `${cfg.color}18` }]}>
            <Icon size={22} color={cfg.color} />
          </View>
          <View style={s.previewContent}>
            <Text style={s.previewTitle} numberOfLines={1}>
              {title.trim()}
            </Text>
            {meta.length > 0 && (
              <Text style={s.previewMeta} numberOfLines={2}>
                {meta}
              </Text>
            )}
            {journalPrompt.trim().length >= 20 && taskType === "journal" && (
              <Text style={s.previewPromptText} numberOfLines={1}>
                {journalPrompt.trim().length > 50
                  ? journalPrompt.trim().slice(0, 50) + "..."
                  : journalPrompt.trim()}
              </Text>
            )}
            {teEnabled && teAnchor && (
              <View style={s.previewBadge}>
                <Clock size={12} color={tokenColors.accentBlue} />
                <Text style={[s.previewBadgeText, { color: tokenColors.accentBlue }]}>
                  {formatTimeHHMM(teAnchor)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      testID="task-editor-modal"
    >
      <SafeAreaView style={[cfs.screenContainer, { backgroundColor: tokenColors.bgMain }]} edges={["top", "bottom"]}>
        <CreateFlowHeader
          title={editingTask ? "Edit Task" : "New Task"}
          onCancel={onCancel}
          rightLabel={editingTask ? "Save" : "Add"}
          onRight={handleSave}
          rightDisabled={!canSave()}
          rightButtonVariant="soft"
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[cfs.screenPadding, { paddingTop: 16 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={cfs.section}>
              <CreateFlowInput
                label="Task name"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning run, Journal, Meditate..."
              />
            </View>

            <View style={cfs.section}>
              <Text style={cfs.sectionLabel}>Task type</Text>
              {renderTypeSelector()}
            </View>

            {taskType && (
              <View style={cfs.section}>
                <Text style={cfs.sectionLabel}>Verification</Text>
                <View style={s.typeGrid}>
                  {(["manual", "photo_proof", "strava_activity"] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        s.verificationPill,
                        verificationMethod === method && s.verificationPillActive,
                      ]}
                      onPress={() => {
                        setVerificationMethod(method);
                        if (method === "photo_proof") setRequirePhotoProof(true);
                        else if (method === "manual" && taskType !== "photo") setRequirePhotoProof(false);
                      }}
                    >
                      <Text style={[
                        s.verificationPillText,
                        verificationMethod === method && s.verificationPillTextActive,
                      ]}>
                        {method === "manual" ? "Manual" : method === "photo_proof" ? "Photo proof" : "Strava activity"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {verificationMethod === "photo_proof" && (
                  <CreateFlowCheckbox
                    checked={true}
                    onPress={() => {}}
                    label="Photo proof required"
                  />
                )}
                {taskType === "photo" && (
                  <Text style={s.inputHint}>Photo tasks always require an image.</Text>
                )}
                {verificationMethod === "strava_activity" && (
                  <View style={s.collapsibleBody}>
                    <Text style={s.offsetLabel}>Sport type</Text>
                    <View style={s.typeGrid}>
                      {STRAVA_SPORTS.map((sport) => (
                        <TouchableOpacity
                          key={sport}
                          style={[s.verificationPill, stravaSport === sport && s.verificationPillActive]}
                          onPress={() => setStravaSport(sport)}
                        >
                          <Text style={[s.verificationPillText, stravaSport === sport && s.verificationPillTextActive]}>{sport}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={s.offsetRow}>
                      <View style={s.offsetField}>
                        <Text style={s.offsetLabel}>Min distance (m)</Text>
                        <TextInput
                          style={s.offsetInput}
                          value={stravaMinDistanceM}
                          onChangeText={setStravaMinDistanceM}
                          keyboardType="number-pad"
                          placeholder="3000"
                        />
                      </View>
                      <View style={s.offsetField}>
                        <Text style={s.offsetLabel}>Min moving time (s)</Text>
                        <TextInput
                          style={s.offsetInput}
                          value={stravaMinMovingTimeS}
                          onChangeText={setStravaMinMovingTimeS}
                          keyboardType="number-pad"
                          placeholder="900"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {taskType && (
              <View style={cfs.section}>
                <Text style={cfs.sectionLabel}>Settings</Text>
                {renderSettings()}
              </View>
            )}

            {taskType && (
              <View style={cfs.section}>
                {renderTimeEnforcement()}
              </View>
            )}

            {renderPreview()}

            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const STRAVA_SPORTS = ["Run", "Ride", "Walk"] as const;

const s = StyleSheet.create({
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  verificationPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: tokenColors.cardBg,
    borderWidth: 1.5,
    borderColor: tokenColors.borderLight,
  },
  verificationPillActive: {
    borderColor: tokenColors.accentGreen,
    backgroundColor: tokenColors.accentGreen + "18",
  },
  verificationPillText: {
    fontSize: 14,
    fontWeight: "500",
    color: tokenColors.textSecondaryCreate,
  },
  verificationPillTextActive: {
    color: tokenColors.accentGreen,
  },
  typeGridItem: {
    width: "48%",
    minWidth: 0,
  },
  collapsibleWrap: {
    marginTop: 8,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  collapsibleTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokenColors.textSecondaryCreate,
  },
  collapsibleBody: {
    marginTop: 4,
    paddingTop: 4,
    gap: 14,
  },
  teBody: { marginTop: 4, gap: 14 },
  offsetRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  offsetField: { flex: 1 },
  offsetLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: tokenColors.textSecondaryCreate,
    marginBottom: 4,
  },
  offsetInput: {
    height: 48,
    backgroundColor: tokenColors.cardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: tokenColors.borderLight,
    paddingHorizontal: 12,
    fontSize: 16,
    color: tokenColors.textPrimary,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: tokenColors.textPrimary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputHint: {
    fontSize: 12,
    color: tokenColors.textSecondaryCreate,
    marginTop: 4,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F2F2F1",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: `${tokenColors.accentPurple}18`,
    borderColor: tokenColors.accentPurple,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: tokenColors.textSecondaryCreate,
  },
  chipTextSelected: { color: tokenColors.accentPurple },
  charRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  hintText: { fontSize: 11, color: tokenColors.textSecondaryCreate },
  errorText: { fontSize: 11, color: tokenColors.accentRed },
  wordLimitBody: { marginTop: 8 },
  presetRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  presetCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: tokenColors.cardBg,
    borderWidth: 1.5,
    borderColor: tokenColors.borderLight,
  },
  presetCardActive: {
    borderColor: tokenColors.accentPurple,
    backgroundColor: `${tokenColors.accentPurple}12`,
  },
  presetNum: {
    fontSize: 18,
    fontWeight: "700",
    color: tokenColors.textSecondaryCreate,
    marginBottom: 2,
  },
  presetNumActive: { color: tokenColors.accentPurple },
  presetLabel: { fontSize: 11, fontWeight: "500", color: tokenColors.textSecondaryCreate },
  presetLabelActive: { color: tokenColors.accentPurple },
  purpleHint: { fontSize: 12, color: tokenColors.accentPurple, fontWeight: "500", marginTop: 4 },
  lockedRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  lockedText: { fontSize: 14, color: tokenColors.textSecondaryCreate },
  previewCard: {
    backgroundColor: tokenColors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: tokenColors.borderLight,
    flexDirection: "row",
    gap: 14,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewContent: { flex: 1, gap: 3 },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: tokenColors.textPrimary,
  },
  previewMeta: {
    fontSize: 14,
    color: tokenColors.textSecondaryCreate,
    lineHeight: 18,
  },
  previewPromptText: {
    fontSize: 12,
    color: tokenColors.accentPurple,
    fontStyle: "italic",
  },
  previewBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  previewBadgeText: { fontSize: 12, fontWeight: "600" },
});

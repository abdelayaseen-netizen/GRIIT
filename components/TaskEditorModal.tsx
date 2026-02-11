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
  Check,
} from "lucide-react-native";
import Colors from "@/constants/colors";
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
  color: string;
}[] = [
  { id: "journal", icon: BookOpen, label: "Journal", color: "#6366F1" },
  { id: "timer", icon: Timer, label: "Timer", color: "#F59E0B" },
  { id: "photo", icon: Camera, label: "Photo", color: "#EC4899" },
  { id: "run", icon: Footprints, label: "Run", color: "#10B981" },
  { id: "simple", icon: CheckCircle, label: "Simple", color: "#6B7280" },
  { id: "checkin", icon: MapPin, label: "Check-in", color: "#0EA5E9" },
];

const TASK_TYPE_MAP: Record<
  TaskType,
  { icon: React.ComponentType<any>; label: string; color: string }
> = {
  journal: { icon: BookOpen, label: "Journal", color: "#6366F1" },
  timer: { icon: Timer, label: "Timer", color: "#F59E0B" },
  photo: { icon: Camera, label: "Photo", color: "#EC4899" },
  run: { icon: Footprints, label: "Run / Workout", color: "#10B981" },
  simple: { icon: CheckCircle, label: "Simple Check", color: "#6B7280" },
  checkin: { icon: MapPin, label: "Location Check-in", color: "#0EA5E9" },
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
      if (editingTask.timeEnforcementEnabled) {
        setTeEnabled(true);
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
        return hasPrompt && hasType;
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

    const base: TaskEditorTask = {
      id: editingTask?.id || Date.now().toString(),
      title: title.trim(),
      type: taskType!,
      required: true,
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

    console.log("[TaskEditor] Saving task:", task.title, task.type);
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
        const selected = taskType === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={[
              s.typeCard,
              selected && { borderColor: t.color, backgroundColor: `${t.color}0A` },
            ]}
            onPress={() => setTaskType(t.id)}
            activeOpacity={0.7}
          >
            <View style={[s.typeIcon, { backgroundColor: `${t.color}18` }]}>
              <Icon size={18} color={t.color} />
            </View>
            <Text
              style={[
                s.typeLabel,
                selected && { color: t.color, fontWeight: "600" as const },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderJournalSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>What is this journal about?</Text>
        <View style={s.chipGrid}>
          {JOURNAL_CATEGORIES.map((cat) => {
            const sel = journalType.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.chip, sel && { backgroundColor: "#6366F115", borderColor: "#6366F1" }]}
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
                <Text style={[s.chipText, sel && { color: "#6366F1" }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Prompt (what should they write about?)</Text>
        <Text style={s.inputHint}>This appears at the top when the user journals.</Text>
        <TextInput
          style={[s.input, s.textArea, { marginTop: 6 }]}
          value={journalPrompt}
          onChangeText={setJournalPrompt}
          placeholder={JOURNAL_PROMPTS[promptIdx]}
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={240}
        />
        <View style={s.charRow}>
          {journalPrompt.trim().length > 0 && journalPrompt.trim().length < 20 && (
            <Text style={s.errorText}>Min 20 characters</Text>
          )}
          <View style={{ flex: 1 }} />
          <Text style={[s.hintText, journalPrompt.length > 220 && { color: Colors.warning }]}>
            {journalPrompt.length}/240
          </Text>
        </View>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Quick check-ins</Text>
        <TouchableOpacity style={s.toggleRow} onPress={() => setCaptureMood(!captureMood)}>
          <View style={[s.toggleBox, captureMood && s.toggleBoxActive]}>
            {captureMood && <Check size={14} color="#fff" />}
          </View>
          <Text style={s.toggleLabel}>Capture mood</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.toggleRow} onPress={() => setCaptureEnergy(!captureEnergy)}>
          <View style={[s.toggleBox, captureEnergy && s.toggleBoxActive]}>
            {captureEnergy && <Check size={14} color="#fff" />}
          </View>
          <Text style={s.toggleLabel}>Capture energy level</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.toggleRow} onPress={() => setCaptureBodyState(!captureBodyState)}>
          <View style={[s.toggleBox, captureBodyState && s.toggleBoxActive]}>
            {captureBodyState && <Check size={14} color="#fff" />}
          </View>
          <Text style={s.toggleLabel}>Capture body state</Text>
        </TouchableOpacity>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Word limit</Text>
        <TouchableOpacity style={s.toggleRow} onPress={() => setWordLimitEnabled(!wordLimitEnabled)}>
          <View style={[s.toggleBox, wordLimitEnabled && s.toggleBoxActive]}>
            {wordLimitEnabled && <Check size={14} color="#fff" />}
          </View>
          <Text style={s.toggleLabel}>Limit entry length</Text>
        </TouchableOpacity>

        {!wordLimitEnabled && (
          <Text style={s.inputHint}>
            Limits keep journaling quick and consistent. Turn off for free writing.
          </Text>
        )}

        {wordLimitEnabled && (
          <View style={{ marginTop: 8 }}>
            <View style={s.modeRow}>
              <TouchableOpacity
                style={[s.modeBtn, wordLimitMode === "PRESET" && s.modeBtnActive]}
                onPress={() => setWordLimitMode("PRESET")}
              >
                <Text style={[s.modeBtnText, wordLimitMode === "PRESET" && s.modeBtnTextActive]}>
                  Fair preset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modeBtn, wordLimitMode === "CUSTOM" && s.modeBtnActive]}
                onPress={() => setWordLimitMode("CUSTOM")}
              >
                <Text style={[s.modeBtnText, wordLimitMode === "CUSTOM" && s.modeBtnTextActive]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {wordLimitMode === "PRESET" ? (
              <View style={s.presetRow}>
                {(
                  [
                    { words: 50, label: "Short" },
                    { words: 120, label: "Standard" },
                    { words: 250, label: "Deep" },
                    { words: 500, label: "Long" },
                  ] as const
                ).map((p) => (
                  <TouchableOpacity
                    key={p.words}
                    style={[
                      s.presetCard,
                      wordLimitWords === p.words && s.presetCardActive,
                    ]}
                    onPress={() => setWordLimitWords(p.words)}
                  >
                    <Text
                      style={[
                        s.presetNum,
                        wordLimitWords === p.words && s.presetNumActive,
                      ]}
                    >
                      {p.words}
                    </Text>
                    <Text
                      style={[
                        s.presetLabel,
                        wordLimitWords === p.words && s.presetLabelActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{ gap: 4, marginTop: 4 }}>
                <Text style={s.inputLabel}>Max words</Text>
                <TextInput
                  style={s.input}
                  value={customWordLimit}
                  onChangeText={setCustomWordLimit}
                  keyboardType="number-pad"
                  placeholder="e.g., 150"
                  placeholderTextColor={Colors.text.tertiary}
                />
                <Text style={s.inputHint}>Min 20, max 1000</Text>
                {customWordLimit &&
                  parseInt(customWordLimit, 10) >= 20 &&
                  parseInt(customWordLimit, 10) <= 1000 && (
                    <Text style={{ fontSize: 12, color: "#6366F1", fontWeight: "500" as const }}>
                      Users can write up to {customWordLimit} words.
                    </Text>
                  )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderTimerSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Target minutes</Text>
        <TextInput
          style={s.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          placeholder="10"
          placeholderTextColor={Colors.text.tertiary}
        />
      </View>
      <TouchableOpacity style={s.toggleRow} onPress={() => setMustComplete(!mustComplete)}>
        <View style={[s.toggleBox, mustComplete && s.toggleBoxActive]}>
          {mustComplete && <Check size={14} color="#fff" />}
        </View>
        <Text style={s.toggleLabel}>Must complete without exiting</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhotoSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.lockedRow}>
        <Camera size={16} color={Colors.text.secondary} />
        <Text style={s.lockedText}>User uploads 1 photo</Text>
      </View>
    </View>
  );

  const renderRunSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Tracking Mode</Text>
        <View style={s.modeRow}>
          <TouchableOpacity
            style={[s.modeBtn, trackingMode === "distance" && s.modeBtnActive]}
            onPress={() => setTrackingMode("distance")}
          >
            <Text style={[s.modeBtnText, trackingMode === "distance" && s.modeBtnTextActive]}>
              Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, trackingMode === "time" && s.modeBtnActive]}
            onPress={() => setTrackingMode("time")}
          >
            <Text style={[s.modeBtnText, trackingMode === "time" && s.modeBtnTextActive]}>
              Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {trackingMode === "distance" ? (
        <View style={s.fieldGroup}>
          <Text style={s.inputLabel}>Target Distance</Text>
          <TextInput
            style={s.input}
            value={targetDistance}
            onChangeText={setTargetDistance}
            keyboardType="decimal-pad"
            placeholder="5"
            placeholderTextColor={Colors.text.tertiary}
          />
          <View style={[s.modeRow, { marginTop: 8 }]}>
            {(["miles", "km", "meters"] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[s.modeBtn, distanceUnit === u && s.modeBtnActive]}
                onPress={() => setDistanceUnit(u)}
              >
                <Text style={[s.modeBtnText, distanceUnit === u && s.modeBtnTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={s.fieldGroup}>
          <Text style={s.inputLabel}>Target minutes</Text>
          <TextInput
            style={s.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
      )}
    </View>
  );

  const renderSimpleSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.lockedRow}>
        <CheckCircle size={16} color={Colors.text.secondary} />
        <Text style={s.lockedText}>User taps complete (confirm modal shown)</Text>
      </View>
    </View>
  );

  const renderCheckinSettings = () => (
    <View style={s.settingsCard}>
      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Location Name</Text>
        <TextInput
          style={s.input}
          value={locationName}
          onChangeText={setLocationName}
          placeholder="e.g. LA Fitness, Central Park"
          placeholderTextColor={Colors.text.tertiary}
        />
      </View>
      <View style={s.fieldGroup}>
        <Text style={s.inputLabel}>Radius (meters)</Text>
        <TextInput
          style={s.input}
          value={radiusMeters}
          onChangeText={setRadiusMeters}
          keyboardType="number-pad"
          placeholder="150"
          placeholderTextColor={Colors.text.tertiary}
        />
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
      <View style={s.settingsCard}>
        <Text style={s.settingsTitle}>Time enforcement</Text>
        <TouchableOpacity style={s.toggleRow} onPress={() => setTeEnabled(!teEnabled)}>
          <View style={[s.toggleBox, teEnabled && s.toggleBoxActive]}>
            {teEnabled && <Check size={14} color="#fff" />}
          </View>
          <Text style={s.toggleLabel}>Require completion at a specific time</Text>
        </TouchableOpacity>

        {teEnabled && (
          <View style={{ marginTop: 8, gap: 14 }}>
            <View>
              <Text style={s.inputLabel}>Target time</Text>
              <TextInput
                style={s.input}
                value={teAnchor}
                onChangeText={setTeAnchor}
                placeholder="05:00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={s.inputHint}>24h format (HH:mm)</Text>
            </View>

            <View>
              <Text style={s.inputLabel}>Expected duration (optional)</Text>
              <TextInput
                style={s.input}
                value={teDuration}
                onChangeText={setTeDuration}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
              />
              <Text style={s.inputHint}>Minutes</Text>
            </View>

            <View>
              <Text style={s.inputLabel}>Allowed window</Text>
              <View style={s.offsetRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.offsetLabel}>Starts (min)</Text>
                  <TextInput
                    style={[s.input, { textAlign: "center" }]}
                    value={teWinStart}
                    onChangeText={setTeWinStart}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.offsetLabel}>Ends (min)</Text>
                  <TextInput
                    style={[s.input, { textAlign: "center" }]}
                    value={teWinEnd}
                    onChangeText={setTeWinEnd}
                    keyboardType="number-pad"
                    placeholder="60"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>
              {teAnchor && (
                <View style={s.summaryPill}>
                  <Text style={s.summaryText}>
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

            <View>
              <TouchableOpacity
                style={s.toggleRow}
                onPress={() => setTeHardEnabled(!teHardEnabled)}
              >
                <View style={[s.toggleBox, teHardEnabled && s.toggleBoxActive]}>
                  {teHardEnabled && <Check size={14} color="#fff" />}
                </View>
                <Text style={s.toggleLabel}>Hard mode stricter window</Text>
              </TouchableOpacity>

              {teHardEnabled && (
                <>
                  <View style={s.offsetRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.offsetLabel}>Starts (min)</Text>
                      <TextInput
                        style={[s.input, { textAlign: "center" }]}
                        value={teHardStart}
                        onChangeText={setTeHardStart}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.offsetLabel}>Ends (min)</Text>
                      <TextInput
                        style={[s.input, { textAlign: "center" }]}
                        value={teHardEnd}
                        onChangeText={setTeHardEnd}
                        keyboardType="number-pad"
                        placeholder="30"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                    </View>
                  </View>
                  {teAnchor && (
                    <View style={[s.summaryPill, s.hardSummaryPill]}>
                      <Text style={[s.summaryText, s.hardSummaryText]}>
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

            <View>
              <Text style={s.inputLabel}>Timezone</Text>
              <View style={s.modeRow}>
                <TouchableOpacity
                  style={[s.modeBtn, teTzMode === "USER_LOCAL" && s.modeBtnActive]}
                  onPress={() => setTeTzMode("USER_LOCAL")}
                >
                  <Text
                    style={[
                      s.modeBtnText,
                      teTzMode === "USER_LOCAL" && s.modeBtnTextActive,
                    ]}
                  >
                    User local
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.modeBtn,
                    teTzMode === "CHALLENGE_TIMEZONE" && s.modeBtnActive,
                  ]}
                  onPress={() => setTeTzMode("CHALLENGE_TIMEZONE")}
                >
                  <Text
                    style={[
                      s.modeBtnText,
                      teTzMode === "CHALLENGE_TIMEZONE" && s.modeBtnTextActive,
                    ]}
                  >
                    Locked timezone
                  </Text>
                </TouchableOpacity>
              </View>
              {teTzMode === "CHALLENGE_TIMEZONE" && (
                <TextInput
                  style={[s.input, { marginTop: 8 }]}
                  value={teTz}
                  onChangeText={setTeTz}
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

  const renderPreview = () => {
    if (!taskType || !title.trim()) return null;
    const cfg = TASK_TYPE_MAP[taskType];
    const Icon = cfg.icon;
    const meta = getPreviewMeta();

    return (
      <View style={s.section}>
        <Text style={s.sectionLabel}>PREVIEW</Text>
        <View style={s.previewCard}>
          <View style={[s.previewIcon, { backgroundColor: `${cfg.color}12` }]}>
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
                <Clock size={11} color="#0EA5E9" />
                <Text style={[s.previewBadgeText, { color: "#0EA5E9" }]}>
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
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <View style={s.header}>
          <TouchableOpacity
            onPress={onCancel}
            style={s.headerSide}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>
            {editingTask ? "Edit Task" : "New Task"}
          </Text>
          <TouchableOpacity
            style={[s.saveBtn, !canSave() && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                s.saveBtnText,
                !canSave() && s.saveBtnTextDisabled,
              ]}
            >
              {editingTask ? "Save" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.section}>
              <Text style={s.sectionLabel}>TASK NAME</Text>
              <TextInput
                style={s.nameInput}
                placeholder="e.g. Morning run, Journal, Meditate..."
                placeholderTextColor={Colors.text.tertiary}
                value={title}
                onChangeText={setTitle}
                autoFocus={!editingTask}
                returnKeyType="next"
              />
            </View>

            <View style={s.section}>
              <Text style={s.sectionLabel}>TASK TYPE</Text>
              {renderTypeSelector()}
            </View>

            {taskType && (
              <View style={s.section}>
                <Text style={s.sectionLabel}>
                  {TASK_TYPE_MAP[taskType].label.toUpperCase() + " SETTINGS"}
                </Text>
                {renderSettings()}
              </View>
            )}

            {taskType && (
              <View style={s.section}>
                {renderTimeEnforcement()}
              </View>
            )}

            {renderPreview()}

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBED",
  },
  headerSide: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: "500" as const,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center" as const,
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  saveBtnTextDisabled: {
    color: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBEBED",
    fontSize: 17,
    color: Colors.text.primary,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EBEBED",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EBEBED",
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F6F6F8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EBEBED",
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 72,
    paddingTop: 12,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  hintText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  errorText: {
    fontSize: 11,
    color: "#DC2626",
  },
  charRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F6F6F8",
    borderWidth: 1,
    borderColor: "#EBEBED",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F6F6F8",
    borderWidth: 1,
    borderColor: "#EBEBED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  toggleBoxActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F6F6F8",
    borderWidth: 1,
    borderColor: "#EBEBED",
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  modeBtnTextActive: {
    color: Colors.accent,
    fontWeight: "600" as const,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#EBEBED",
  },
  presetCardActive: {
    borderColor: "#6366F1",
    backgroundColor: "#6366F10A",
  },
  presetNum: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  presetNumActive: {
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
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  offsetRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  offsetLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    marginBottom: 4,
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
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EBEBED",
    flexDirection: "row",
    gap: 14,
  },
  previewIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewContent: {
    flex: 1,
    gap: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  previewMeta: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  previewPromptText: {
    fontSize: 12,
    color: "#6366F1",
    fontStyle: "italic" as const,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
});

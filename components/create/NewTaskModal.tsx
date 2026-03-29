import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS, GRIIT_COLORS } from "@/lib/design-system";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import type { JournalCategory, ScheduleType } from "@/types";

type WizardTaskType =
  | "journal"
  | "timer"
  | "photo"
  | "run"
  | "simple"
  | "checkin"
  | "water"
  | "reading"
  | "workout"
  | "counter";

const MORE_TASK_TYPES: WizardTaskType[] = ["water", "journal", "reading", "photo", "checkin", "counter"];

function NewTaskTypeCard({
  icon,
  name,
  subtitle,
  selected,
  onPress,
  style,
}: {
  icon: string;
  name: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  style?: object;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={`Task type ${name}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: selected ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
          borderWidth: 1.5,
          borderColor: selected ? DS_COLORS.PRIMARY : DS_COLORS.BORDER_LIGHT,
          borderRadius: 14,
          padding: 14,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: selected ? DS_COLORS.FEED_CTA_ICON_BG : DS_COLORS.WARM_CREAM,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY }}>{name}</Text>
        <Text style={{ fontSize: 12, color: DS_COLORS.TEXT_HINT, marginTop: 1 }}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function newId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parsePositiveInt(raw: string, fallback: number): number {
  const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parsePositiveFloat(raw: string, fallback: number): number {
  const n = parseFloat(raw.replace(/,/g, "."));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type WorkoutTypeUI = "general" | "cardio" | "strength" | "hiit" | "yoga";

type BuildOpts = {
  timerMins: number;
  waterGlasses: number;
  readingPages: number;
  counterTarget: number;
  counterUnit: string;
  runTracking: "distance" | "time";
  runTarget: number;
  runUnitDist: "miles" | "km";
  workoutMins: number;
  requirePhotoTimer: boolean;
  hardModeTimer: boolean;
  requirePhotoCounter: boolean;
  timedReading: boolean;
  readingSessionMins: number;
  gpsRun: boolean;
  requirePhotoRun: boolean;
  requirePhotoWorkout: boolean;
  requireLocationWorkout: boolean;
  locationNameWorkout: string;
  minWordsJournal: number;
  journalPromptText: string;
  captureMoodJournal: boolean;
  locationStampPhoto: boolean;
  requireHeartRate: boolean;
  heartRateThreshold: number;
  workoutType: WorkoutTypeUI;
  timedWorkout: boolean;
};

function buildTask(name: string, t: WizardTaskType, hardPhotoGlobal: boolean, opts: BuildOpts): TaskEditorTask | null {
  const title = name.trim();
  if (!title) return null;
  const reqPhoto = (extra: boolean) => hardPhotoGlobal || extra;
  switch (t) {
    case "journal": {
      const minW = opts.minWordsJournal > 0 ? opts.minWordsJournal : 20;
      return {
        id: newId(),
        title,
        type: "journal",
        required: true,
        journalType: ["self_reflection"] as JournalCategory[],
        journalPrompt: opts.journalPromptText.trim() || "Write at least 20 characters reflecting on your day.",
        minWords: minW,
        requirePhotoProof: reqPhoto(false),
        captureMood: opts.captureMoodJournal,
      };
    }
    case "timer":
      return {
        id: newId(),
        title,
        type: "timer",
        required: true,
        durationMinutes: opts.timerMins,
        mustCompleteInSession: true,
        requirePhotoProof: reqPhoto(opts.requirePhotoTimer),
        strictTimerMode: opts.hardModeTimer,
      };
    case "photo":
      return {
        id: newId(),
        title,
        type: "photo",
        required: true,
        requirePhotoProof: true,
        photoRequired: true,
        verificationMethod: opts.locationStampPhoto ? "location_stamp" : undefined,
      };
    case "run":
      if (opts.runTracking === "distance") {
        return {
          id: newId(),
          title,
          type: "run",
          required: true,
          trackingMode: "distance",
          targetValue: opts.runTarget,
          unit: opts.runUnitDist,
          requirePhotoProof: reqPhoto(opts.requirePhotoRun),
          verificationMethod: opts.gpsRun ? "gps" : undefined,
        };
      }
      return {
        id: newId(),
        title,
        type: "run",
        required: true,
        trackingMode: "time",
        targetValue: opts.runTarget,
        unit: "minutes",
        requirePhotoProof: reqPhoto(opts.requirePhotoRun),
        verificationMethod: opts.gpsRun ? "gps" : undefined,
      };
    case "simple":
      return {
        id: newId(),
        title,
        type: "simple",
        required: true,
        requirePhotoProof: reqPhoto(false),
      };
    case "checkin":
      return {
        id: newId(),
        title,
        type: "checkin",
        required: true,
        locationName: "Home base",
        radiusMeters: 150,
        requirePhotoProof: reqPhoto(false),
      };
    case "water":
      return {
        id: newId(),
        title,
        type: "water",
        required: true,
        targetValue: opts.waterGlasses,
        unit: "glasses",
        requirePhotoProof: reqPhoto(false),
      };
    case "reading":
      return {
        id: newId(),
        title,
        type: "reading",
        required: true,
        targetValue: opts.readingPages,
        unit: "pages",
        requirePhotoProof: reqPhoto(false),
        durationMinutes: opts.timedReading ? opts.readingSessionMins : undefined,
      };
    case "workout":
      return {
        id: newId(),
        title,
        type: "workout",
        required: true,
        durationMinutes: opts.workoutMins,
        trackingMode: "time",
        targetValue: opts.workoutMins,
        unit: "minutes",
        mustCompleteInSession: opts.timedWorkout,
        strictTimerMode: opts.timedWorkout,
        requirePhotoProof: reqPhoto(opts.requirePhotoWorkout),
        locationName: opts.requireLocationWorkout ? (opts.locationNameWorkout.trim() || "Workout location") : undefined,
        radiusMeters: opts.requireLocationWorkout ? 150 : undefined,
        verificationMethod: opts.requireHeartRate ? "heart_rate" : opts.timedWorkout ? "timer" : "manual",
        verificationRuleJson: opts.requireHeartRate
          ? { min_avg_bpm: opts.heartRateThreshold, workout_type: opts.workoutType }
          : opts.workoutType !== "general"
            ? { workout_type: opts.workoutType }
            : null,
      };
    case "counter":
      return {
        id: newId(),
        title,
        type: "counter",
        required: true,
        targetValue: opts.counterTarget,
        unit: (opts.counterUnit.trim() || "reps") as TaskEditorTask["unit"],
        requirePhotoProof: reqPhoto(opts.requirePhotoCounter),
      };
    default:
      return null;
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (task: TaskEditorTask & { wizardType?: string }) => void;
  hardModeGlobal?: boolean;
};

export default function NewTaskModal({ visible, onClose, onAdd, hardModeGlobal }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<WizardTaskType>("simple");
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [timerMins, setTimerMins] = useState("30");
  const [waterGlasses, setWaterGlasses] = useState("8");
  const [readingPages, setReadingPages] = useState("10");
  const [counterTarget, setCounterTarget] = useState("100");
  const [counterUnit, setCounterUnit] = useState("reps");
  const [runTracking, setRunTracking] = useState<"distance" | "time">("distance");
  const [runTarget, setRunTarget] = useState("3");
  const [runUnitDist, setRunUnitDist] = useState<"miles" | "km">("miles");
  const [workoutMins, setWorkoutMins] = useState("45");
  const [requirePhotoTimer, setRequirePhotoTimer] = useState(false);
  const [hardModeTimer, setHardModeTimer] = useState(false);
  const [requirePhotoCounter, setRequirePhotoCounter] = useState(false);
  const [timedReading, setTimedReading] = useState(false);
  const [readingSessionMins, setReadingSessionMins] = useState("30");
  const [gpsRun, setGpsRun] = useState(false);
  const [requirePhotoRun, setRequirePhotoRun] = useState(false);
  const [requirePhotoWorkout, setRequirePhotoWorkout] = useState(false);
  const [requireLocationWorkout, setRequireLocationWorkout] = useState(false);
  const [locationNameWorkout, setLocationNameWorkout] = useState("");
  const [requireHeartRate, setRequireHeartRate] = useState(false);
  const [heartRateThreshold, setHeartRateThreshold] = useState("120");
  const [workoutType, setWorkoutType] = useState<WorkoutTypeUI>("general");
  const [timedWorkout, setTimedWorkout] = useState(true);
  const [minWordsJournal, setMinWordsJournal] = useState("");
  const [journalPromptText, setJournalPromptText] = useState("");
  const [captureMoodJournal, setCaptureMoodJournal] = useState(false);
  const [locationStampPhoto, setLocationStampPhoto] = useState(false);
  const [timeEnforcementEnabled, setTimeEnforcementEnabled] = useState(false);
  const [anchorTime, setAnchorTime] = useState("06:00");
  const [windowMinutes, setWindowMinutes] = useState("60");

  useEffect(() => {
    if (!visible) {
      setName("");
      setKind("simple");
      setShowMoreTypes(false);
      setTimerMins("30");
      setWaterGlasses("8");
      setReadingPages("10");
      setCounterTarget("100");
      setCounterUnit("reps");
      setRunTracking("distance");
      setRunTarget("3");
      setRunUnitDist("miles");
      setWorkoutMins("45");
      setRequirePhotoTimer(false);
      setHardModeTimer(false);
      setRequirePhotoCounter(false);
      setTimedReading(false);
      setReadingSessionMins("30");
      setGpsRun(false);
      setRequirePhotoRun(false);
      setRequirePhotoWorkout(false);
      setRequireLocationWorkout(false);
      setLocationNameWorkout("");
      setRequireHeartRate(false);
      setHeartRateThreshold("120");
      setWorkoutType("general");
      setTimedWorkout(true);
      setMinWordsJournal("");
      setJournalPromptText("");
      setCaptureMoodJournal(false);
      setLocationStampPhoto(false);
      setTimeEnforcementEnabled(false);
      setAnchorTime("06:00");
      setWindowMinutes("60");
    }
  }, [visible]);

  useEffect(() => {
    setRequirePhotoTimer(false);
    setHardModeTimer(false);
    setRequirePhotoCounter(false);
    setTimedReading(false);
    setGpsRun(false);
    setRequirePhotoRun(false);
    setRequirePhotoWorkout(false);
    setRequireLocationWorkout(false);
    setLocationNameWorkout("");
    setRequireHeartRate(false);
    setHeartRateThreshold("120");
    setWorkoutType("general");
    setTimedWorkout(true);
    setCaptureMoodJournal(false);
    setLocationStampPhoto(false);
  }, [kind]);

  const buildOpts = useCallback((): BuildOpts => {
    const runT =
      runTracking === "distance" ? parsePositiveFloat(runTarget, 3) : parsePositiveInt(runTarget, 30);
    return {
      timerMins: parsePositiveInt(timerMins, 30),
      waterGlasses: parsePositiveInt(waterGlasses, 8),
      readingPages: parsePositiveInt(readingPages, 10),
      counterTarget: parsePositiveInt(counterTarget, 100),
      counterUnit,
      runTracking,
      runTarget: runT,
      runUnitDist,
      workoutMins: parsePositiveInt(workoutMins, 45),
      requirePhotoTimer,
      hardModeTimer,
      requirePhotoCounter,
      timedReading,
      readingSessionMins: parsePositiveInt(readingSessionMins, 30),
      gpsRun,
      requirePhotoRun,
      requirePhotoWorkout,
      requireLocationWorkout,
      locationNameWorkout,
      minWordsJournal: parsePositiveInt(minWordsJournal, 0),
      journalPromptText,
      captureMoodJournal,
      locationStampPhoto,
      requireHeartRate,
      heartRateThreshold: parsePositiveInt(heartRateThreshold, 120),
      workoutType,
      timedWorkout,
    };
  }, [
    timerMins,
    waterGlasses,
    readingPages,
    counterTarget,
    counterUnit,
    runTracking,
    runTarget,
    runUnitDist,
    workoutMins,
    requirePhotoTimer,
    hardModeTimer,
    requirePhotoCounter,
    timedReading,
    readingSessionMins,
    gpsRun,
    requirePhotoRun,
    requirePhotoWorkout,
    requireLocationWorkout,
    locationNameWorkout,
    minWordsJournal,
    journalPromptText,
    captureMoodJournal,
    locationStampPhoto,
    requireHeartRate,
    heartRateThreshold,
    workoutType,
    timedWorkout,
  ]);

  const canAdd = useMemo(() => {
    if (!name.trim()) return false;
    switch (kind) {
      case "timer":
        return parsePositiveInt(timerMins, 0) > 0;
      case "water":
        return parsePositiveInt(waterGlasses, 0) > 0;
      case "reading":
        if (parsePositiveInt(readingPages, 0) <= 0) return false;
        if (timedReading && parsePositiveInt(readingSessionMins, 0) <= 0) return false;
        return true;
      case "counter":
        return parsePositiveInt(counterTarget, 0) > 0;
      case "run":
        if (runTracking === "distance") {
          return parsePositiveFloat(runTarget, 0) > 0;
        }
        return parsePositiveInt(runTarget, 0) > 0;
      case "workout":
        if (parsePositiveInt(workoutMins, 0) <= 0) return false;
        if (requireLocationWorkout && !locationNameWorkout.trim()) return false;
        return true;
      default:
        return true;
    }
  }, [
    name,
    kind,
    timerMins,
    waterGlasses,
    readingPages,
    counterTarget,
    runTracking,
    runTarget,
    workoutMins,
    timedReading,
    readingSessionMins,
    requireLocationWorkout,
    locationNameWorkout,
  ]);

  const handleAdd = useCallback(() => {
    const opts = buildOpts();
    const task = buildTask(name, kind, !!hardModeGlobal, opts);
    if (!task) return;
    const teEnabled = kind !== "simple" && timeEnforcementEnabled;
    const windowEnd = teEnabled ? parseInt(windowMinutes, 10) || 60 : null;
    const anchor = anchorTime.trim() || "06:00";
    onAdd({
      ...task,
      wizardType: kind,
      timeEnforcementEnabled: teEnabled,
      scheduleType: (teEnabled ? "DAILY" : "NONE") as ScheduleType,
      anchorTimeLocal: teEnabled ? anchor : null,
      windowStartOffsetMin: teEnabled ? 0 : null,
      windowEndOffsetMin: teEnabled ? windowEnd : null,
    } as TaskEditorTask);
    onClose();
  }, [name, kind, hardModeGlobal, buildOpts, onAdd, onClose, timeEnforcementEnabled, anchorTime, windowMinutes]);

  const configBlock = (() => {
    const row = (label: string, value: boolean, onValue: (v: boolean) => void, a11y: string) => (
      <View style={s.toggleRow}>
        <Text style={s.toggleLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValue}
          accessibilityRole="switch"
          accessibilityLabel={a11y}
        />
      </View>
    );
    switch (kind) {
      case "journal":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Minimum word count</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 50 (optional)"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={minWordsJournal}
              onChangeText={setMinWordsJournal}
              accessibilityLabel="Minimum word count for journal"
            />
            <Text style={[s.label, s.labelSp]}>Prompt (optional)</Text>
            <TextInput
              style={[s.input, s.inputTall]}
              placeholder="e.g. What are you grateful for today?"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              value={journalPromptText}
              onChangeText={setJournalPromptText}
              multiline
              accessibilityLabel="Journal prompt"
            />
            {row("Capture mood", captureMoodJournal, setCaptureMoodJournal, "Toggle capture mood for journal")}
          </View>
        );
      case "timer":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Duration (minutes)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 30"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={timerMins}
              onChangeText={setTimerMins}
              accessibilityLabel="Timer duration in minutes"
            />
            {row("Require photo proof", requirePhotoTimer, setRequirePhotoTimer, "Toggle require photo proof for timer")}
            {row("Hard mode (stay on screen)", hardModeTimer, setHardModeTimer, "Toggle hard mode timer, stay on screen")}
          </View>
        );
      case "water":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Daily target (glasses)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 8"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={waterGlasses}
              onChangeText={setWaterGlasses}
              accessibilityLabel="Water target in glasses"
            />
          </View>
        );
      case "reading":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Target pages</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 10"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={readingPages}
              onChangeText={setReadingPages}
              accessibilityLabel="Reading target pages"
            />
            {row("Timed reading session", timedReading, setTimedReading, "Toggle timed reading session")}
            {timedReading ? (
              <>
                <Text style={[s.label, s.labelSp]}>Session length (minutes)</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 30"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  keyboardType="number-pad"
                  value={readingSessionMins}
                  onChangeText={setReadingSessionMins}
                  accessibilityLabel="Reading session length in minutes"
                />
              </>
            ) : null}
          </View>
        );
      case "counter":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Target count</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 100"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={counterTarget}
              onChangeText={setCounterTarget}
              accessibilityLabel="Target count"
            />
            <Text style={[s.label, s.labelSp]}>Unit</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. pushups, glasses"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              value={counterUnit}
              onChangeText={setCounterUnit}
              accessibilityLabel="Unit of measurement"
            />
            {row("Require photo proof", requirePhotoCounter, setRequirePhotoCounter, "Toggle require photo proof for counter")}
          </View>
        );
      case "photo":
        return (
          <View style={s.configBlock}>
            <View style={s.infoRow}>
              <Camera size={16} color={DS_COLORS.TEXT_SECONDARY} />
              <Text style={s.infoText}>Photo proof is always required for this type</Text>
            </View>
            {row("Add location stamp", locationStampPhoto, setLocationStampPhoto, "Toggle location stamp on photo proof")}
          </View>
        );
      case "run":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Track by</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setRunTracking("distance")}
                accessibilityRole="button"
                accessibilityLabel="Track run by distance"
                accessibilityState={{ selected: runTracking === "distance" }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 1.5,
                  borderColor: runTracking === "distance" ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                  backgroundColor: runTracking === "distance" ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: runTracking === "distance" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                  }}
                >
                  Distance
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRunTracking("time")}
                accessibilityRole="button"
                accessibilityLabel="Track run by duration"
                accessibilityState={{ selected: runTracking === "time" }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 1.5,
                  borderColor: runTracking === "time" ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                  backgroundColor: runTracking === "time" ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: runTracking === "time" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                  }}
                >
                  Time
                </Text>
              </TouchableOpacity>
            </View>
            {runTracking === "distance" ? (
              <>
                <Text style={[s.label, s.labelSp]}>Target distance</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 3"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  keyboardType="decimal-pad"
                  value={runTarget}
                  onChangeText={setRunTarget}
                  accessibilityLabel="Target distance"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setRunUnitDist("miles")}
                    accessibilityRole="button"
                    accessibilityLabel="Use miles for run distance"
                    accessibilityState={{ selected: runUnitDist === "miles" }}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: runUnitDist === "miles" ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                      backgroundColor: runUnitDist === "miles" ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: runUnitDist === "miles" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                      }}
                    >
                      Miles
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRunUnitDist("km")}
                    accessibilityRole="button"
                    accessibilityLabel="Use kilometers for run distance"
                    accessibilityState={{ selected: runUnitDist === "km" }}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: runUnitDist === "km" ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                      backgroundColor: runUnitDist === "km" ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: runUnitDist === "km" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                      }}
                    >
                      Km
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[s.label, s.labelSp]}>Duration (minutes)</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 30"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  keyboardType="number-pad"
                  value={runTarget}
                  onChangeText={setRunTarget}
                  accessibilityLabel="Run duration in minutes"
                />
              </>
            )}
            {row("GPS tracking", gpsRun, setGpsRun, "Toggle GPS tracking for run")}
            {row("Require photo proof", requirePhotoRun, setRequirePhotoRun, "Toggle require photo proof for run")}
          </View>
        );
      case "workout": {
        const workoutPill = (label: string, key: WorkoutTypeUI) => {
          const selected = workoutType === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setWorkoutType(key)}
              accessibilityRole="button"
              accessibilityLabel={`Workout type ${label}`}
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 22,
                borderWidth: 1.5,
                borderColor: selected ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                backgroundColor: selected ? DS_COLORS.ACCENT_TINT : DS_COLORS.CARD_BG,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: selected ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        };
        return (
          <View style={s.configBlock}>
            <Text style={{ fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 10 }}>
              Workout type
            </Text>
            <View style={{ flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {workoutPill("General", "general")}
                {workoutPill("Cardio", "cardio")}
                {workoutPill("Strength", "strength")}
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {workoutPill("HIIT", "hiit")}
                {workoutPill("Yoga", "yoga")}
                <View style={{ flex: 1 }} />
              </View>
            </View>

            <Text style={[s.label, s.labelSp]}>Minimum duration (minutes)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 45"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={workoutMins}
              onChangeText={setWorkoutMins}
              accessibilityLabel="Workout duration in minutes"
            />

            {row("Timer must run full duration", timedWorkout, setTimedWorkout, "Toggle require full-duration on-screen timer")}
            {timedWorkout ? (
              <Text style={s.hint}>User must keep the timer running on-screen for the full duration to complete this task.</Text>
            ) : null}

            {row("Require elevated heart rate", requireHeartRate, setRequireHeartRate, "Toggle heart rate verification for workout")}
            {requireHeartRate ? (
              <>
                <Text style={[s.label, { marginTop: 8 }]}>Minimum average BPM</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 120"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  keyboardType="number-pad"
                  value={heartRateThreshold}
                  onChangeText={setHeartRateThreshold}
                  accessibilityLabel="Minimum average heart rate"
                />
                <Text style={s.hint}>
                  {workoutType === "cardio" || workoutType === "hiit"
                    ? "Recommended: 130-160 BPM for cardio/HIIT"
                    : workoutType === "strength"
                      ? "Recommended: 100-130 BPM for strength training"
                      : workoutType === "yoga"
                        ? "Recommended: 80-110 BPM for yoga"
                        : "Recommended: 110-140 BPM for general workouts"}
                </Text>
              </>
            ) : null}

            {row("Require photo proof", requirePhotoWorkout, setRequirePhotoWorkout, "Toggle require photo proof for workout")}
            {row("Location check-in", requireLocationWorkout, setRequireLocationWorkout, "Toggle location check-in for workout")}
            {requireLocationWorkout ? (
              <>
                <Text style={[s.label, s.labelSp]}>Location name</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. Planet Fitness"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  value={locationNameWorkout}
                  onChangeText={setLocationNameWorkout}
                  accessibilityLabel="Workout location name"
                />
              </>
            ) : null}
          </View>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close new task without saving"
          >
            <Text style={s.headerLink}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>New task</Text>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={!canAdd}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Add task to challenge"
            accessibilityState={{ disabled: !canAdd }}
          >
            <Text style={[s.headerLink, !canAdd && s.headerLinkDisabled]}>Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.body, { flexGrow: 1, paddingBottom: DS_SPACING.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.label}>Task name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Morning run, Cold shower, Read..."
            placeholderTextColor={DS_COLORS.TEXT_MUTED}
            value={name}
            onChangeText={setName}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: DS_COLORS.TEXT_PRIMARY,
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            What type of task?
          </Text>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <NewTaskTypeCard
                icon="💪"
                name="Workout"
                subtitle="Gym, strength, cardio"
                selected={kind === "workout"}
                onPress={() => setKind("workout")}
                style={{ flex: 1 }}
              />
              <NewTaskTypeCard
                icon="🏃"
                name="Run"
                subtitle="Distance or time"
                selected={kind === "run"}
                onPress={() => setKind("run")}
                style={{ flex: 1 }}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <NewTaskTypeCard
                icon="⏱️"
                name="Timer"
                subtitle="Meditation, focus"
                selected={kind === "timer"}
                onPress={() => setKind("timer")}
                style={{ flex: 1 }}
              />
              <NewTaskTypeCard
                icon="✓"
                name="Simple"
                subtitle="Just check it off"
                selected={kind === "simple"}
                onPress={() => setKind("simple")}
                style={{ flex: 1 }}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowMoreTypes(!showMoreTypes)}
            accessibilityLabel={showMoreTypes ? "Show fewer task types" : "Show more task types"}
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 14,
            }}
          >
            <Ionicons
              name={showMoreTypes ? "chevron-up" : "chevron-down"}
              size={16}
              color={DS_COLORS.TEXT_SECONDARY}
            />
            <Text style={{ fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY }}>
              {showMoreTypes ? "Show less" : "6 more types"}
            </Text>
          </TouchableOpacity>
          {(showMoreTypes || MORE_TASK_TYPES.includes(kind)) && (
            <View
              style={{
                flexDirection: "column",
                gap: 8,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: DS_COLORS.BORDER,
                borderStyle: "dashed",
              }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                <NewTaskTypeCard
                  icon="💧"
                  name="Water"
                  subtitle="Track glasses"
                  selected={kind === "water"}
                  onPress={() => setKind("water")}
                  style={{ flex: 1 }}
                />
                <NewTaskTypeCard
                  icon="📓"
                  name="Journal"
                  subtitle="Write, reflect"
                  selected={kind === "journal"}
                  onPress={() => setKind("journal")}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <NewTaskTypeCard
                  icon="📖"
                  name="Reading"
                  subtitle="Pages or time"
                  selected={kind === "reading"}
                  onPress={() => setKind("reading")}
                  style={{ flex: 1 }}
                />
                <NewTaskTypeCard
                  icon="📷"
                  name="Photo"
                  subtitle="Proof required"
                  selected={kind === "photo"}
                  onPress={() => setKind("photo")}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <NewTaskTypeCard
                  icon="📍"
                  name="Check-in"
                  subtitle="Location stamp"
                  selected={kind === "checkin"}
                  onPress={() => setKind("checkin")}
                  style={{ flex: 1 }}
                />
                <NewTaskTypeCard
                  icon="#️⃣"
                  name="Counter"
                  subtitle="Reps, sets, count"
                  selected={kind === "counter"}
                  onPress={() => setKind("counter")}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}
          {configBlock}
          {kind !== "simple" && (
            <View style={s.timeSection}>
              <View style={[s.toggleRow, s.timeToggleRow]}>
                <Text style={s.toggleLabel}>Set a time window</Text>
                <Switch
                  value={timeEnforcementEnabled}
                  onValueChange={setTimeEnforcementEnabled}
                  accessibilityRole="switch"
                  accessibilityLabel="Toggle daily time window for this task"
                  trackColor={{ false: DS_COLORS.BORDER, true: GRIIT_COLORS.primary }}
                />
              </View>
              {timeEnforcementEnabled && (
                <View style={s.timeFields}>
                  <Text style={s.hint}>Task must be started within this window</Text>
                  <View style={s.timeRow}>
                    <View style={s.timeField}>
                      <Text style={s.sublabel}>Start time</Text>
                      <TextInput
                        style={s.input}
                        value={anchorTime}
                        onChangeText={setAnchorTime}
                        placeholder="06:00"
                        placeholderTextColor={DS_COLORS.TEXT_MUTED}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={s.timeField}>
                      <Text style={s.sublabel}>Window (minutes)</Text>
                      <TextInput
                        style={s.input}
                        value={windowMinutes}
                        onChangeText={setWindowMinutes}
                        placeholder="60"
                        placeholderTextColor={DS_COLORS.TEXT_MUTED}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                  <Text style={s.hint}>
                    e.g. 6:00 AM with 60 min window means task must start between 6:00–7:00 AM
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[s.cta, !canAdd && s.ctaDisabled]}
            disabled={!canAdd}
            onPress={handleAdd}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Add task to challenge"
            accessibilityState={{ disabled: !canAdd }}
          >
            <Text style={s.ctaText}>Add task</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_COLORS.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    paddingBottom: DS_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  headerLink: { fontSize: 14, fontWeight: "600", color: GRIIT_COLORS.primary },
  headerLinkDisabled: { opacity: 0.4 },
  headerTitle: { fontSize: 16, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  body: { padding: DS_SPACING.lg },
  label: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY, marginBottom: 8 },
  labelSp: { marginTop: DS_SPACING.md },
  input: {
    backgroundColor: DS_COLORS.WHITE,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  configBlock: {
    marginTop: DS_SPACING.lg,
    gap: DS_SPACING.sm,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 16,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.chipFill,
  },
  toggleLabel: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_PRIMARY,
    flex: 1,
    paddingRight: DS_SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  infoText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  inputTall: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: DS_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.background,
    paddingTop: 12,
  },
  cta: {
    backgroundColor: DS_COLORS.PRIMARY,
    height: 48,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
  timeSection: { marginTop: DS_SPACING.lg },
  timeToggleRow: { marginBottom: 8 },
  timeFields: { marginTop: 8 },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1 },
  sublabel: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 4 },
  hint: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 4, marginBottom: 8 },
});

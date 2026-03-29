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
import {
  BookOpen,
  Timer,
  Camera,
  Footprints,
  CheckCircle,
  MapPin,
  Droplets,
  BookOpenText,
  Dumbbell,
  Hash,
} from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS, GRIIT_COLORS } from "@/lib/design-system";
import { CREATE_SELECTION } from "@/lib/create-selection";
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

const TYPE_CATEGORIES = [
  {
    title: "Physical",
    types: [
      { id: "workout" as const, label: "Workout", Icon: Dumbbell, hint: "Gym, calisthenics, yoga" },
      { id: "run" as const, label: "Run", Icon: Footprints, hint: "Track distance or time" },
      { id: "timer" as const, label: "Timer", Icon: Timer, hint: "Timed activity" },
      { id: "water" as const, label: "Water", Icon: Droplets, hint: "Daily hydration" },
    ],
  },
  {
    title: "Mental",
    types: [
      { id: "journal" as const, label: "Journal", Icon: BookOpen, hint: "Write & reflect" },
      { id: "reading" as const, label: "Reading", Icon: BookOpenText, hint: "Track pages" },
    ],
  },
  {
    title: "Verification",
    types: [
      { id: "photo" as const, label: "Photo", Icon: Camera, hint: "Photo proof required" },
      { id: "checkin" as const, label: "Check-in", Icon: MapPin, hint: "Location verified" },
      { id: "counter" as const, label: "Counter", Icon: Hash, hint: "Count anything" },
      { id: "simple" as const, label: "Simple", Icon: CheckCircle, hint: "Honor-based tap" },
    ],
  },
] as const;

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
            <View style={s.segRow}>
              <TouchableOpacity
                style={[s.seg, s.segFlex, runTracking === "distance" && s.segOn]}
                onPress={() => setRunTracking("distance")}
                accessibilityRole="button"
                accessibilityLabel="Track run by distance"
                accessibilityState={{ selected: runTracking === "distance" }}
              >
                <Text style={[s.segTxt, runTracking === "distance" && s.segTxtOn]}>Distance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.seg, s.segFlex, runTracking === "time" && s.segOn]}
                onPress={() => setRunTracking("time")}
                accessibilityRole="button"
                accessibilityLabel="Track run by duration"
                accessibilityState={{ selected: runTracking === "time" }}
              >
                <Text style={[s.segTxt, runTracking === "time" && s.segTxtOn]}>Time</Text>
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
                <View style={s.segRow}>
                  <TouchableOpacity
                    style={[s.seg, s.segFlex, runUnitDist === "miles" && s.segOn]}
                    onPress={() => setRunUnitDist("miles")}
                    accessibilityRole="button"
                    accessibilityLabel="Use miles for run distance"
                    accessibilityState={{ selected: runUnitDist === "miles" }}
                  >
                    <Text style={[s.segTxt, runUnitDist === "miles" && s.segTxtOn]}>Miles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.seg, s.segFlex, runUnitDist === "km" && s.segOn]}
                    onPress={() => setRunUnitDist("km")}
                    accessibilityRole="button"
                    accessibilityLabel="Use kilometers for run distance"
                    accessibilityState={{ selected: runUnitDist === "km" }}
                  >
                    <Text style={[s.segTxt, runUnitDist === "km" && s.segTxtOn]}>Km</Text>
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
      case "workout":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Workout type</Text>
            <View style={s.segCol}>
              <View style={s.segRow}>
                {(["general", "cardio", "strength"] as const).map((wt) => (
                  <TouchableOpacity
                    key={wt}
                    style={[s.seg, s.segFlex, workoutType === wt && s.segOn]}
                    onPress={() => setWorkoutType(wt)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: workoutType === wt }}
                    accessibilityLabel={
                      wt === "general" ? "Select general workout type" : `Select ${wt} workout type`
                    }
                  >
                    <Text style={[s.segTxt, workoutType === wt && s.segTxtOn]}>
                      {wt.charAt(0).toUpperCase() + wt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.segRow}>
                {(["hiit", "yoga"] as const).map((wt) => (
                  <TouchableOpacity
                    key={wt}
                    style={[s.seg, s.segFlex, workoutType === wt && s.segOn]}
                    onPress={() => setWorkoutType(wt)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: workoutType === wt }}
                    accessibilityLabel={
                      wt === "hiit" ? "Select HIIT workout type" : "Select yoga workout type"
                    }
                  >
                    <Text style={[s.segTxt, workoutType === wt && s.segTxtOn]}>
                      {wt === "hiit" ? "HIIT" : "Yoga"}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={s.segFlex} />
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
          <Text style={[s.label, { marginTop: DS_SPACING.lg }]}>Task type</Text>
          {TYPE_CATEGORIES.map((cat) => (
            <View key={cat.title} style={s.typeCategorySection}>
              <Text style={s.typeCategoryTitle}>{cat.title}</Text>
              <View style={s.typeCategoryCol}>
                {Array.from({ length: Math.ceil(cat.types.length / 3) }, (_, rowIdx) => {
                  const row = cat.types.slice(rowIdx * 3, rowIdx * 3 + 3);
                  return (
                    <View key={row.map((t) => t.id).join("-")} style={s.typeCategoryChunkRow}>
                      {row.map((t) => {
                        const sel = kind === t.id;
                        const Icon = t.Icon;
                        return (
                          <TouchableOpacity
                            key={t.id}
                            style={[s.typeChip, s.typeChipFlex, sel && s.typeChipSel]}
                            onPress={() => setKind(t.id)}
                            activeOpacity={0.8}
                            accessibilityLabel={`Select ${t.label} task type, ${t.hint}`}
                            accessibilityRole="button"
                            accessibilityState={{ selected: sel }}
                          >
                            <Icon size={18} color={sel ? GRIIT_COLORS.primary : DS_COLORS.TEXT_SECONDARY} />
                            <Text style={[s.typeChipLabel, sel && s.typeChipLabelSel]}>{t.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                      {row.length < 3
                        ? Array.from({ length: 3 - row.length }, (_, i) => <View key={`sp-${i}`} style={s.typeChipFlex} />)
                        : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
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
  typeCategorySection: {
    marginTop: 12,
  },
  typeCategoryTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: DS_COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  typeCategoryCol: {
    flexDirection: "column",
    gap: 8,
  },
  typeCategoryChunkRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: DS_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  typeChipFlex: {
    flex: 1,
    minWidth: 0,
  },
  typeChipSel: {
    borderColor: GRIIT_COLORS.primary,
    backgroundColor: CREATE_SELECTION.background,
  },
  typeChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  typeChipLabelSel: {
    color: GRIIT_COLORS.primary,
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
  segCol: {
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  segRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 0,
  },
  seg: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: DS_COLORS.surface,
    alignItems: "center",
  },
  segFlex: {
    flex: 1,
    minWidth: 0,
  },
  segOn: {
    borderColor: CREATE_SELECTION.border,
    backgroundColor: CREATE_SELECTION.background,
  },
  segTxt: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },
  segTxtOn: { color: CREATE_SELECTION.text },
  footer: {
    paddingHorizontal: DS_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.background,
    paddingTop: 12,
  },
  cta: {
    backgroundColor: GRIIT_COLORS.primary,
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

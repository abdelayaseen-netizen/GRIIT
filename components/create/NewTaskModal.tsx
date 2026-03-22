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

const TYPE_GRID: { id: WizardTaskType; label: string; Icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { id: "journal", label: "Journal", Icon: BookOpen },
  { id: "timer", label: "Timer", Icon: Timer },
  { id: "photo", label: "Photo", Icon: Camera },
  { id: "run", label: "Run", Icon: Footprints },
  { id: "simple", label: "Simple", Icon: CheckCircle },
  { id: "checkin", label: "Check-in", Icon: MapPin },
  { id: "water", label: "Water", Icon: Droplets },
  { id: "reading", label: "Reading", Icon: BookOpenText },
  { id: "workout", label: "Workout", Icon: Dumbbell },
  { id: "counter", label: "Counter", Icon: Hash },
];

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
        requirePhotoProof: reqPhoto(opts.requirePhotoWorkout),
        locationName: opts.requireLocationWorkout ? (opts.locationNameWorkout.trim() || "Workout location") : undefined,
        radiusMeters: opts.requireLocationWorkout ? 150 : undefined,
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
        <Switch value={value} onValueChange={onValue} accessibilityLabel={a11y} />
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
            {row("Capture mood", captureMoodJournal, setCaptureMoodJournal, "Capture mood toggle")}
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
            {row("Require photo proof", requirePhotoTimer, setRequirePhotoTimer, "Require photo proof")}
            {row("Hard mode (stay on screen)", hardModeTimer, setHardModeTimer, "Hard mode timer")}
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
            {row("Timed reading session", timedReading, setTimedReading, "Timed reading session")}
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
            {row("Require photo proof", requirePhotoCounter, setRequirePhotoCounter, "Require photo proof for counter")}
          </View>
        );
      case "photo":
        return (
          <View style={s.configBlock}>
            <View style={s.infoRow}>
              <Camera size={16} color={DS_COLORS.TEXT_SECONDARY} />
              <Text style={s.infoText}>Photo proof is always required for this type</Text>
            </View>
            {row("Add location stamp", locationStampPhoto, setLocationStampPhoto, "Add location stamp to photo")}
          </View>
        );
      case "run":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Track by</Text>
            <View style={s.segRow}>
              <TouchableOpacity
                style={[s.seg, runTracking === "distance" && s.segOn]}
                onPress={() => setRunTracking("distance")}
                accessibilityRole="button"
                accessibilityLabel="Track by distance"
              >
                <Text style={[s.segTxt, runTracking === "distance" && s.segTxtOn]}>Distance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.seg, runTracking === "time" && s.segOn]}
                onPress={() => setRunTracking("time")}
                accessibilityRole="button"
                accessibilityLabel="Track by time"
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
                    style={[s.seg, runUnitDist === "miles" && s.segOn]}
                    onPress={() => setRunUnitDist("miles")}
                    accessibilityRole="button"
                    accessibilityLabel="Miles"
                  >
                    <Text style={[s.segTxt, runUnitDist === "miles" && s.segTxtOn]}>Miles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.seg, runUnitDist === "km" && s.segOn]}
                    onPress={() => setRunUnitDist("km")}
                    accessibilityRole="button"
                    accessibilityLabel="Kilometers"
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
            {row("GPS tracking", gpsRun, setGpsRun, "GPS tracking")}
            {row("Require photo proof", requirePhotoRun, setRequirePhotoRun, "Require photo proof for run")}
          </View>
        );
      case "workout":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Duration (minutes)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 45"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={workoutMins}
              onChangeText={setWorkoutMins}
              accessibilityLabel="Workout duration in minutes"
            />
            {row("Require photo proof", requirePhotoWorkout, setRequirePhotoWorkout, "Require photo proof for workout")}
            {row("Location check-in", requireLocationWorkout, setRequireLocationWorkout, "Location check-in for workout")}
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
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={s.headerLink}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>New task</Text>
          <TouchableOpacity onPress={handleAdd} disabled={!canAdd} hitSlop={12}>
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
          <View style={s.grid}>
            {TYPE_GRID.map((cell) => {
              const sel = kind === cell.id;
              const Icon = cell.Icon;
              return (
                <TouchableOpacity
                  key={cell.id}
                  style={[s.typeCell, sel ? s.typeCellSel : s.typeCellUnsel]}
                  onPress={() => setKind(cell.id)}
                  activeOpacity={0.85}
                >
                  <Icon size={22} color={sel ? CREATE_SELECTION.text : DS_COLORS.TEXT_SECONDARY} />
                  <Text style={[s.typeLabel, sel && { color: CREATE_SELECTION.text }]} numberOfLines={2}>
                    {cell.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {configBlock}
          {kind !== "simple" && (
            <View style={s.timeSection}>
              <View style={[s.toggleRow, s.timeToggleRow]}>
                <Text style={s.toggleLabel}>Set a time window</Text>
                <Switch
                  value={timeEnforcementEnabled}
                  onValueChange={setTimeEnforcementEnabled}
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
            style={[s.cta, !canAdd && { opacity: 0.4 }]}
            disabled={!canAdd}
            onPress={handleAdd}
            activeOpacity={0.9}
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
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeCell: {
    width: "18%",
    minWidth: 56,
    aspectRatio: 1,
    maxHeight: 72,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  typeCellUnsel: {
    borderColor: "transparent",
  },
  typeCellSel: {
    borderColor: CREATE_SELECTION.border,
    backgroundColor: CREATE_SELECTION.background,
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 4,
  },
  configBlock: {
    marginTop: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DS_SPACING.sm,
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
  segRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: DS_COLORS.surface,
    alignItems: "center",
  },
  segOn: {
    borderColor: CREATE_SELECTION.border,
    backgroundColor: CREATE_SELECTION.background,
  },
  segTxt: { fontSize: 13, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },
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
  ctaText: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
  timeSection: { marginTop: DS_SPACING.lg },
  timeToggleRow: { marginBottom: 8 },
  timeFields: { marginTop: 8 },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1 },
  sublabel: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 4 },
  hint: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 4, marginBottom: 8 },
});

import React, { useState, useCallback, useMemo, useEffect, useRef, useLayoutEffect } from "react";
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
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS, GRIIT_COLORS } from "@/lib/design-system"
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
          borderRadius: DS_RADIUS.button,
          padding: 14,
        },
        style,
      ]}
    >
      <View style={[s.taskIconWrap, { backgroundColor: selected ? DS_COLORS.FEED_CTA_ICON_BG : DS_COLORS.WARM_CREAM }]}>
        <Text style={s.taskIconText}>{icon}</Text>
      </View>
      <View style={s.flex1}>
        <Text style={s.taskName}>{name}</Text>
        <Text style={s.taskSubtitle}>{subtitle}</Text>
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

/** Accepts "7:00 AM", "07:00", "7 AM", etc. Returns "07:00" (24h) or original trim if unparsed. */
function parseTimeToHHMM(timeStr: string): string {
  const cleaned = timeStr.trim().toUpperCase().replace(/\s+/g, " ");
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return timeStr.trim();
  let hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const period = match[3];
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  if (!Number.isFinite(hours) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return timeStr.trim();
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const HM_SCHEDULE_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const HM_HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const HM_PICKER_ITEM = 33;
const HM_PICKER_PAD = 33;
const HM_PICKER_H = 99;

function parseScheduleDisplay(s: string, fallback: string): { h: number; m: number; pm: boolean } {
  const raw = (s && s.trim() ? s : fallback).trim().toUpperCase().replace(/\s+/g, " ");
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return { h: 7, m: 0, pm: false };
  let h = parseInt(match[1] ?? "0", 10);
  const minRaw = parseInt(match[2] ?? "0", 10);
  const pm = match[3] === "PM";
  if (!Number.isFinite(h) || h < 1 || h > 12) h = 7;
  if (!Number.isFinite(minRaw)) return { h, m: 0, pm };
  let nearest = 0;
  HM_SCHEDULE_MINUTES.forEach((val, i) => {
    const d = Math.abs(val - minRaw);
    const prev = HM_SCHEDULE_MINUTES[nearest];
    const bd = prev === undefined ? Infinity : Math.abs(prev - minRaw);
    if (d < bd) nearest = i;
  });
  const mSnap = HM_SCHEDULE_MINUTES[nearest] ?? 0;
  return { h, m: mSnap, pm };
}

function HMTimeColumn({
  labels,
  selectedIndex,
  onSelectIndex,
  columnWidth,
}: {
  labels: string[];
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  columnWidth: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const safeIdx = Math.max(0, Math.min(labels.length - 1, selectedIndex));

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: safeIdx * HM_PICKER_ITEM, animated: false });
  }, [safeIdx, labels.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ width: columnWidth, height: HM_PICKER_H }}
      showsVerticalScrollIndicator={false}
      snapToInterval={HM_PICKER_ITEM}
      snapToAlignment="start"
      decelerationRate="fast"
      nestedScrollEnabled
      contentContainerStyle={{ paddingVertical: HM_PICKER_PAD }}
      onMomentumScrollEnd={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        let i = Math.round(y / HM_PICKER_ITEM);
        i = Math.max(0, Math.min(labels.length - 1, i));
        onSelectIndex(i);
      }}
    >
      {labels.map((label, index) => (
        <View
          key={`${label}-${index}`}
          style={{
            height: HM_PICKER_ITEM,
            width: columnWidth,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={index === safeIdx ? s.hmPickerTextSelected : s.hmPickerTextMuted}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function ScheduleTimeScrollPicker({
  value,
  onChange,
  label,
  accessibilityLabel,
  fallbackTime,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  accessibilityLabel: string;
  fallbackTime: string;
}) {
  const { h, m, pm } = parseScheduleDisplay(value, fallbackTime);
  const hourIdx = Math.max(0, Math.min(11, h - 1));
  const minIdx = Math.max(0, HM_SCHEDULE_MINUTES.indexOf(m));
  const ampmIdx = pm ? 1 : 0;

  const commit = (next: { hi?: number; mi?: number; ai?: number }) => {
    const hi = next.hi ?? hourIdx;
    const mi = next.mi ?? minIdx;
    const ai = next.ai ?? ampmIdx;
    const hour = HM_HOURS_12[hi] ?? 7;
    const minute = HM_SCHEDULE_MINUTES[mi] ?? 0;
    const isPm = ai === 1;
    onChange(`${hour}:${String(minute).padStart(2, "0")} ${isPm ? "PM" : "AM"}`);
  };

  return (
    <View style={s.hmTimeInput} accessibilityLabel={accessibilityLabel}>
      <Text style={s.hmTimeLabel}>{label}</Text>
      <View style={s.hmPickerShell}>
        <View style={s.hmPickerHighlight} pointerEvents="none" />
        <View style={s.hmPickerColumns}>
          <HMTimeColumn
            labels={HM_HOURS_12.map(String)}
            selectedIndex={hourIdx}
            onSelectIndex={(i) => commit({ hi: i })}
            columnWidth={50}
          />
          <HMTimeColumn
            labels={HM_SCHEDULE_MINUTES.map((n) => String(n).padStart(2, "0"))}
            selectedIndex={minIdx}
            onSelectIndex={(i) => commit({ mi: i })}
            columnWidth={50}
          />
          <HMTimeColumn
            labels={["AM", "PM"]}
            selectedIndex={ampmIdx}
            onSelectIndex={(i) => commit({ ai: i })}
            columnWidth={45}
          />
        </View>
      </View>
    </View>
  );
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
  const [hardMode, setHardMode] = useState(false);
  const [scheduleStart, setScheduleStart] = useState("7:00 AM");
  const [scheduleEnd, setScheduleEnd] = useState("8:00 AM");
  const [requireLocation, setRequireLocation] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [requireCameraOnly, setRequireCameraOnly] = useState(false);
  const [requireStrava, setRequireStrava] = useState(false);

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
      setHardMode(false);
      setScheduleStart("7:00 AM");
      setScheduleEnd("8:00 AM");
      setRequireLocation(false);
      setLocationName("");
      setLocationLat(null);
      setLocationLng(null);
      setRequireCameraOnly(false);
      setRequireStrava(false);
    } else {
      setHardMode(!!hardModeGlobal);
    }
  }, [visible, hardModeGlobal]);

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
    setRequireStrava(false);
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
    if (hardMode && requireLocation && !locationName.trim()) return false;
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
    hardMode,
    requireLocation,
    locationName,
  ]);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationLat(pos.coords.latitude);
      setLocationLng(pos.coords.longitude);
    } catch {
      /* non-fatal */
    }
  }, []);

  const handleAdd = useCallback(() => {
    const opts = buildOpts();
    const task = buildTask(name, kind, !!hardModeGlobal, opts);
    if (!task) return;
    const teEnabled = kind !== "simple" && timeEnforcementEnabled;
    const windowEnd = teEnabled ? parseInt(windowMinutes, 10) || 60 : null;
    const anchor = anchorTime.trim() || "06:00";
    const hm = hardMode;
    const scheduleTz = hm ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
    onAdd({
      ...task,
      wizardType: kind,
      timeEnforcementEnabled: teEnabled,
      scheduleType: (teEnabled ? "DAILY" : "NONE") as ScheduleType,
      anchorTimeLocal: teEnabled ? anchor : null,
      windowStartOffsetMin: teEnabled ? 0 : null,
      windowEndOffsetMin: teEnabled ? windowEnd : null,
      config: {
        hard_mode: hm,
        schedule_window_start: hm && scheduleStart.trim() ? parseTimeToHHMM(scheduleStart) : undefined,
        schedule_window_end: hm && scheduleEnd.trim() ? parseTimeToHHMM(scheduleEnd) : undefined,
        schedule_timezone: hm ? scheduleTz : undefined,
        require_location: hm ? requireLocation : false,
        location_name: hm && requireLocation && locationName.trim() ? locationName.trim() : undefined,
        location_latitude: hm && requireLocation ? locationLat ?? undefined : undefined,
        location_longitude: hm && requireLocation ? locationLng ?? undefined : undefined,
        location_radius_meters: hm && requireLocation ? 200 : undefined,
        require_camera_only: hm ? requireCameraOnly : false,
        require_strava: hm ? requireStrava : false,
      },
    } as TaskEditorTask);
    onClose();
  }, [
    name,
    kind,
    hardModeGlobal,
    buildOpts,
    onAdd,
    onClose,
    timeEnforcementEnabled,
    anchorTime,
    windowMinutes,
    hardMode,
    scheduleStart,
    scheduleEnd,
    requireLocation,
    locationName,
    locationLat,
    locationLng,
    requireCameraOnly,
    requireStrava,
  ]);

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
            <View style={s.rowGap8}>
              <TouchableOpacity
                onPress={() => setRunTracking("distance")}
                accessibilityRole="button"
                accessibilityLabel="Track run by distance"
                accessibilityState={{ selected: runTracking === "distance" }}
                style={[
                  s.selectorPill,
                  runTracking === "distance" ? s.selectorPillSelected : s.selectorPillIdle,
                ]}
              >
                <Text style={[s.selectorPillText, runTracking === "distance" ? s.selectorPillTextSelected : s.selectorPillTextIdle]}>
                  Distance
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRunTracking("time")}
                accessibilityRole="button"
                accessibilityLabel="Track run by duration"
                accessibilityState={{ selected: runTracking === "time" }}
                style={[
                  s.selectorPill,
                  runTracking === "time" ? s.selectorPillSelected : s.selectorPillIdle,
                ]}
              >
                <Text style={[s.selectorPillText, runTracking === "time" ? s.selectorPillTextSelected : s.selectorPillTextIdle]}>
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
                <View style={s.rowGap8}>
                  <TouchableOpacity
                    onPress={() => setRunUnitDist("miles")}
                    accessibilityRole="button"
                    accessibilityLabel="Use miles for run distance"
                    accessibilityState={{ selected: runUnitDist === "miles" }}
                    style={[
                      s.selectorPill,
                      runUnitDist === "miles" ? s.selectorPillSelected : s.selectorPillIdle,
                    ]}
                  >
                    <Text style={[s.selectorPillText, runUnitDist === "miles" ? s.selectorPillTextSelected : s.selectorPillTextIdle]}>
                      Miles
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRunUnitDist("km")}
                    accessibilityRole="button"
                    accessibilityLabel="Use kilometers for run distance"
                    accessibilityState={{ selected: runUnitDist === "km" }}
                    style={[
                      s.selectorPill,
                      runUnitDist === "km" ? s.selectorPillSelected : s.selectorPillIdle,
                    ]}
                  >
                    <Text style={[s.selectorPillText, runUnitDist === "km" ? s.selectorPillTextSelected : s.selectorPillTextIdle]}>
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
              style={[s.selectorPill, selected ? s.selectorPillSelected : s.selectorPillIdle]}
            >
              <Text style={[s.selectorPillText, selected ? s.selectorPillTextSelected : s.selectorPillTextIdle]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        };
        return (
          <View style={s.configBlock}>
            <Text style={s.sectionTitle}>
              Workout type
            </Text>
            <View style={s.colGap8Mb16}>
              <View style={s.rowGap8}>
                {workoutPill("General", "general")}
                {workoutPill("Cardio", "cardio")}
                {workoutPill("Strength", "strength")}
              </View>
              <View style={s.rowGap8}>
                {workoutPill("HIIT", "hiit")}
                {workoutPill("Yoga", "yoga")}
                <View style={s.flex1} />
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
            style={s.typeSectionTitle}
          >
            What type of task?
          </Text>
          <View style={s.colGap8}>
            <View style={s.rowGap8}>
              <NewTaskTypeCard
                icon="💪"
                name="Workout"
                subtitle="Gym, strength, cardio"
                selected={kind === "workout"}
                onPress={() => setKind("workout")}
                style={s.flex1}
              />
              <NewTaskTypeCard
                icon="🏃"
                name="Run"
                subtitle="Distance or time"
                selected={kind === "run"}
                onPress={() => setKind("run")}
                style={s.flex1}
              />
            </View>
            <View style={s.rowGap8}>
              <NewTaskTypeCard
                icon="⏱️"
                name="Timer"
                subtitle="Meditation, focus"
                selected={kind === "timer"}
                onPress={() => setKind("timer")}
                style={s.flex1}
              />
              <NewTaskTypeCard
                icon="✓"
                name="Simple"
                subtitle="Just check it off"
                selected={kind === "simple"}
                onPress={() => setKind("simple")}
                style={s.flex1}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowMoreTypes(!showMoreTypes)}
            accessibilityLabel={showMoreTypes ? "Show fewer task types" : "Show more task types"}
            accessibilityRole="button"
            style={s.showMoreToggle}
          >
            <Ionicons
              name={showMoreTypes ? "chevron-up" : "chevron-down"}
              size={16}
              color={DS_COLORS.TEXT_SECONDARY}
            />
            <Text style={s.showMoreText}>
              {showMoreTypes ? "Show less" : "6 more types"}
            </Text>
          </TouchableOpacity>
          {(showMoreTypes || MORE_TASK_TYPES.includes(kind)) && (
            <View
              style={s.moreTypesWrap}
            >
              <View style={s.rowGap8}>
                <NewTaskTypeCard
                  icon="💧"
                  name="Water"
                  subtitle="Track glasses"
                  selected={kind === "water"}
                  onPress={() => setKind("water")}
                  style={s.flex1}
                />
                <NewTaskTypeCard
                  icon="📓"
                  name="Journal"
                  subtitle="Write, reflect"
                  selected={kind === "journal"}
                  onPress={() => setKind("journal")}
                  style={s.flex1}
                />
              </View>
              <View style={s.rowGap8}>
                <NewTaskTypeCard
                  icon="📖"
                  name="Reading"
                  subtitle="Pages or time"
                  selected={kind === "reading"}
                  onPress={() => setKind("reading")}
                  style={s.flex1}
                />
                <NewTaskTypeCard
                  icon="📷"
                  name="Photo"
                  subtitle="Proof required"
                  selected={kind === "photo"}
                  onPress={() => setKind("photo")}
                  style={s.flex1}
                />
              </View>
              <View style={s.rowGap8}>
                <NewTaskTypeCard
                  icon="📍"
                  name="Check-in"
                  subtitle="Location stamp"
                  selected={kind === "checkin"}
                  onPress={() => setKind("checkin")}
                  style={s.flex1}
                />
                <NewTaskTypeCard
                  icon="#️⃣"
                  name="Counter"
                  subtitle="Reps, sets, count"
                  selected={kind === "counter"}
                  onPress={() => setKind("counter")}
                  style={s.flex1}
                />
              </View>
            </View>
          )}
          {configBlock}
          <View style={s.hardModeSection}>
            <View style={s.hardModeToggleRow}>
              <View style={s.flex1}>
                <Text style={s.hardModeTitle}>Hard mode</Text>
                <Text style={s.hardModeSubtitle}>Enforce verification gates</Text>
              </View>
              <Switch
                value={hardMode}
                onValueChange={setHardMode}
                accessibilityRole="switch"
                trackColor={{ false: DS_COLORS.SWITCH_TRACK_OFF, true: DS_COLORS.SWITCH_TRACK_ON }}
                thumbColor={DS_COLORS.SWITCH_THUMB}
                accessibilityLabel="Toggle hard mode for this task"
              />
            </View>

            {hardMode && (
              <>
                <View style={s.hardModeDivider} />
                <Text style={s.hardModeExplainer}>
                  Tasks require proof to complete. No shortcuts, no excuses. Failed verifications count as missed days.
                </Text>

                <Text style={s.hmConfigLabel}>Schedule window</Text>
                <Text style={s.hmConfigHint}>Task must be completed within this time range</Text>
                <View style={s.hmTimeRow}>
                  <ScheduleTimeScrollPicker
                    value={scheduleStart}
                    onChange={setScheduleStart}
                    label="Start"
                    fallbackTime="7:00 AM"
                    accessibilityLabel="Schedule window start time"
                  />
                  <ScheduleTimeScrollPicker
                    value={scheduleEnd}
                    onChange={setScheduleEnd}
                    label="End"
                    fallbackTime="8:00 AM"
                    accessibilityLabel="Schedule window end time"
                  />
                </View>

                <View style={s.hardModeToggleRow}>
                  <View style={s.flex1}>
                    <Text style={s.hmConfigLabel}>Location required</Text>
                    <Text style={s.hmConfigHint}>GPS must confirm you are at this location</Text>
                  </View>
                  <Switch
                    value={requireLocation}
                    onValueChange={setRequireLocation}
                    accessibilityRole="switch"
                    trackColor={{ false: DS_COLORS.SWITCH_TRACK_OFF, true: DS_COLORS.SWITCH_TRACK_ON }}
                    thumbColor={DS_COLORS.SWITCH_THUMB}
                    accessibilityLabel="Require location verification"
                  />
                </View>

                {requireLocation ? (
                  <>
                    <TextInput
                      style={s.hmLocationInput}
                      placeholder="e.g. Planet Fitness — Ramsey, NJ"
                      placeholderTextColor={DS_COLORS.TEXT_HINT}
                      value={locationName}
                      onChangeText={setLocationName}
                      accessibilityLabel="Location name for verification"
                    />
                    <TouchableOpacity
                      style={s.hmLocationBtn}
                      onPress={() => void handleUseCurrentLocation()}
                      accessibilityRole="button"
                      accessibilityLabel="Use current GPS location for verification coordinates"
                    >
                      <Text style={s.hmLocationBtnText}>Use current location</Text>
                    </TouchableOpacity>
                    {locationLat != null && locationLng != null ? (
                      <Text style={s.hmConfigHint}>GPS saved for this spot</Text>
                    ) : null}
                  </>
                ) : null}

                <View style={s.hardModeToggleRow}>
                  <View style={s.flex1}>
                    <Text style={s.hmConfigLabel}>Camera-only proof</Text>
                    <Text style={s.hmConfigHint}>No gallery uploads — live camera only</Text>
                  </View>
                  <Switch
                    value={requireCameraOnly}
                    onValueChange={setRequireCameraOnly}
                    accessibilityRole="switch"
                    trackColor={{ false: DS_COLORS.SWITCH_TRACK_OFF, true: DS_COLORS.SWITCH_TRACK_ON }}
                    thumbColor={DS_COLORS.SWITCH_THUMB}
                    accessibilityLabel="Require camera-only photo proof"
                  />
                </View>

                {(kind === "run" || kind === "workout") && (
                  <View style={s.hardModeToggleRow}>
                    <View style={s.flex1}>
                      <Text style={s.hmConfigLabel}>Strava verification</Text>
                      <Text style={s.hmConfigHint}>Auto-verify via Strava activity data</Text>
                    </View>
                    <Switch
                      value={requireStrava}
                      onValueChange={setRequireStrava}
                      accessibilityRole="switch"
                      trackColor={{ false: DS_COLORS.SWITCH_TRACK_OFF, true: DS_COLORS.SWITCH_TRACK_ON }}
                      thumbColor={DS_COLORS.SWITCH_THUMB}
                      accessibilityLabel="Require Strava verification"
                    />
                  </View>
                )}
              </>
            )}
          </View>
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
  headerLink: { fontSize: 14, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: GRIIT_COLORS.primary },
  headerLinkDisabled: { opacity: 0.4 },
  headerTitle: { fontSize: 16, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  body: { padding: DS_SPACING.lg },
  label: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY, marginBottom: 8 },
  labelSp: { marginTop: DS_SPACING.md },
  input: {
    backgroundColor: DS_COLORS.WHITE,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.MD,
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
    borderRadius: DS_RADIUS.joinCta,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.TEXT_ON_DARK },
  timeSection: { marginTop: DS_SPACING.lg },
  timeToggleRow: { marginBottom: 8 },
  timeFields: { marginTop: 8 },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1 },
  sublabel: { fontSize: 12, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.TEXT_PRIMARY, marginBottom: 4 },
  hint: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 4, marginBottom: 8 },
  flex1: { flex: 1 },
  rowGap8: { flexDirection: "row", gap: 8 },
  colGap8: { flexDirection: "column", gap: 8 },
  colGap8Mb16: { flexDirection: "column", gap: 8, marginBottom: 16 },
  selectorPill: { flex: 1, height: 44, borderRadius: DS_RADIUS.iconButton, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  selectorPillSelected: { borderColor: DS_COLORS.PRIMARY, backgroundColor: DS_COLORS.ACCENT_TINT },
  selectorPillIdle: { borderColor: DS_COLORS.BORDER, backgroundColor: DS_COLORS.CARD_BG },
  selectorPillText: { fontSize: 14, fontWeight: "500" },
  selectorPillTextSelected: { color: DS_COLORS.PRIMARY },
  selectorPillTextIdle: { color: DS_COLORS.TEXT_SECONDARY },
  sectionTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 10 },
  typeSectionTitle: { fontSize: 15, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.TEXT_PRIMARY, marginBottom: 10, marginTop: 20 },
  showMoreToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  showMoreText: { fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  moreTypesWrap: { flexDirection: "column", gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: DS_COLORS.BORDER, borderStyle: "dashed" },
  taskIconWrap: { width: 38, height: 38, borderRadius: DS_RADIUS.MD, alignItems: "center", justifyContent: "center" },
  taskIconText: { fontSize: 17 },
  taskName: { fontSize: 14, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.TEXT_PRIMARY },
  taskSubtitle: { fontSize: 12, color: DS_COLORS.TEXT_HINT, marginTop: 1 },
  hardModeSection: {
    backgroundColor: DS_COLORS.CARD_BG,
    borderRadius: DS_RADIUS.LG,
    padding: 16,
    marginTop: DS_SPACING.lg,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
  },
  hardModeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  hardModeTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  hardModeSubtitle: { fontSize: 12, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY, marginTop: 2 },
  hardModeDivider: { height: 0.5, backgroundColor: DS_COLORS.BORDER, marginVertical: 10 },
  hardModeExplainer: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.createErrorText,
    lineHeight: 18,
    marginBottom: 14,
  },
  hmConfigLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 8,
  },
  hmConfigHint: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
    marginBottom: 8,
  },
  hmTimeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  hmTimeInput: {
    flex: 1,
    backgroundColor: DS_COLORS.WARM_CREAM,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
    borderRadius: DS_RADIUS.MD,
    padding: 12,
  },
  hmTimeField: { fontSize: 16, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  hmTimeLabel: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS.TEXT_SECONDARY,
    marginBottom: 6,
  },
  hmPickerShell: {
    height: HM_PICKER_H,
    borderRadius: DS_RADIUS.SM,
    overflow: "hidden",
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    position: "relative",
  },
  hmPickerHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: HM_PICKER_PAD,
    height: HM_PICKER_ITEM,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DS_COLORS.BORDER,
    zIndex: 1,
  },
  hmPickerColumns: { flexDirection: "row", height: HM_PICKER_H, zIndex: 2 },
  hmPickerTextSelected: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  hmPickerTextMuted: { fontSize: 14, fontWeight: "400", color: DS_COLORS.TEXT_MUTED },
  hmLocationInput: {
    backgroundColor: DS_COLORS.WARM_CREAM,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
    borderRadius: DS_RADIUS.MD,
    padding: 12,
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  hmLocationBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderWidth: 1.5,
    borderColor: DS_COLORS.PRIMARY,
    marginBottom: 8,
  },
  hmLocationBtnText: { fontSize: 14, fontWeight: "500", color: DS_COLORS.PRIMARY },
});

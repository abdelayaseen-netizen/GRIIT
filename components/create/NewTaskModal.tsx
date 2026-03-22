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
import type { JournalCategory } from "@/types";

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

function buildTask(
  name: string,
  t: WizardTaskType,
  hardPhoto: boolean,
  opts: {
    timerMins: number;
    waterGlasses: number;
    readingPages: number;
    counterTarget: number;
    runTracking: "distance" | "time";
    runTarget: number;
    runUnitDist: "miles" | "km";
  }
): TaskEditorTask | null {
  const title = name.trim();
  if (!title) return null;
  const reqPhoto = hardPhoto;
  switch (t) {
    case "journal":
      return {
        id: newId(),
        title,
        type: "journal",
        required: true,
        journalType: ["self_reflection"] as JournalCategory[],
        journalPrompt: "Write at least 20 characters reflecting on your day.",
        minWords: 20,
        requirePhotoProof: reqPhoto,
      };
    case "timer":
      return {
        id: newId(),
        title,
        type: "timer",
        required: true,
        durationMinutes: opts.timerMins,
        mustCompleteInSession: true,
        requirePhotoProof: reqPhoto,
      };
    case "photo":
      return {
        id: newId(),
        title,
        type: "photo",
        required: true,
        requirePhotoProof: true,
        photoRequired: true,
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
          requirePhotoProof: reqPhoto,
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
        requirePhotoProof: reqPhoto,
      };
    case "simple":
      return {
        id: newId(),
        title,
        type: "simple",
        required: true,
        requirePhotoProof: reqPhoto,
      };
    case "checkin":
      return {
        id: newId(),
        title,
        type: "checkin",
        required: true,
        locationName: "Home base",
        radiusMeters: 150,
        requirePhotoProof: reqPhoto,
      };
    case "water":
      return {
        id: newId(),
        title,
        type: "water",
        required: true,
        targetValue: opts.waterGlasses,
        unit: "glasses",
        requirePhotoProof: reqPhoto,
      };
    case "reading":
      return {
        id: newId(),
        title,
        type: "reading",
        required: true,
        targetValue: opts.readingPages,
        unit: "pages",
        requirePhotoProof: reqPhoto,
      };
    case "workout":
      return {
        id: newId(),
        title,
        type: "run",
        required: true,
        trackingMode: "time",
        targetValue: opts.runTarget,
        unit: "minutes",
        requirePhotoProof: reqPhoto,
      };
    case "counter":
      return {
        id: newId(),
        title,
        type: "counter",
        required: true,
        targetValue: opts.counterTarget,
        requirePhotoProof: reqPhoto,
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
  const [runTracking, setRunTracking] = useState<"distance" | "time">("distance");
  const [runTarget, setRunTarget] = useState("3");
  const [runUnitDist, setRunUnitDist] = useState<"miles" | "km">("miles");
  const [workoutMins, setWorkoutMins] = useState("45");

  useEffect(() => {
    if (!visible) {
      setName("");
      setKind("simple");
      setTimerMins("30");
      setWaterGlasses("8");
      setReadingPages("10");
      setCounterTarget("100");
      setRunTracking("distance");
      setRunTarget("3");
      setRunUnitDist("miles");
      setWorkoutMins("45");
    }
  }, [visible]);

  const canAdd = useMemo(() => {
    if (!name.trim()) return false;
    switch (kind) {
      case "timer":
        return parsePositiveInt(timerMins, 0) > 0;
      case "water":
        return parsePositiveInt(waterGlasses, 0) > 0;
      case "reading":
        return parsePositiveInt(readingPages, 0) > 0;
      case "counter":
        return parsePositiveInt(counterTarget, 0) > 0;
      case "run":
        if (runTracking === "distance") {
          return parsePositiveFloat(runTarget, 0) > 0;
        }
        return parsePositiveInt(runTarget, 0) > 0;
      case "workout":
        return parsePositiveInt(workoutMins, 0) > 0;
      default:
        return true;
    }
  }, [name, kind, timerMins, waterGlasses, readingPages, counterTarget, runTracking, runTarget, workoutMins]);

  const handleAdd = useCallback(() => {
    const opts = {
      timerMins: parsePositiveInt(timerMins, 30),
      waterGlasses: parsePositiveInt(waterGlasses, 8),
      readingPages: parsePositiveInt(readingPages, 10),
      counterTarget: parsePositiveInt(counterTarget, 100),
      runTracking,
      runTarget:
        runTracking === "distance"
          ? parsePositiveFloat(runTarget, 3)
          : parsePositiveInt(runTarget, 30),
      runUnitDist,
    };
    const workoutOpts = { ...opts, runTarget: parsePositiveInt(workoutMins, 45), runTracking: "time" as const };
    const task =
      kind === "workout"
        ? buildTask(name, "workout", !!hardModeGlobal, workoutOpts)
        : buildTask(name, kind, !!hardModeGlobal, opts);
    if (!task) return;
    onAdd({ ...task, wizardType: kind });
    onClose();
  }, [
    name,
    kind,
    hardModeGlobal,
    onAdd,
    onClose,
    timerMins,
    waterGlasses,
    readingPages,
    counterTarget,
    runTracking,
    runTarget,
    runUnitDist,
    workoutMins,
  ]);

  const configBlock = (() => {
    switch (kind) {
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
            />
          </View>
        );
      case "water":
        return (
          <View style={s.configBlock}>
            <Text style={s.label}>Target (glasses)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 8"
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              keyboardType="number-pad"
              value={waterGlasses}
              onChangeText={setWaterGlasses}
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
            />
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
            />
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
              >
                <Text style={[s.segTxt, runTracking === "distance" && s.segTxtOn]}>Distance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.seg, runTracking === "time" && s.segOn]}
                onPress={() => setRunTracking("time")}
              >
                <Text style={[s.segTxt, runTracking === "time" && s.segTxtOn]}>Time</Text>
              </TouchableOpacity>
            </View>
            {runTracking === "distance" ? (
              <>
                <Text style={[s.label, s.labelSp]}>Distance</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. 3"
                  placeholderTextColor={DS_COLORS.TEXT_MUTED}
                  keyboardType="decimal-pad"
                  value={runTarget}
                  onChangeText={setRunTarget}
                />
                <View style={s.segRow}>
                  <TouchableOpacity
                    style={[s.seg, runUnitDist === "miles" && s.segOn]}
                    onPress={() => setRunUnitDist("miles")}
                  >
                    <Text style={[s.segTxt, runUnitDist === "miles" && s.segTxtOn]}>Miles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.seg, runUnitDist === "km" && s.segOn]}
                    onPress={() => setRunUnitDist("km")}
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
                />
              </>
            )}
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
            />
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
          contentContainerStyle={[s.body, { paddingBottom: DS_SPACING.md }]}
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
});

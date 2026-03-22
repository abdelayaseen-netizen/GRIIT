import React, { useState, useCallback, useMemo } from "react";
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
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
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

function buildTask(
  name: string,
  t: WizardTaskType,
  hardPhoto: boolean
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
        durationMinutes: 10,
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
      return {
        id: newId(),
        title,
        type: "run",
        required: true,
        trackingMode: "distance",
        targetValue: 3,
        unit: "miles",
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
        type: "simple",
        required: true,
        requirePhotoProof: reqPhoto,
      };
    case "reading":
      return {
        id: newId(),
        title,
        type: "journal",
        required: true,
        journalType: ["mental_clarity"] as JournalCategory[],
        journalPrompt: "After reading, write at least 20 words on what you learned today.",
        minWords: 20,
        requirePhotoProof: reqPhoto,
      };
    case "workout":
      return {
        id: newId(),
        title,
        type: "run",
        required: true,
        trackingMode: "time",
        targetValue: 45,
        unit: "minutes",
        requirePhotoProof: reqPhoto,
      };
    case "counter":
      return {
        id: newId(),
        title,
        type: "simple",
        required: true,
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

  const canAdd = useMemo(() => name.trim().length > 0, [name]);

  const handleAdd = useCallback(() => {
    const task = buildTask(name, kind, !!hardModeGlobal);
    if (!task) return;
    onAdd({ ...task, wizardType: kind });
    setName("");
    setKind("simple");
    onClose();
  }, [name, kind, hardModeGlobal, onAdd, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={s.headerLink}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>New task</Text>
          <TouchableOpacity onPress={handleAdd} disabled={!canAdd} hitSlop={12}>
            <Text style={[s.headerLink, !canAdd && s.headerLinkDisabled]}>Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
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
                  style={[s.typeCell, sel && s.typeCellSel]}
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
          <TouchableOpacity
            style={[s.cta, !canAdd && { opacity: 0.4 }]}
            disabled={!canAdd}
            onPress={handleAdd}
            activeOpacity={0.9}
          >
            <Text style={s.ctaText}>Add task</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={{ height: insets.bottom + 12 }} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_COLORS.background },
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
  body: { padding: DS_SPACING.lg, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY, marginBottom: 8 },
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
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  typeCellSel: {
    borderWidth: 1.5,
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
  cta: {
    marginTop: DS_SPACING.xl,
    backgroundColor: GRIIT_COLORS.primary,
    height: 48,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
});

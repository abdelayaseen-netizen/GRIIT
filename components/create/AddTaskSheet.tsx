/**
 * Add task sheet — frame 42.
 */
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import Divider from "@/components/ds/Divider";
import ListRow from "@/components/ds/ListRow";
import SegmentedControl from "@/components/ds/SegmentedControl";
import Sheet from "@/components/ds/Sheet";
import Switch from "@/components/ds/Switch";
import TextField from "@/components/ds/TextField";
import type { WizardTask } from "@/components/create/v2/StepTasks";
import {
  ADD_TASK_CTA,
  ADD_TASK_DEFAULT,
  ADD_TASK_HEADING,
  ADD_TASK_NAME_LABEL,
  ADD_TASK_NAME_PLACEHOLDER,
  ADD_TASK_SET_PLACE,
  ADD_TASK_TYPE_CHIPS,
  ADD_TASK_WHAT_PROVES,
  ADD_TASK_WHAT_YOU_DO,
  NO_GATES_CAPTION,
  TIMER_CHIPS,
  TIMER_CUSTOM,
  canSubmitDraft,
  payloadFromDraft,
  type AddTaskDraft,
} from "@/lib/add-task-draft";
import { typeCaption } from "@/lib/task-ui";

const NAME_MAX = 60;

export type AddTaskSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (task: WizardTask) => void;
  initial?: AddTaskDraft | null;
};

export default function AddTaskSheet({
  visible,
  onClose,
  onSave,
  initial,
}: AddTaskSheetProps) {
  const [draft, setDraft] = useState<AddTaskDraft>(initial ?? ADD_TASK_DEFAULT);

  useEffect(() => {
    if (visible) setDraft(initial ?? ADD_TASK_DEFAULT);
  }, [visible, initial]);

  const save = useCallback(() => {
    if (!canSubmitDraft(draft)) return;
    const row = payloadFromDraft(draft);
    onSave({
      name: row.name,
      type: row.type,
      config: row.config,
      gates: row.gates,
      gateTime: row.gateTime,
      durationMinutes: row.durationMinutes,
      minWords: row.minWords,
      targetValue: row.targetValue,
      requirePhoto: row.requirePhoto,
      unit: row.unit,
    });
    onClose();
  }, [draft, onSave, onClose]);

  const allGatesOff = !draft.camera && !draft.time && !draft.location;

  return (
    <Sheet
      visible={visible}
      onDismiss={onClose}
      heading={ADD_TASK_HEADING}
      footer={
        <Button
          label={ADD_TASK_CTA}
          disabled={!canSubmitDraft(draft)}
          onPress={save}
        />
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <TextField
          label={ADD_TASK_NAME_LABEL}
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name: name.slice(0, NAME_MAX) }))}
          placeholder={ADD_TASK_NAME_PLACEHOLDER}
          accessibilityLabel={ADD_TASK_NAME_LABEL}
          maxLength={NAME_MAX}
        />

        <Text style={styles.section}>{ADD_TASK_WHAT_YOU_DO}</Text>
        <View style={styles.chips}>
          {ADD_TASK_TYPE_CHIPS.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              variant="form"
              selected={draft.type === chip.id}
              onPress={() => setDraft((d) => ({ ...d, type: chip.id }))}
            />
          ))}
        </View>
        <Text style={styles.caption}>{typeCaption(draft.type)}</Text>

        {draft.type === "timer" ? (
          <View style={styles.fieldBlock}>
            <View style={styles.chips}>
              {TIMER_CHIPS.map((mins) => (
                <Chip
                  key={mins}
                  label={String(mins)}
                  variant="form"
                  selected={draft.timerPreset === mins}
                  onPress={() => setDraft((d) => ({ ...d, timerPreset: mins }))}
                />
              ))}
              <Chip
                label={TIMER_CUSTOM}
                variant="form"
                selected={draft.timerPreset === "custom"}
                onPress={() => setDraft((d) => ({ ...d, timerPreset: "custom" }))}
              />
            </View>
            {draft.timerPreset === "custom" ? (
              <TextField
                label="Minutes"
                value={draft.customMinutes}
                onChangeText={(customMinutes) =>
                  setDraft((d) => ({ ...d, customMinutes: customMinutes.replace(/[^0-9]/g, "") }))
                }
                keyboardType="number-pad"
                placeholder="20"
              />
            ) : null}
          </View>
        ) : null}

        {draft.type === "counter" ? (
          <View style={styles.fieldBlock}>
            <TextField
              label="Target"
              value={draft.counterTarget}
              onChangeText={(counterTarget) =>
                setDraft((d) => ({ ...d, counterTarget: counterTarget.replace(/[^0-9]/g, "") }))
              }
              keyboardType="number-pad"
              placeholder="10"
            />
            <TextField
              label="Unit"
              value={draft.counterUnit}
              onChangeText={(counterUnit) => setDraft((d) => ({ ...d, counterUnit }))}
              placeholder="pages"
            />
          </View>
        ) : null}

        {draft.type === "text" ? (
          <View style={styles.fieldBlock}>
            <TextField
              label="Min words"
              value={draft.minWords}
              onChangeText={(minWords) =>
                setDraft((d) => ({ ...d, minWords: minWords.replace(/[^0-9]/g, "") }))
              }
              keyboardType="number-pad"
              placeholder="30"
            />
          </View>
        ) : null}

        {draft.type === "run" ? (
          <View style={styles.fieldBlock}>
            <TextField
              label="Distance"
              value={draft.runDistance}
              onChangeText={(runDistance) =>
                setDraft((d) => ({ ...d, runDistance: runDistance.replace(/[^0-9.]/g, "") }))
              }
              keyboardType="decimal-pad"
              placeholder="5"
            />
            <View style={styles.chips}>
              <Chip
                label="km"
                variant="form"
                selected={draft.runUnit === "km"}
                onPress={() => setDraft((d) => ({ ...d, runUnit: "km" }))}
              />
              <Chip
                label="mi"
                variant="form"
                selected={draft.runUnit === "mi"}
                onPress={() => setDraft((d) => ({ ...d, runUnit: "mi" }))}
              />
            </View>
          </View>
        ) : null}

        <Text style={styles.section}>{ADD_TASK_WHAT_PROVES}</Text>
        <View style={styles.gateRow}>
          <Text style={styles.gateLabel}>Camera</Text>
          <Switch
            value={draft.camera}
            onValueChange={(camera) => setDraft((d) => ({ ...d, camera }))}
            accessibilityLabel="Camera"
          />
        </View>
        <Divider />
        <View style={styles.gateRow}>
          <Text style={styles.gateLabel}>Time</Text>
          <Switch
            value={draft.time}
            onValueChange={(time) => setDraft((d) => ({ ...d, time }))}
            accessibilityLabel="Time"
          />
        </View>
        {draft.time ? (
          <View style={styles.reveal}>
            <SegmentedControl
              items={["By", "Between"]}
              value={draft.timeMode === "by" ? "By" : "Between"}
              onChange={(v) =>
                setDraft((d) => ({ ...d, timeMode: v === "By" ? "by" : "between" }))
              }
            />
            {draft.timeMode === "by" ? (
              <TextField
                label="By"
                value={draft.byTime}
                onChangeText={(byTime) => setDraft((d) => ({ ...d, byTime }))}
                placeholder="07:00"
              />
            ) : (
              <>
                <TextField
                  label="From"
                  value={draft.fromTime}
                  onChangeText={(fromTime) => setDraft((d) => ({ ...d, fromTime }))}
                  placeholder="09:30"
                />
                <TextField
                  label="To"
                  value={draft.toTime}
                  onChangeText={(toTime) => setDraft((d) => ({ ...d, toTime }))}
                  placeholder="10:30"
                />
              </>
            )}
          </View>
        ) : null}
        <Divider />
        <View style={styles.gateRow}>
          <Text style={styles.gateLabel}>Location</Text>
          <Switch
            value={draft.location}
            onValueChange={(location) => setDraft((d) => ({ ...d, location }))}
            accessibilityLabel="Location"
          />
        </View>
        {draft.location ? (
          <View style={styles.place}>
            <ListRow title={ADD_TASK_SET_PLACE} onPress={() => {}} divider={false} />
          </View>
        ) : null}

        {allGatesOff ? <Text style={styles.caption}>{NO_GATES_CAPTION}</Text> : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.sm,
  },
  section: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  fieldBlock: {
    gap: DS_V3.space.md,
  },
  gateRow: {
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.lg,
  },
  gateLabel: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  reveal: {
    gap: DS_V3.space.md,
  },
  place: {
    marginHorizontal: -DS_V3.space.gutter,
  },
});

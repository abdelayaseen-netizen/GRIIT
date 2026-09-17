/**
 * Add task sheet — frames 42 and 50.
 */
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { LocateFixed } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import Divider from "@/components/ds/Divider";
import ListRow from "@/components/ds/ListRow";
import SegmentedControl from "@/components/ds/SegmentedControl";
import Sheet from "@/components/ds/Sheet";
import Switch from "@/components/ds/Switch";
import TextField from "@/components/ds/TextField";
import { StatusRing } from "@/components/home/HomeV3";
import type { WizardTask } from "@/components/create/v2/StepTasks";
import {
  ADD_TASK_COMMON,
  ADD_TASK_CTA,
  ADD_TASK_DEFAULT,
  ADD_TASK_HEADING,
  ADD_TASK_HOW_CLOSE,
  ADD_TASK_NAME_LABEL,
  ADD_TASK_NAME_PLACEHOLDER,
  ADD_TASK_PLACE_NO_MAP,
  ADD_TASK_SAVE_PLACE,
  ADD_TASK_SEARCH_PLACE,
  ADD_TASK_SET_PLACE,
  ADD_TASK_STARTERS,
  ADD_TASK_TYPE_CHIPS,
  ADD_TASK_USE_LOCATION,
  ADD_TASK_WHAT_PROVES,
  ADD_TASK_WHAT_YOU_DO,
  PLACE_RADIUS_CHIPS,
  TIMER_CHIPS,
  TIMER_CUSTOM,
  applyStarter,
  canSavePlace,
  canSubmitDraft,
  payloadFromDraft,
  placeAccuracyLine,
  previewFromDraft,
  type AddTaskDraft,
} from "@/lib/add-task-draft";
import { typeCaption } from "@/lib/task-ui";
import type { HomeProofRow } from "@/lib/home-proof-card";

const NAME_MAX = 60;
const ICON = DS_V3.space.gutter;
const TYPE_ROWS = [ADD_TASK_TYPE_CHIPS.slice(0, 3), ADD_TASK_TYPE_CHIPS.slice(3, 6)] as const;

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
  const [placeOpen, setPlaceOpen] = useState(false);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [recent, setRecent] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (visible) {
      setDraft(initial ?? ADD_TASK_DEFAULT);
      setPlaceOpen(false);
    }
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

  const preview = previewFromDraft(draft);
  const previewRow: HomeProofRow = {
    id: "preview",
    name: preview.title,
    type: draft.type,
    caption: preview.caption,
    done: false,
    closed: false,
    hasCameraProof: false,
  };

  const takeCurrentLocation = useCallback(async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setAccuracyM(Math.round(loc.coords.accuracy ?? 0));
    setDraft((d) => ({
      ...d,
      placeName: d.placeName.trim() ? d.placeName : "Current location",
      placeLat: loc.coords.latitude,
      placeLng: loc.coords.longitude,
    }));
  }, []);

  const savePlace = useCallback(() => {
    if (!canSavePlace(draft)) return;
    const name = draft.placeName.trim();
    if (name) setRecent((r) => [ { name }, ...r.filter((x) => x.name !== name) ].slice(0, 3));
    setPlaceOpen(false);
  }, [draft]);

  if (placeOpen) {
    return (
      <Sheet
        visible={visible}
        onDismiss={() => setPlaceOpen(false)}
        heading={ADD_TASK_SET_PLACE}
        footer={
          <Button
            label={ADD_TASK_SAVE_PLACE}
            disabled={!canSavePlace(draft)}
            onPress={savePlace}
          />
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <TextField
            placeholder={ADD_TASK_SEARCH_PLACE}
            value={draft.placeName}
            onChangeText={(placeName) => setDraft((d) => ({ ...d, placeName }))}
            accessibilityLabel={ADD_TASK_SEARCH_PLACE}
          />
          <ListRow
            icon={<LocateFixed size={ICON} color={DS_V3.color.brandText} />}
            title={ADD_TASK_USE_LOCATION}
            subtitle={accuracyM != null ? placeAccuracyLine(accuracyM) : undefined}
            onPress={() => void takeCurrentLocation()}
            divider={false}
          />
          {recent.length > 0
            ? recent.map((p) => (
                <ListRow
                  key={p.name}
                  title={p.name}
                  onPress={() => setDraft((d) => ({ ...d, placeName: p.name }))}
                  divider={false}
                />
              ))
            : null}
          <Text style={styles.label}>{ADD_TASK_HOW_CLOSE}</Text>
          <View style={styles.chips}>
            {PLACE_RADIUS_CHIPS.map((chip) => (
              <Chip
                key={chip.meters}
                label={chip.label}
                variant="form"
                selected={draft.placeRadius === chip.meters}
                onPress={() => setDraft((d) => ({ ...d, placeRadius: chip.meters }))}
              />
            ))}
          </View>
          <Text style={styles.caption}>{ADD_TASK_PLACE_NO_MAP}</Text>
        </ScrollView>
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      onDismiss={onClose}
      heading={ADD_TASK_HEADING}
      footer={
        <Button
          label={ADD_TASK_CTA}
          disabled={!draft.name.trim()}
          onPress={save}
        />
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.label}>{ADD_TASK_COMMON}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {ADD_TASK_STARTERS.map((starter) => (
            <Chip
              key={starter.label}
              label={starter.label}
              variant="form"
              onPress={() => setDraft(applyStarter(starter))}
            />
          ))}
        </ScrollView>

        <TextField
          label={ADD_TASK_NAME_LABEL}
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name: name.slice(0, NAME_MAX) }))}
          placeholder={ADD_TASK_NAME_PLACEHOLDER}
          accessibilityLabel={ADD_TASK_NAME_LABEL}
          maxLength={NAME_MAX}
        />

        <Text style={styles.section}>{ADD_TASK_WHAT_YOU_DO}</Text>
        <View style={styles.typeGrid}>
          {TYPE_ROWS.map((row, i) => (
            <View key={i} style={styles.typeRow}>
              {row.map((chip) => (
                <View key={chip.id} style={styles.typeCell}>
                  <Chip
                    label={chip.label}
                    variant="form"
                    selected={draft.type === chip.id}
                    onPress={() => setDraft((d) => ({ ...d, type: chip.id }))}
                  />
                </View>
              ))}
              {row.length < 3 ? <View style={styles.typeCell} /> : null}
            </View>
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
        <View style={styles.preview}>
          <ListRow
            icon={<StatusRing row={previewRow} />}
            title={preview.title}
            subtitle={preview.caption}
            divider={false}
          />
        </View>
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
            <ListRow title={ADD_TASK_SET_PLACE} onPress={() => setPlaceOpen(true)} divider={false} />
          </View>
        ) : null}
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
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  typeGrid: {
    gap: DS_V3.space.sm,
  },
  typeRow: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  typeCell: {
    flex: 1,
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
  preview: {
    backgroundColor: DS_V3.color.canvas,
    borderRadius: DS_V3.radius.input,
    overflow: "hidden",
    marginHorizontal: -DS_V3.space.gutter,
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

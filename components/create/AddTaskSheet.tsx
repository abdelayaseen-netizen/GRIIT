/**
 * Add task sheet — frames 42 and 50.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { LocateFixed } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import ListRow from "@/components/ds/ListRow";
import SegmentedControl from "@/components/ds/SegmentedControl";
import Sheet from "@/components/ds/Sheet";
import TextField from "@/components/ds/TextField";
import TimeField from "@/components/ds/TimeField";
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
  ADD_TASK_LIMITS,
  ADD_TASK_ON_HOME,
  ADD_TASK_PHOTO,
  ADD_TASK_PHOTO_CAPTIONS,
  ADD_TASK_PHOTO_SEGMENTS,
  ADD_TASK_WHAT_YOU_DO,
  photoModeFromDraft,
  placePreviewLine,
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
import {
  ADD_TASK_PLACE_LIVE,
  betweenEndAfterStart,
  betweenHelper,
  byHelper,
  dateToHhmm,
  hhmmToDate,
  pickerWindowCaption,
  validate,
} from "@/lib/time-gate-picker";

const NAME_MAX = 60;
export const NAME_THIS_TASK = "Name this task.";
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
  const [picking, setPicking] = useState<null | "by" | "from" | "to">(null);
  const [pickRevert, setPickRevert] = useState<string | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [recent, setRecent] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (visible) {
      setDraft(initial ?? ADD_TASK_DEFAULT);
      setPlaceOpen(false);
      setPicking(null);
      setPickRevert(null);
    }
  }, [visible, initial]);

  const openPicker = useCallback((field: "by" | "from" | "to", current: string) => {
    setPickRevert(current);
    setPicking(field);
  }, []);

  const applyPicked = useCallback((hhmm: string) => {
    setDraft((d) => {
      if (picking === "from") return { ...d, fromTime: hhmm };
      if (picking === "to") return { ...d, toTime: hhmm };
      return { ...d, byTime: hhmm };
    });
  }, [picking]);

  const closePicker = useCallback((revert: boolean) => {
    if (revert && pickRevert != null) applyPicked(pickRevert);
    setPicking(null);
    setPickRevert(null);
  }, [applyPicked, pickRevert]);

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
      photoMode: row.photoMode,
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
          placeholderOpacity={0.7}
          accessibilityLabel={ADD_TASK_NAME_LABEL}
          maxLength={NAME_MAX}
        />
        {!draft.name.trim() ? <Text style={styles.nameHint}>{NAME_THIS_TASK}</Text> : null}

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

        <Text style={styles.section}>{ADD_TASK_PHOTO}</Text>
        <SegmentedControl
          items={[...ADD_TASK_PHOTO_SEGMENTS]}
          value={
            photoModeFromDraft(draft) === "required"
              ? "Required"
              : photoModeFromDraft(draft) === "optional"
                ? "Optional"
                : "None"
          }
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              photoMode: v === "Required" ? "required" : v === "Optional" ? "optional" : "none",
              camera: v === "Required",
            }))
          }
        />
        <Text style={styles.caption}>{ADD_TASK_PHOTO_CAPTIONS[photoModeFromDraft(draft)]}</Text>

        <Text style={styles.section}>{ADD_TASK_LIMITS}</Text>
        <View style={styles.chips}>
          <Chip
            label="Time window"
            variant="form"
            selected={draft.time}
            onPress={() => setDraft((d) => ({ ...d, time: !d.time }))}
          />
          <Chip
            label="Place"
            variant="form"
            selected={draft.location}
            onPress={() => setDraft((d) => ({ ...d, location: !d.location }))}
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
              <>
                <TimeField
                  label="By"
                  value={draft.byTime}
                  active={picking === "by"}
                  onPress={() => openPicker("by", draft.byTime)}
                />
                <Text style={styles.caption}>{byHelper(draft.byTime)}</Text>
              </>
            ) : (
              <>
                <TimeField
                  label="From"
                  value={draft.fromTime}
                  invalid={!betweenEndAfterStart(draft.fromTime, draft.toTime)}
                  active={picking === "from"}
                  onPress={() => openPicker("from", draft.fromTime)}
                />
                <TimeField
                  label="To"
                  value={draft.toTime}
                  invalid={!betweenEndAfterStart(draft.fromTime, draft.toTime)}
                  active={picking === "to"}
                  onPress={() => openPicker("to", draft.toTime)}
                />
                {!betweenEndAfterStart(draft.fromTime, draft.toTime) ? (
                  <Text style={styles.timeError}>{validate(draft.fromTime, draft.toTime)}</Text>
                ) : (
                  <Text style={styles.caption}>{betweenHelper(draft.fromTime, draft.toTime)}</Text>
                )}
              </>
            )}
          </View>
        ) : null}
        {draft.location ? (
          <View style={styles.place}>
            <ListRow
              title={canSavePlace(draft) ? placePreviewLine(draft) : ADD_TASK_PLACE_LIVE}
              subtitle={canSavePlace(draft) ? "Change" : undefined}
              onPress={() => setPlaceOpen(true)}
              divider={false}
            />
          </View>
        ) : null}

        <Text style={styles.label}>{ADD_TASK_ON_HOME}</Text>
        <View style={styles.preview}>
          <ListRow
            icon={<StatusRing row={previewRow} />}
            title={preview.title}
            subtitle={preview.caption}
            divider={false}
          />
        </View>
      </ScrollView>
      <Sheet
        visible={picking != null}
        onDismiss={() => closePicker(true)}
        heading={picking === "from" ? "From" : picking === "to" ? "To" : "By"}
        footer={
          <>
            <Button label="Done" onPress={() => closePicker(false)} />
            <Button
              label="Cancel"
              variant="tertiary"
              onPress={() => closePicker(true)}
            />
          </>
        }
      >
        <DateTimePicker
          value={hhmmToDate(
            picking === "from"
              ? draft.fromTime
              : picking === "to"
                ? draft.toTime
                : draft.byTime,
          )}
          mode="time"
          display="spinner"
          is24Hour={false}
          locale={Platform.OS === "ios" ? "en_US" : undefined}
          onChange={(_, next) => {
            if (!next) return;
            applyPicked(dateToHhmm(next));
          }}
        />
        {draft.timeMode === "between" ? (
          <Text style={styles.caption}>
            {pickerWindowCaption(draft.fromTime, draft.toTime)}
          </Text>
        ) : null}
      </Sheet>
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
  nameHint: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    marginTop: -DS_V3.space.sm,
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
  proofs: {
    gap: DS_V3.space.sm,
  },
  proof: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  radio: {
    width: ICON,
    height: ICON,
    borderRadius: DS_V3.radius.pill,
    borderWidth: (DS_V3.space.xs * 3) / 8,
    borderColor: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.xs,
  },
  radioOn: {
    backgroundColor: DS_V3.color.brand,
    borderColor: DS_V3.color.brand,
  },
  proofCopy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
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
  timeError: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
  place: {
    marginHorizontal: -DS_V3.space.gutter,
  },
});

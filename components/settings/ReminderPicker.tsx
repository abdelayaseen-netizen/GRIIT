import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  DEFAULT_CUSTOM_DRAFT,
  REMINDER_PRESETS,
  formatReminderTimeLong,
  reminderTimeText,
  type ReminderCustom,
  type ReminderMeridiem,
  type ReminderMinute,
  type ReminderPresetId,
} from "@/lib/onboarding-v2-reminders";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES: ReminderMinute[] = ["00", "15", "30", "45"];

export function ReminderPicker({
  preset,
  custom,
  onChange,
}: {
  preset: ReminderPresetId;
  custom: ReminderCustom | null;
  onChange: (preset: ReminderPresetId, custom: ReminderCustom | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReminderCustom>(custom ?? DEFAULT_CUSTOM_DRAFT);

  return (
    <View>
      <Text style={styles.send}>SEND IT AT</Text>
      {open ? (
        <View>
          <Text style={styles.draft}>{formatReminderTimeLong(draft)}</Text>
          <View style={styles.merRow}>
            {(["AM", "PM"] as ReminderMeridiem[]).map((mer) => (
              <Pressable
                key={mer}
                onPress={() => setDraft((d) => ({ ...d, mer }))}
                style={[styles.mer, draft.mer === mer && styles.on]}
                accessibilityRole="button"
              >
                <Text style={[styles.merTxt, draft.mer === mer && styles.onTxt]}>{mer}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.gridLabel}>HOUR</Text>
          <View style={styles.grid}>
            {HOURS.map((h) => (
              <Pressable
                key={h}
                onPress={() => setDraft((d) => ({ ...d, h }))}
                style={[styles.cell, draft.h === h && styles.cellOn]}
                accessibilityRole="button"
              >
                <Text style={[styles.cellTxt, draft.h === h && styles.onTxt]}>{h}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.gridLabel}>MINUTES</Text>
          <View style={styles.minGrid}>
            {MINUTES.map((m) => (
              <Pressable
                key={m}
                onPress={() => setDraft((d) => ({ ...d, m }))}
                style={[styles.cell, styles.min, draft.m === m && styles.cellOn]}
                accessibilityRole="button"
              >
                <Text style={[styles.cellTxt, draft.m === m && styles.onTxt]}>:{m}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => setOpen(false)} style={styles.linkHit}>
              <Text style={styles.link}>Back to presets</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onChange("custom", draft);
                setOpen(false);
              }}
              style={styles.use}
            >
              <Text style={styles.useTxt}>Use {formatReminderTimeLong(draft)}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.presets}>
            {REMINDER_PRESETS.map((p) => {
              const on = preset === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onChange(p.id, custom);
                  }}
                  style={[styles.preset, on && styles.presetOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.presetH, on && styles.onTxt]}>{p.h}:00</Text>
                  <Text style={[styles.presetMer, on && styles.onTxt]}>{p.mer}</Text>
                </Pressable>
              );
            })}
          </View>
          {preset === "custom" && custom ? (
            <Pressable onPress={() => { setDraft(custom); setOpen(true); }} style={styles.customSaved}>
              <Text style={styles.customLabel}>CUSTOM</Text>
              <Text style={styles.customTime}>{reminderTimeText("custom", custom)}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              setDraft(custom ?? DEFAULT_CUSTOM_DRAFT);
              setOpen(true);
            }}
            style={styles.linkHit}
          >
            <Text style={styles.link}>Pick a custom time</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  send: { fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight, marginBottom: 10 },
  presets: { flexDirection: "row", gap: 7 },
  preset: {
    flex: 1,
    height: 56,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  presetOn: { backgroundColor: PROFILE_V2_COLOR.ink, borderColor: PROFILE_V2_COLOR.ink },
  presetH: { fontSize: 15, color: PROFILE_V2_COLOR.ink },
  presetMer: { fontSize: 10, color: PROFILE_V2_COLOR.ink, opacity: 0.65 },
  onTxt: { color: PROFILE_V2_COLOR.surface },
  customSaved: {
    marginTop: 10,
    height: 48,
    borderRadius: 15,
    backgroundColor: PROFILE_V2_COLOR.ink,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customLabel: { fontSize: 11, letterSpacing: 0.7, color: PROFILE_V2_COLOR.mutedLight },
  customTime: { fontSize: 15, color: PROFILE_V2_COLOR.surface },
  linkHit: { minHeight: 44, justifyContent: "center" },
  link: { fontSize: 13, color: PROFILE_V2_COLOR.muted, textDecorationLine: "underline" },
  draft: { fontSize: 26, fontWeight: "500", letterSpacing: -0.8, color: PROFILE_V2_COLOR.ink },
  merRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  mer: {
    width: 46,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    alignItems: "center",
    justifyContent: "center",
  },
  on: { backgroundColor: PROFILE_V2_COLOR.ink, borderColor: PROFILE_V2_COLOR.ink },
  merTxt: { fontSize: 13, color: PROFILE_V2_COLOR.ink },
  gridLabel: { marginTop: 12, fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  minGrid: { flexDirection: "row", gap: 6, marginTop: 8 },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_V2_COLOR.sunken,
  },
  min: { flex: 1 },
  cellOn: { backgroundColor: PROFILE_V2_COLOR.orange },
  cellTxt: { fontSize: 14, color: PROFILE_V2_COLOR.ink },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  use: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: PROFILE_V2_COLOR.ink,
    justifyContent: "center",
  },
  useTxt: { fontSize: 13, color: PROFILE_V2_COLOR.surface },
});

import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { requestNotificationPermissions, scheduleNextSecureReminder } from "@/lib/notifications";
import { useOnboardingStore } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";
import {
  DEFAULT_CUSTOM_DRAFT,
  REMINDER_PRESETS,
  formatReminderTimeLong,
  notificationBody,
  reminderTime24h,
  reminderTimeShort,
  reminderTimeText,
  type ReminderCustom,
  type ReminderMeridiem,
  type ReminderMinute,
  type ReminderPresetId,
} from "@/lib/onboarding-v2-reminders";
import { OBV2_COLOR } from "../theme";
import { LogoMark, PrimaryButton, TextLink } from "../ui";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES: ReminderMinute[] = ["00", "15", "30", "45"];

export default function RemindersScreen({ onContinue }: { onContinue: () => void }) {
  const setNotificationsAsked = useOnboardingStore((s) => s.setNotificationsAsked);
  const reminderPreset = useOnboardingStore((s) => s.reminderPreset);
  const reminderCustom = useOnboardingStore((s) => s.reminderCustom);
  const setReminderPreset = useOnboardingStore((s) => s.setReminderPreset);
  const setReminderCustom = useOnboardingStore((s) => s.setReminderCustom);
  const setRemindersEnabled = useOnboardingStore((s) => s.setRemindersEnabled);
  const challengeName = useOnboardingStore((s) => s.selectedChallengeTitle);
  const taskCount = useOnboardingStore((s) => s.selectedChallengeTaskCount);

  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState<ReminderCustom>(reminderCustom ?? DEFAULT_CUSTOM_DRAFT);

  const openCustom = useCallback(() => {
    setDraft(reminderCustom ?? draft ?? DEFAULT_CUSTOM_DRAFT);
    setCustomOpen(true);
  }, [reminderCustom, draft]);

  const useDraft = useCallback(() => {
    setReminderCustom(draft);
    setReminderPreset("custom");
    setCustomOpen(false);
  }, [draft, setReminderCustom, setReminderPreset]);

  const backToPresets = useCallback(() => {
    setCustomOpen(false);
  }, []);

  const pickPreset = useCallback(
    (id: Exclude<ReminderPresetId, "custom">) => {
      setReminderPreset(id);
    },
    [setReminderPreset]
  );

  const handleEnable = useCallback(async () => {
    let granted = false;
    try {
      granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleNextSecureReminder(reminderTime24h(reminderPreset, reminderCustom));
      }
    } finally {
      track({ name: "notifications_prompt_result", granted });
      setNotificationsAsked(true);
      setRemindersEnabled(granted);
      onContinue();
    }
  }, [
    reminderPreset,
    reminderCustom,
    setNotificationsAsked,
    setRemindersEnabled,
    onContinue,
  ]);

  const handleLater = useCallback(() => {
    track({ name: "notifications_prompt_result", granted: false });
    setNotificationsAsked(true);
    setRemindersEnabled(false);
    onContinue();
  }, [setNotificationsAsked, setRemindersEnabled, onContinue]);

  const timeShort = reminderTimeShort(reminderPreset, reminderCustom);
  const body = notificationBody(challengeName, taskCount);
  const draftText = formatReminderTimeLong(draft);

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>We&apos;ll nudge you.{"\n"}Never nag.</Text>
        <Text style={styles.sub}>
          One reminder a day, at a time you pick. Turn it off whenever — that&apos;s the deal.
        </Text>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.preview}>
          <View style={styles.appIcon}>
            <LogoMark size="icon" />
          </View>
          <View style={styles.previewText}>
            <Text style={styles.previewTitle}>GRIIT</Text>
            <Text style={styles.previewBody}>{body}</Text>
          </View>
          <Text style={styles.previewTime}>{timeShort}</Text>
        </View>

        <Text style={styles.sendLabel}>SEND IT AT</Text>

        {customOpen ? (
          <View style={styles.customPanel}>
            <View style={styles.customHead}>
              <Text style={styles.draftReadout}>{draftText}</Text>
              <View style={styles.merRow}>
                {(["AM", "PM"] as ReminderMeridiem[]).map((mer) => {
                  const on = draft.mer === mer;
                  return (
                    <Pressable
                      key={mer}
                      onPress={() => setDraft((d) => ({ ...d, mer }))}
                      style={[styles.merBtn, on && styles.merBtnOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={mer}
                    >
                      <Text style={[styles.merText, on && styles.merTextOn]}>{mer}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.gridLabel}>HOUR</Text>
            <View style={styles.hourGrid}>
              {HOURS.map((h) => {
                const on = draft.h === h;
                return (
                  <Pressable
                    key={h}
                    onPress={() => setDraft((d) => ({ ...d, h }))}
                    style={[styles.gridBtn, on && styles.gridBtnOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${h} o'clock`}
                  >
                    <Text style={[styles.gridBtnText, on && styles.gridBtnTextOn]}>{h}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.gridLabel}>MINUTES</Text>
            <View style={styles.minGrid}>
              {MINUTES.map((m) => {
                const on = draft.m === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setDraft((d) => ({ ...d, m }))}
                    style={[styles.gridBtn, styles.minBtn, on && styles.gridBtnOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${m} minutes`}
                  >
                    <Text style={[styles.gridBtnText, on && styles.gridBtnTextOn]}>:{m}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.customActions}>
              <Pressable
                onPress={backToPresets}
                style={styles.backPresets}
                accessibilityRole="button"
                accessibilityLabel="Back to presets"
              >
                <Text style={styles.backPresetsText}>Back to presets</Text>
              </Pressable>
              <Pressable
                onPress={useDraft}
                style={styles.useDraft}
                accessibilityRole="button"
                accessibilityLabel={`Use ${draftText}`}
              >
                <Text style={styles.useDraftText}>Use {draftText}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.presetRow}>
              {REMINDER_PRESETS.map((p) => {
                const on = reminderPreset === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => pickPreset(p.id)}
                    style={[styles.preset, on && styles.presetOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${p.h} ${p.mer}`}
                  >
                    <Text style={[styles.presetH, on && styles.presetOnText]}>{p.h}:00</Text>
                    <Text style={[styles.presetMer, on && styles.presetOnText]}>{p.mer}</Text>
                  </Pressable>
                );
              })}
            </View>
            {reminderPreset === "custom" && reminderCustom ? (
              <Pressable
                onPress={openCustom}
                style={styles.customSaved}
                accessibilityRole="button"
                accessibilityLabel={`Custom time ${reminderTimeText("custom", reminderCustom)}`}
              >
                <Text style={styles.customSavedLabel}>CUSTOM</Text>
                <Text style={styles.customSavedTime}>{reminderTimeText("custom", reminderCustom)}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={openCustom}
              accessibilityRole="button"
              accessibilityLabel="Pick a custom time"
              style={styles.customLinkWrap}
            >
              <Text style={styles.customLink}>Pick a custom time</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Turn on reminders" onPress={() => void handleEnable()} />
        <TextLink label="No reminders for now" onPress={handleLater} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  bodyScroll: { flex: 1 },
  body: { flexGrow: 1, justifyContent: "center", paddingVertical: 16, gap: 16 },
  preview: {
    backgroundColor: OBV2_COLOR.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: OBV2_COLOR.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: OBV2_COLOR.blackBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { flex: 1 },
  previewTitle: { fontSize: 14, fontWeight: "500", color: OBV2_COLOR.ink },
  previewBody: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: OBV2_COLOR.ink2, marginTop: 2 },
  previewTime: { alignSelf: "flex-start", fontSize: 12, color: OBV2_COLOR.mutedWarm },
  sendLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 0.8, color: OBV2_COLOR.ink },
  presetRow: { flexDirection: "row", gap: 7 },
  preset: {
    flex: 1,
    minHeight: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    backgroundColor: OBV2_COLOR.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  presetOn: { backgroundColor: OBV2_COLOR.blackBtn, borderColor: OBV2_COLOR.blackBtn },
  presetH: { fontSize: 15, fontWeight: "500", color: OBV2_COLOR.ink },
  presetMer: { fontSize: 10, fontWeight: "500", letterSpacing: 0.5, color: OBV2_COLOR.ink, opacity: 0.65 },
  presetOnText: { color: OBV2_COLOR.onDark },
  customSaved: {
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: OBV2_COLOR.blackBtn,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customSavedLabel: { fontSize: 11, fontWeight: "500", letterSpacing: 0.7, color: OBV2_COLOR.mutedWarm },
  customSavedTime: { fontSize: 15, fontWeight: "500", color: OBV2_COLOR.onDark },
  customLinkWrap: { minHeight: 44, justifyContent: "center" },
  customLink: { fontSize: 13, fontWeight: "500", color: OBV2_COLOR.ink2, textDecorationLine: "underline" },
  customPanel: {
    backgroundColor: OBV2_COLOR.card,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  customHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  draftReadout: { fontSize: 26, fontWeight: "500", letterSpacing: -0.8, color: OBV2_COLOR.ink },
  merRow: { flexDirection: "row", gap: 6 },
  merBtn: {
    width: 46,
    height: 34,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OBV2_COLOR.card,
  },
  merBtnOn: { backgroundColor: OBV2_COLOR.blackBtn, borderColor: OBV2_COLOR.blackBtn },
  merText: { fontSize: 13, fontWeight: "500", color: OBV2_COLOR.ink },
  merTextOn: { color: OBV2_COLOR.onDark },
  gridLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 0.7, color: OBV2_COLOR.mutedWarm },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  minGrid: { flexDirection: "row", gap: 5 },
  gridBtn: {
    width: "15.2%",
    minHeight: 44,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    backgroundColor: OBV2_COLOR.card,
    alignItems: "center",
    justifyContent: "center",
  },
  minBtn: { flex: 1, width: undefined },
  gridBtnOn: { backgroundColor: OBV2_COLOR.orange, borderColor: OBV2_COLOR.orange },
  gridBtnText: { fontSize: 13, fontWeight: "500", color: OBV2_COLOR.ink },
  gridBtnTextOn: { color: OBV2_COLOR.onDark },
  customActions: { flexDirection: "row", gap: 8, marginTop: 2 },
  backPresets: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: OBV2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  backPresetsText: { fontSize: 14, fontWeight: "500", color: OBV2_COLOR.ink2 },
  useDraft: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: OBV2_COLOR.blackBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  useDraftText: { fontSize: 14, fontWeight: "500", color: OBV2_COLOR.onDark },
  footer: { paddingTop: 14, paddingBottom: 32, gap: 2 },
});

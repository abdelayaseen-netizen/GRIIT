import React, { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { BellOff, Shield } from "lucide-react-native";
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  scheduleNextSecureReminder,
} from "@/lib/notifications";
import { v2MayPromptNotificationPermission } from "@/lib/onboarding-v2-notifications";
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
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import { ChromePrimary, OnboardingScreen, TextLink } from "../OnboardingChrome";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES: ReminderMinute[] = ["00", "15", "30", "45"];
const ICON = DS_V3.space.xs * 6;
const TILE = DS_V3.space.gutter * 2;
const PT = DS_V3.space.xs / 4;
const PT_SELECTED = PT * 1.5;

export default function RemindersScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
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
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getNotificationPermissionStatus().then((status) => {
      if (!cancelled && status === "denied") setDenied(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCustom = useCallback(() => {
    if (denied) return;
    setDraft(reminderCustom ?? draft ?? DEFAULT_CUSTOM_DRAFT);
    setCustomOpen(true);
  }, [denied, reminderCustom, draft]);

  const useDraft = useCallback(() => {
    setReminderCustom(draft);
    setReminderPreset("custom");
    setCustomOpen(false);
  }, [draft, setReminderCustom, setReminderPreset]);

  const pickPreset = useCallback(
    (id: Exclude<ReminderPresetId, "custom">) => {
      if (denied) return;
      setReminderPreset(id);
    },
    [denied, setReminderPreset]
  );

  const finish = useCallback(
    (granted: boolean) => {
      track({ name: "notifications_prompt_result", granted });
      setNotificationsAsked(true);
      setRemindersEnabled(granted);
      onContinue();
    },
    [setNotificationsAsked, setRemindersEnabled, onContinue]
  );

  const handleEnable = useCallback(async () => {
    let granted = false;
    try {
      if (v2MayPromptNotificationPermission("reminders_cta")) {
        granted = await requestNotificationPermissions();
      }
      if (granted) {
        await scheduleNextSecureReminder(reminderTime24h(reminderPreset, reminderCustom));
        finish(true);
        return;
      }
      setDenied(true);
    } catch {
      setDenied(true);
    }
  }, [reminderPreset, reminderCustom, finish]);

  const handleLater = useCallback(() => {
    finish(false);
  }, [finish]);

  const timeShort = reminderTimeShort(reminderPreset, reminderCustom);
  const total = taskCount > 0 ? taskCount : 0;
  const body = notificationBody(challengeName, total, total);
  const draftText = formatReminderTimeLong(draft);

  const footer = denied ? (
    <>
      <ChromePrimary label="Open Settings" onPress={() => void Linking.openSettings()} />
      <TextLink label="Continue without reminders" onPress={handleLater} />
    </>
  ) : (
    <>
      <ChromePrimary label="Turn on reminders" onPress={() => void handleEnable()} />
      <TextLink label="No reminders for now" onPress={handleLater} />
    </>
  );

  return (
    <OnboardingScreen
      step={5}
      onBack={onBack}
      title="One reminder a day."
      subtitle="It tells you what is still open. Turn it off in Settings whenever you want."
      footer={footer}
    >
      <View style={styles.previewWrap}>
        {denied ? (
          <Card>
            <View style={styles.deniedRow}>
              <BellOff size={ICON} color={DS_V3.color.textPrimary} />
              <View style={styles.deniedCopy}>
                <Text style={styles.deniedTitle}>Notifications are off for GRIIT</Text>
                <Text style={styles.deniedBody}>
                  iOS is blocking them, so nothing can be sent. Turn them on in Settings and the time
                  you pick here will be used.
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <View style={styles.preview}>
            <View style={styles.appIcon}>
              <Shield size={DS_V3.space.gutter} color={DS_V3.color.brandText} />
            </View>
            <View style={styles.previewText}>
              <Text style={styles.previewTitle}>GRIIT</Text>
              <Text style={styles.previewBody}>{body}</Text>
            </View>
            <Text style={styles.previewTime}>{timeShort}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sendLabel}>Send it at</Text>
      <View style={[styles.presetRow, denied && styles.dim]}>
        {REMINDER_PRESETS.map((p) => {
          const on = reminderPreset === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => pickPreset(p.id)}
              disabled={denied}
              style={[styles.preset, on ? styles.presetOn : styles.presetOff]}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: denied }}
              accessibilityLabel={`${p.h} ${p.mer}`}
            >
              <Text style={[styles.presetH, on && styles.presetOnText]}>{p.h}:00</Text>
              <Text style={[styles.presetMer, on && styles.presetOnText]}>{p.mer}</Text>
            </Pressable>
          );
        })}
      </View>

      {denied ? null : customOpen ? (
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
          <Text style={styles.gridLabel}>Hour</Text>
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
          <Text style={styles.gridLabel}>Minutes</Text>
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
            <TextLink label="Back to presets" onPress={() => setCustomOpen(false)} />
            <TextLink
              label={`Use ${draftText}`}
              tone={DS_V3.color.brandText}
              onPress={useDraft}
            />
          </View>
          {reminderPreset === "custom" && reminderCustom ? (
            <Text style={styles.customSaved}>{reminderTimeText("custom", reminderCustom)}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.customLink}>
          <TextLink label="Pick a custom time" tone={DS_V3.color.brandText} onPress={openCustom} />
        </View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  previewWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  preview: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingVertical: DS_V3.space.md + DS_V3.space.xs / 2,
    paddingHorizontal: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  appIcon: {
    width: TILE,
    height: TILE,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { flex: 1, gap: 2 },
  previewTitle: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  previewBody: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  previewTime: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  deniedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.lg,
  },
  deniedCopy: { flex: 1, gap: DS_V3.space.xs },
  deniedTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  deniedBody: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  sendLabel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  presetRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  dim: { opacity: 0.5 },
  preset: {
    flex: 1,
    minHeight: 60,
    borderRadius: DS_V3.radius.input,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  presetOff: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  presetOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.brand,
  },
  presetH: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  presetMer: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  presetOnText: { color: DS_V3.color.brandText },
  customLink: {
    paddingHorizontal: DS_V3.space.gutter,
  },
  customPanel: {
    marginHorizontal: DS_V3.space.gutter,
    marginTop: DS_V3.space.sm,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  customHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  draftReadout: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  merRow: { flexDirection: "row", gap: DS_V3.space.sm },
  merBtn: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_V3.color.surface,
  },
  merBtnOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.brand,
  },
  merText: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  merTextOn: { color: DS_V3.color.brandText },
  gridLabel: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: DS_V3.space.xs },
  minGrid: { flexDirection: "row", gap: DS_V3.space.xs },
  gridBtn: {
    width: "15.2%",
    minHeight: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  minBtn: { flex: 1, width: undefined },
  gridBtnOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.brand,
  },
  gridBtnText: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  gridBtnTextOn: { color: DS_V3.color.brandText },
  customActions: { flexDirection: "row", justifyContent: "space-between" },
  customSaved: {
    fontSize: DS_V3.type.caption.fontSize,
    color: DS_V3.color.textSecondary,
  },
});

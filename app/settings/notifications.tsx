import React, { useCallback, useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import {
  parseReminderTime24h,
  reminderTime24h,
  type ReminderCustom,
  type ReminderPresetId,
} from "@/lib/onboarding-v2-reminders";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ReminderPicker } from "@/components/settings/ReminderPicker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GriitFade } from "@/components/profile-v2/GriitFade";

export default function SettingsNotificationsScreen() {
  const isGuest = useIsGuest();
  const [enabled, setEnabled] = useState(true);
  const [preset, setPreset] = useState<ReminderPresetId>("am6");
  const [custom, setCustom] = useState<ReminderCustom | null>(null);
  const [lastCall, setLastCall] = useState(true);
  const [circle, setCircle] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [osDenied, setOsDenied] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    void Notifications.getPermissionsAsync()
      .then(({ status }) => setOsDenied(status === "denied"))
      .catch((e) => captureError(e, "SettingsNotificationsPermission"));
  }, []);

  const load = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = (await trpcQuery(TRPC.notifications.getReminderSettings)) as {
        reminder_time?: string;
        enabled?: boolean;
        last_call_enabled?: boolean;
        friend_activity_enabled?: boolean;
        weekly_summary_enabled?: boolean;
      };
      setEnabled(data?.enabled !== false);
      const parsed = parseReminderTime24h(data?.reminder_time ?? "06:00");
      setPreset(parsed.preset);
      setCustom(parsed.custom);
      setLastCall(data?.last_call_enabled !== false);
      setCircle(data?.friend_activity_enabled !== false);
      setWeekly(data?.weekly_summary_enabled === true);
    } catch (e) {
      captureError(e, "SettingsNotificationsLoad");
    }
  }, [isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = async (patch: Record<string, unknown>) => {
    if (isGuest) return;
    try {
      await trpcMutate(TRPC.notifications.updateReminderSettings, patch);
    } catch (e) {
      captureError(e, "SettingsNotificationsSave");
      void load();
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Notifications" />
        <GriitFade fadeKey="notifications">
        <ScrollView contentContainerStyle={styles.body}>
          {osDenied ? (
            <View style={styles.osBanner}>
              <Text style={styles.osBannerTxt}>Notifications are off in iOS Settings</Text>
              <Pressable
                onPress={() => void Linking.openSettings()}
                accessibilityRole="button"
                accessibilityLabel="Open Settings"
                style={styles.osBannerBtn}
              >
                <Text style={styles.osBannerBtnTxt}>Open Settings</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={[styles.card, osDenied && styles.disabled]} pointerEvents={osDenied ? "none" : "auto"}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Daily reminder</Text>
                <Text style={styles.sub}>One push a day if today has no verified proof yet.</Text>
              </View>
              <Switch
                value={enabled}
                disabled={osDenied}
                onValueChange={(v) => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEnabled(v);
                  void persist({ enabled: v });
                  if (v) void registerPushTokenWithBackend();
                }}
                trackColor={{ false: PROFILE_V2_COLOR.track, true: PROFILE_V2_COLOR.orange }}
              />
            </View>
            {enabled ? (
              <>
                <View style={styles.hr} />
                <ReminderPicker
                  preset={preset}
                  custom={custom}
                  onChange={(p, c) => {
                    setPreset(p);
                    setCustom(c);
                    void persist({ reminder_time: reminderTime24h(p, c) });
                  }}
                />
              </>
            ) : null}
          </View>

          <Text style={styles.group}>OTHER PUSHES</Text>
          <View style={[styles.card, osDenied && styles.disabled]} pointerEvents={osDenied ? "none" : "auto"}>
            <Toggle
              label="Last call"
              sub="60 minutes before the day resets, only if the day is unverified."
              value={lastCall}
              disabled={osDenied}
              onChange={(v) => {
                setLastCall(v);
                void persist({ last_call_enabled: v });
              }}
            />
            <Toggle
              label="Circle activity"
              sub="When someone in your circle verifies a day."
              value={circle}
              disabled={osDenied}
              onChange={(v) => {
                setCircle(v);
                void persist({ friend_activity_enabled: v });
              }}
            />
            <Toggle
              label="Weekly summary"
              sub="Sunday: days verified, days missed, streak state."
              value={weekly}
              disabled={osDenied}
              onChange={(v) => {
                setWeekly(v);
                void persist({ weekly_summary_enabled: v });
              }}
              last
            />
          </View>
          <Text style={styles.foot}>
            Turning the system permission off in iOS Settings silences all of these, and GRIIT will show that state here.
          </Text>
        </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function Toggle({
  label,
  sub,
  value,
  onChange,
  last,
  disabled,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!value);
      }}
      style={[styles.toggleRow, !last && styles.hr]}
      accessibilityState={{ disabled }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: PROFILE_V2_COLOR.track, true: PROFILE_V2_COLOR.orange }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40 },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  label: { fontSize: 15, color: PROFILE_V2_COLOR.ink },
  sub: { marginTop: 2, fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
  hr: { borderBottomWidth: 1, borderBottomColor: PROFILE_V2_COLOR.sunken, marginVertical: 12, paddingBottom: 12 },
  group: { marginTop: 22, marginBottom: 8, fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight },
  foot: { marginTop: 14, fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
  disabled: { opacity: 0.5 },
  osBanner: {
    backgroundColor: PROFILE_V2_COLOR.sunken,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  osBannerTxt: { fontSize: 14, color: PROFILE_V2_COLOR.ink },
  osBannerBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: PROFILE_V2_COLOR.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  osBannerBtnTxt: { fontSize: 14, color: PROFILE_V2_COLOR.surface },
});

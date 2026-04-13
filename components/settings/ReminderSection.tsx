import React from "react";
import { View, Text, TouchableOpacity, Switch, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS } from "@/lib/design-system";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import {
  cancelMorningMotivation,
  scheduleMorningMotivation,
  cancelWeeklySummary,
  scheduleWeeklySummary,
} from "@/lib/notifications";
import { countSecuredLast7Days } from "@/lib/date-utils";
import { deriveUserRank } from "@/lib/derive-user-rank";
import type { StatsFromApi } from "@/types";
import { useNotificationPrefsStore } from "@/store/notificationPrefsStore";

import { styles } from "@/components/settings/settings-styles";

export const REMINDER_PRESETS = [
  { label: "6:00 AM", value: "06:00" },
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
];

export interface ReminderSectionProps {
  isGuest: boolean;
  reminderLoading: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  lastCall: boolean;
  morningKickoff: boolean;
  weeklySummary: boolean;
  friendActivity: boolean;
  stats: StatsFromApi | null;
  activeChallenge: unknown;
  currentChallenge: unknown;
  setLastCall: (v: boolean) => void;
  setMorningKickoff: (v: boolean) => void;
  setWeeklySummary: (v: boolean) => void;
  setFriendActivity: (v: boolean) => void;
  handleReminderToggle: (v: boolean) => Promise<void>;
  handleReminderTime: (value: string) => Promise<void>;
}

export function ReminderSection({
  isGuest,
  reminderLoading,
  dailyReminder,
  reminderTime,
  lastCall,
  morningKickoff,
  weeklySummary,
  friendActivity,
  stats,
  activeChallenge,
  currentChallenge,
  setLastCall,
  setMorningKickoff,
  setWeeklySummary,
  setFriendActivity,
  handleReminderToggle,
  handleReminderTime,
}: ReminderSectionProps) {
  const lockScreenTimer = useNotificationPrefsStore((s) => s.lockScreenTimer);
  const setLockScreenTimer = useNotificationPrefsStore((s) => s.setLockScreenTimer);
  const showActiveTaskCard = useNotificationPrefsStore((s) => s.showActiveTaskCard);
  const setShowActiveTaskCard = useNotificationPrefsStore((s) => s.setShowActiveTaskCard);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitleFriends, { color: DS_COLORS.textPrimary }]}>🔔 Notifications</Text>
      <View style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Daily Reminder</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>Remind if not started by evening</Text>
          </View>
          {reminderLoading ? (
            <ActivityIndicator size="small" color={DS_COLORS.accent} />
          ) : (
            <Switch
              value={dailyReminder}
              onValueChange={handleReminderToggle}
              trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
              thumbColor={dailyReminder ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
              accessibilityLabel="Toggle daily reminder"
              accessibilityRole="switch"
            />
          )}
        </View>
        {!reminderLoading && dailyReminder && (
          <>
            <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Reminder time</Text>
              <View style={styles.reminderPillsRow}>
                {REMINDER_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => void handleReminderTime(p.value)}
                    style={[
                      styles.reminderPill,
                      { backgroundColor: DS_COLORS.border + "40" },
                      reminderTime === p.value && { backgroundColor: DS_COLORS.accent },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Set reminder time to ${p.label}`}
                    accessibilityState={{ selected: reminderTime === p.value }}
                  >
                    <Text
                      style={[
                        styles.reminderPillText,
                        { color: DS_COLORS.textSecondary },
                        reminderTime === p.value && styles.reminderPillTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Lock screen timer</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>
              Show task timer on lock screen while a task is in progress.
            </Text>
          </View>
          <Switch
            value={lockScreenTimer}
            onValueChange={(v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLockScreenTimer(v);
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={lockScreenTimer ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle lock screen task timer"
            accessibilityRole="switch"
          />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Home screen card</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>
              Show the in-progress task card on the Home tab.
            </Text>
          </View>
          <Switch
            value={showActiveTaskCard}
            onValueChange={(v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowActiveTaskCard(v);
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={showActiveTaskCard ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle in-progress task card on Home"
            accessibilityRole="switch"
          />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Last Call</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>60 minutes before day resets</Text>
          </View>
          <Switch
            value={lastCall}
            onValueChange={async (v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const prev = lastCall;
              setLastCall(v);
              if (isGuest) return;
              try {
                await trpcMutate(TRPC.notifications.updateReminderSettings, { last_call_enabled: v });
              } catch (e) {
                captureError(e, "SettingsLastCallToggle");
                setLastCall(prev);
              }
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={lastCall ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle last call reminder"
            accessibilityRole="switch"
          />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Morning Kickoff</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>Motivational push each morning</Text>
          </View>
          <Switch
            value={morningKickoff}
            onValueChange={async (v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMorningKickoff(v);
              if (!v) {
                await cancelMorningMotivation();
              } else if (Platform.OS !== "web") {
                const taskCount = (currentChallenge as { tasks?: unknown[] } | null)?.tasks?.length ?? 0;
                const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
                const challengeTitle = (activeChallenge as { challenges?: { title?: string } } | null)?.challenges?.title;
                await scheduleMorningMotivation({
                  morningTime: "07:00",
                  streakCount: stats?.activeStreak ?? 0,
                  taskCount,
                  currentDay,
                  challengeName: challengeTitle,
                });
              }
              if (!isGuest) {
                await trpcMutate(TRPC.notifications.updateReminderSettings, { morning_kickoff_enabled: v }).catch((e) => {
                  captureError(e, "SettingsMorningKickoffTRPC");
                });
              }
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={morningKickoff ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle morning kickoff notification"
            accessibilityRole="switch"
          />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Weekly Summary</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>Sunday recap of your week</Text>
          </View>
          <Switch
            value={weeklySummary}
            onValueChange={async (v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setWeeklySummary(v);
              if (!v) {
                await cancelWeeklySummary();
              } else if (Platform.OS !== "web" && !isGuest) {
                const keys = (await trpcQuery(TRPC.profiles.getSecuredDateKeys).catch(() => [])) as string[];
                const s = stats;
                await scheduleWeeklySummary({
                  daysSecuredThisWeek: countSecuredLast7Days(Array.isArray(keys) ? keys : []),
                  totalDaysThisWeek: 7,
                  points: (s?.totalDaysSecured ?? 0) * 5,
                  rank: deriveUserRank(s),
                  streakCount: s?.activeStreak ?? 0,
                });
              }
              if (!isGuest) {
                await trpcMutate(TRPC.notifications.updateReminderSettings, { weekly_summary_enabled: v }).catch((e) => {
                  captureError(e, "SettingsWeeklySummaryTRPC");
                });
              }
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={weeklySummary ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle weekly summary notification"
            accessibilityRole="switch"
          />
        </View>
        <View style={[styles.cardDivider, { backgroundColor: DS_COLORS.border }]} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Friend Activity</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>When friends respect or secure</Text>
          </View>
          <Switch
            value={friendActivity}
            onValueChange={async (v) => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const prev = friendActivity;
              setFriendActivity(v);
              if (isGuest) return;
              try {
                await trpcMutate(TRPC.notifications.updateReminderSettings, { friend_activity_enabled: v });
              } catch (e) {
                captureError(e, "SettingsFriendActivityToggle");
                setFriendActivity(prev);
              }
            }}
            trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
            thumbColor={friendActivity ? DS_COLORS.white : DS_COLORS.switchThumbInactive}
            accessibilityLabel="Toggle friend activity notifications"
            accessibilityRole="switch"
          />
        </View>
      </View>
    </View>
  );
}

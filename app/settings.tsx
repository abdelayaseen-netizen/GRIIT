import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Crown, User, LogOut, FileText } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { supabase } from "@/lib/supabase";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { PremiumBadge } from "@/components/PremiumBadge";
import { restorePurchases } from "@/lib/subscription";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import {
  cancelLapsedUserReminders,
  cancelMorningMotivation,
  scheduleMorningMotivation,
  cancelWeeklySummary,
  scheduleWeeklySummary,
} from "@/lib/notifications";
import { countSecuredLast7Days } from "@/lib/date-utils";
import { deriveUserRank } from "@/lib/derive-user-rank";
import type { StatsFromApi } from "@/types";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";
import { runClientSignOutCleanup } from "@/lib/signout-cleanup";

const REMINDER_PRESETS = [
  { label: "6:00 AM", value: "06:00" },
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
];


const CONSEQUENCES = [
  { bulletColor: DS_COLORS.warning, title: "Miss 1 day", sub: "Streak breaks (unless grace used)" },
  { bulletColor: DS_COLORS.accent, title: "Miss 3 in 7 days", sub: "On Thin Ice warning state" },
  { bulletColor: DS_COLORS.danger, title: "Miss 7 days", sub: "Challenge auto-paused, tier drops" },
  { bulletColor: DS_COLORS.danger, title: "Miss 14 days", sub: "Full reset, must rebuild 7 days" },
] as const;

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

type VisibilityValue = "public" | "friends" | "private";

function VisibilitySubsection({
  label,
  value,
  onChange,
}: {
  label: string;
  value: VisibilityValue;
  onChange: (v: VisibilityValue) => void;
}) {
  const options: { key: VisibilityValue; label: string }[] = [
    { key: "public", label: "Public" },
    { key: "friends", label: "Friends" },
    { key: "private", label: "Private" },
  ];
  return (
    <View style={visibilityStyles.wrap}>
      <Text style={[visibilityStyles.label, { color: DS_COLORS.textPrimary }]}>{label}</Text>
      <View style={visibilityStyles.pillRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              visibilityStyles.pill,
              value === opt.key && { backgroundColor: DS_COLORS.textPrimary },
              value !== opt.key && { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border },
            ]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
            accessibilityLabel={`Set ${label} visibility to ${opt.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt.key }}
          >
            <Text style={[visibilityStyles.pillText, { color: value === opt.key ? DS_COLORS.white : DS_COLORS.textPrimary }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[visibilityStyles.hint, { color: DS_COLORS.textMuted }]}>
        {value === "public" ? "Anyone can see" : value === "friends" ? "Only friends" : "Only you"}
      </Text>
    </View>
  );
}

const visibilityStyles = StyleSheet.create({
  wrap: { marginBottom: DS_SPACING.lg },
  label: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "700",
    marginBottom: DS_SPACING.sm,
  },
  pillRow: { flexDirection: "row", gap: DS_SPACING.sm },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: DS_BORDERS.width,
  },
  pillText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "500" },
  hint: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, marginTop: DS_SPACING.sm },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderLoading, setReminderLoading] = useState(true);
  const [lastCall, setLastCall] = useState(false);
  const [morningKickoff, setMorningKickoff] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [friendActivity, setFriendActivity] = useState(false);
  const [accountabilityCount, setAccountabilityCount] = useState(0);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<"public" | "friends" | "private">("public");
  const [challengeVisibility, setChallengeVisibility] = useState<"public" | "friends" | "private">("public");
  const [activityVisibility, setActivityVisibility] = useState<"public" | "friends" | "private">("public");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const { error: deleteAccountError, showError: showDeleteAccountError, clearError: clearDeleteAccountError } =
    useInlineError();
  const { refetchAll, isPremium, refreshPremiumStatus, stats, activeChallenge, currentChallenge } = useApp();

  const loadReminderSettings = useCallback(async () => {
    if (isGuest) {
      setReminderLoading(false);
      return;
    }
    try {
      const data = await trpcQuery(TRPC.notifications.getReminderSettings) as {
        reminder_time?: string;
        enabled?: boolean;
        last_call_enabled?: boolean;
        friend_activity_enabled?: boolean;
        morning_kickoff_enabled?: boolean;
        weekly_summary_enabled?: boolean;
      };
      setReminderTime(data?.reminder_time ?? "09:00");
      setDailyReminder(data?.enabled !== false);
      setLastCall(data?.last_call_enabled !== false);
      setMorningKickoff(data?.morning_kickoff_enabled !== false);
      setWeeklySummary(data?.weekly_summary_enabled !== false);
      setFriendActivity(data?.friend_activity_enabled !== false);
    } catch (e) {
      captureError(e, "SettingsLoadReminder");
      // ignore
    } finally {
      setReminderLoading(false);
    }
  }, [isGuest]);

  const loadAccountabilityCount = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = await trpcQuery(TRPC.accountability.listMine) as { accepted: unknown[] };
      setAccountabilityCount(data?.accepted?.length ?? 0);
    } catch (e) {
      captureError(e, "SettingsLoadAccountability");
      // ignore
    }
  }, [isGuest]);

  const loadProfileVisibility = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = await trpcQuery(TRPC.profiles.get) as { profile_visibility?: string | null };
      const v = data?.profile_visibility;
      if (v === "public" || v === "friends" || v === "private") setProfileVisibility(v);
    } catch (e) {
      captureError(e, "SettingsLoadProfileVisibility");
      // ignore
    }
  }, [isGuest]);

  useEffect(() => {
    loadReminderSettings();
  }, [loadReminderSettings]);

  useEffect(() => {
    loadAccountabilityCount();
  }, [loadAccountabilityCount]);

  useEffect(() => {
    loadProfileVisibility();
  }, [loadProfileVisibility]);

  const handleReminderToggle = async (v: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDailyReminder(v);
    if (isGuest) return;
    try {
      await trpcMutate(TRPC.notifications.updateReminderSettings, { enabled: v });
      if (v) await registerPushTokenWithBackend();
    } catch (e) {
      captureError(e, "SettingsReminderToggle");
      // revert on error
      setDailyReminder(!v);
    }
  };

  const handleReminderTime = async (value: string) => {
    setReminderTime(value);
    if (isGuest) return;
    try {
      await trpcMutate(TRPC.notifications.updateReminderSettings, { reminder_time: value });
    } catch (e) {
      captureError(e, "SettingsReminderTime");
      // ignore
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
  };


  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: DS_COLORS.settingsPageBg }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: DS_COLORS.settingsPageBg, borderBottomColor: DS_COLORS.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <View style={styles.backBtnCircle}>
            <ChevronLeft size={22} color={DS_COLORS.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: DS_COLORS.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy & Visibility */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleLarge, { color: DS_COLORS.textPrimary }]}>👁 Privacy & Visibility</Text>
          </View>
          <Text style={[styles.privacyDesc, { color: DS_COLORS.textSecondary }]}>
            Control who sees your profile, challenges, and activity. Like TikTok privacy settings.
          </Text>
          <View style={styles.card}>
            <VisibilitySubsection
              label="Profile Visibility"
              value={profileVisibility}
              onChange={async (v) => {
                setProfileVisibility(v);
                if (isGuest) return;
                try {
                  await trpcMutate(TRPC.profiles.update, { profile_visibility: v });
                } catch (e) {
                  captureError(e, "SettingsProfileVisibilityUpdate");
                  loadProfileVisibility();
                }
              }}
            />
            <View style={styles.cardDivider} />
            <VisibilitySubsection
              label="Challenge Visibility"
              value={challengeVisibility}
              onChange={setChallengeVisibility}
            />
            <View style={styles.cardDivider} />
            <VisibilitySubsection
              label="Activity Visibility"
              value={activityVisibility}
              onChange={setActivityVisibility}
            />
          </View>
        </View>

        {/* Profile */}
        {!isGuest && user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color={DS_COLORS.textPrimary} />
              <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary }]}>Profile</Text>
            </View>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
              activeOpacity={0.9}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>{user.email ?? "Signed in"}</Text>
              <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted }]}>Tap to edit profile</Text>
              <ChevronLeft size={20} color={DS_COLORS.textMuted} style={styles.chevronDisclosure} />
            </TouchableOpacity>
          </View>
        )}

        {/* Friends */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleFriends, { color: DS_COLORS.textPrimary }]}>👥 Friends</Text>
          <TouchableOpacity
            style={[styles.card, styles.friendsCard]}
            onPress={() => router.push(ROUTES.ACCOUNTABILITY as never)}
            activeOpacity={0.9}
            accessibilityLabel="Open friends and accountability"
            accessibilityRole="button"
          >
            <View style={styles.friendsTwoCol}>
              <View style={styles.friendsCol}>
                <Text style={[styles.friendsNum, { color: DS_COLORS.textPrimary }]}>{accountabilityCount}</Text>
                <Text style={[styles.friendsLabel, { color: DS_COLORS.textMuted }]}>FRIENDS</Text>
              </View>
              <View style={[styles.friendsColDivider, { backgroundColor: DS_COLORS.border }]} />
              <View style={styles.friendsCol}>
                <Text style={[styles.friendsNum, { color: DS_COLORS.textPrimary }]}>0</Text>
                <Text style={[styles.friendsLabel, { color: DS_COLORS.textMuted }]}>PENDING</Text>
              </View>
            </View>
            <Text style={[styles.friendsDesc, { color: DS_COLORS.textMuted }]}>
              Friends can see your FRIENDS-only content. Find friends on the Movement tab.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
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
                        onPress={() => handleReminderTime(p.value)}
                        style={[
                          styles.reminderPill,
                          { backgroundColor: DS_COLORS.border + "40" },
                          reminderTime === p.value && { backgroundColor: DS_COLORS.accent },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Set reminder time to ${p.label}`}
                        accessibilityState={{ selected: reminderTime === p.value }}
                      >
                        <Text style={[
                          styles.reminderPillText,
                          { color: DS_COLORS.textSecondary },
                          reminderTime === p.value && styles.reminderPillTextActive,
                        ]}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
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
                    const taskCount = currentChallenge?.tasks?.length ?? 0;
                    const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
                    const challengeTitle = (activeChallenge as { challenges?: { title?: string } } | null)?.challenges
                      ?.title;
                    await scheduleMorningMotivation({
                      morningTime: "07:00",
                      streakCount: (stats as StatsFromApi | null)?.activeStreak ?? 0,
                      taskCount,
                      currentDay,
                      challengeName: challengeTitle,
                    });
                  }
                  if (!isGuest) {
                    await trpcMutate(TRPC.notifications.updateReminderSettings, { morning_kickoff_enabled: v }).catch(
                      (e) => {
                        captureError(e, "SettingsMorningKickoffTRPC");
                      }
                    );
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
                    const s = stats as StatsFromApi | null;
                    await scheduleWeeklySummary({
                      daysSecuredThisWeek: countSecuredLast7Days(Array.isArray(keys) ? keys : []),
                      totalDaysThisWeek: 7,
                      points: (s?.totalDaysSecured ?? 0) * 5,
                      rank: deriveUserRank(s),
                      streakCount: s?.activeStreak ?? 0,
                    });
                  }
                  if (!isGuest) {
                    await trpcMutate(TRPC.notifications.updateReminderSettings, { weekly_summary_enabled: v }).catch(
                      (e) => {
                        captureError(e, "SettingsWeeklySummaryTRPC");
                      }
                    );
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

        {/* Premium */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexWrap: "wrap" }]}>
            <Crown size={18} color={DS_COLORS.accent} />
            <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary }]}>Premium</Text>
            <PremiumBadge size={14} />
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isPremium) {
                if (Platform.OS === "ios") Linking.openURL("https://apps.apple.com/account/subscriptions");
                else if (Platform.OS === "android") Linking.openURL("https://play.google.com/store/account/subscriptions");
              } else {
                router.push({ pathname: ROUTES.PAYWALL as never, params: { source: "settings" } } as never);
              }
            }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={isPremium ? "Manage subscription" : "Open GRIIT Premium"}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>{isPremium ? "GRIIT Premium" : "Subscription"}</Text>
                <Text style={[styles.toggleSub, { color: DS_COLORS.textSecondary }]}>
                  {isPremium ? "Manage your subscription" : "Unlimited challenges, premium badge & more."}
                </Text>
              </View>
              <ChevronLeft size={20} color={DS_COLORS.textMuted} style={styles.chevronInline} />
            </View>
          </TouchableOpacity>
          {!isGuest && Platform.OS !== "web" && (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border, marginTop: 10 }]}
              onPress={async () => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRestoreLoading(true);
                try {
                  const { success } = await restorePurchases();
                  if (success) {
                    await refreshPremiumStatus();
                    await refetchAll();
                  }
                } finally {
                  setRestoreLoading(false);
                }
              }}
              activeOpacity={0.9}
              disabled={restoreLoading}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              accessibilityState={{ disabled: restoreLoading }}
            >
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Restore Purchases</Text>
                {restoreLoading ? (
                  <ActivityIndicator size="small" color={DS_COLORS.accent} />
                ) : null}
              </View>
              <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted, marginTop: 4 }]}>
                Restore premium if you already purchased on another device.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogOut size={18} color={DS_COLORS.textPrimary} />
            <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary }]}>Account</Text>
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}
            onPress={async () => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await cancelLapsedUserReminders();
              await supabase.auth.signOut();
              await runClientSignOutCleanup();
              const { clearOnboardingStorage } = await import("@/store/onboardingStore");
              await clearOnboardingStorage();
              router.replace(ROUTES.AUTH as never);
            }}
            activeOpacity={0.9}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
          >
            <Text style={[styles.toggleTitle, { color: DS_COLORS.dangerDark }]}>Sign Out</Text>
          </TouchableOpacity>
          {!isGuest && (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border, marginTop: 10 }]}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.9}
              accessibilityLabel="Delete account"
              accessibilityRole="button"
            >
              <Text style={[styles.toggleTitle, { color: DS_COLORS.dangerDark, fontSize: 14 }]}>Delete Account</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delete account confirmation modal */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.deleteModalBackdrop}
            activeOpacity={1}
            onPress={() => !deleteAccountLoading && setShowDeleteModal(false)}
            accessibilityLabel="Dismiss delete account dialog"
            accessibilityRole="button"
          />
          <View style={styles.deleteModalCenter}>
            <View style={[styles.card, styles.deleteModalCard, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
              <InlineError message={deleteAccountError} onDismiss={clearDeleteAccountError} />
              <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary, marginBottom: 8 }]}>Type DELETE to confirm</Text>
              <TextInput
                style={[styles.deleteConfirmInput, { color: DS_COLORS.textPrimary, borderColor: DS_COLORS.border }]}
                value={deleteConfirmValue}
                onChangeText={setDeleteConfirmValue}
                placeholder="DELETE"
                placeholderTextColor={DS_COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!deleteAccountLoading}
                accessibilityLabel="Type DELETE to confirm account deletion"
                accessibilityRole="text"
              />
              <TouchableOpacity
                style={[
                  styles.deleteConfirmBtn,
                  { backgroundColor: deleteConfirmValue === "DELETE" ? DS_COLORS.dangerDark : DS_COLORS.border },
                ]}
                onPress={async () => {
                  if (deleteConfirmValue !== "DELETE" || deleteAccountLoading) return;
                  setDeleteAccountLoading(true);
                  try {
                    await trpcMutate(TRPC.profiles.deleteAccount);
                    await cancelLapsedUserReminders();
                    await supabase.auth.signOut();
                    await runClientSignOutCleanup();
                    const { clearOnboardingStorage } = await import("@/store/onboardingStore");
                    await clearOnboardingStorage();
                    setShowDeleteModal(false);
                    setDeleteConfirmValue("");
                    router.replace(ROUTES.AUTH_LOGIN as never);
                  } catch (e) {
                    captureError(e, "SettingsDeleteAccount");
                    showDeleteAccountError("Failed to delete account. Please try again.");
                  } finally {
                    setDeleteAccountLoading(false);
                  }
                }}
                disabled={deleteConfirmValue !== "DELETE" || deleteAccountLoading}
                activeOpacity={0.85}
                accessibilityLabel="Permanently delete my account"
                accessibilityRole="button"
                accessibilityState={{ disabled: deleteConfirmValue !== "DELETE" || deleteAccountLoading }}
              >
                {deleteAccountLoading ? (
                  <ActivityIndicator size="small" color={DS_COLORS.white} />
                ) : (
                  <Text style={styles.deleteConfirmBtnText}>Delete my account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: DS_COLORS.border }]}
                onPress={() => { setShowDeleteModal(false); setDeleteConfirmValue(""); }}
                disabled={deleteAccountLoading}
                accessibilityLabel="Cancel account deletion"
                accessibilityRole="button"
                accessibilityState={{ disabled: deleteAccountLoading }}
              >
                <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={DS_COLORS.textPrimary} />
            <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary }]}>About</Text>
          </View>
          <View style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
            <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Version {APP_VERSION}</Text>
            <Text style={[styles.toggleSub, { color: DS_COLORS.textMuted, marginTop: 4 }]}>Legal</Text>
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border, marginTop: 10 }]}
            onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(ROUTES.LEGAL_PRIVACY as never); }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Privacy Policy</Text>
              <ChevronLeft size={20} color={DS_COLORS.textMuted} style={styles.chevronInline} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border, marginTop: 10 }]}
            onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(ROUTES.LEGAL_TERMS as never); }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Terms of Service"
          >
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Terms of Service</Text>
              <ChevronLeft size={20} color={DS_COLORS.textMuted} style={styles.chevronInline} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Consequences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleFriends, { color: DS_COLORS.textPrimary }]}>⏱ Consequences</Text>
          <View style={[styles.card, styles.consequenceCard, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
            {CONSEQUENCES.map((item, i) => (
              <View key={i} style={styles.consequenceRow}>
                <View style={[styles.bullet, { backgroundColor: item.bulletColor }]} />
                <View style={styles.consequenceTextWrap}>
                  <Text style={[styles.consequenceTitle, { color: DS_COLORS.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.consequenceSub, { color: DS_COLORS.textMuted }]}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  backBtn: { padding: 4 },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS_COLORS.settingsBackCircle,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: DS_SPACING.screenHorizontal },
  section: { marginBottom: DS_SPACING.xxl },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.md,
  },
  sectionTitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  sectionTitleLarge: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.sm,
  },
  sectionTitleFriends: {
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.md,
  },
  privacyDesc: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    marginBottom: DS_SPACING.md,
    lineHeight: 22,
    color: DS_COLORS.textSecondary,
  },
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    padding: DS_SPACING.cardPadding,
  },
  deleteModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  deleteModalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DS_SPACING.screenHorizontal,
  },
  deleteModalCard: { width: "100%", maxWidth: 340 },
  deleteConfirmInput: {
    borderWidth: 1,
    borderRadius: DS_RADIUS.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  deleteConfirmBtn: {
    borderRadius: DS_RADIUS.button,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  deleteConfirmBtnText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.white },
  deleteCancelBtn: {
    borderWidth: 1,
    borderRadius: DS_RADIUS.button,
    paddingVertical: 12,
    alignItems: "center",
  },
  friendsCard: {},
  friendsTwoCol: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DS_SPACING.md,
  },
  friendsRow: { flexDirection: "row", marginBottom: DS_SPACING.md },
  friendsCol: { flex: 1, alignItems: "center" },
  friendsColDivider: {
    width: 1,
    height: 40,
    marginHorizontal: DS_SPACING.sm,
  },
  friendsNum: {
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  friendsLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  friendsDesc: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    marginVertical: DS_SPACING.md,
    backgroundColor: DS_COLORS.border,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTextWrap: { flex: 1, marginRight: DS_SPACING.md },
  toggleTitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  consequenceCard: { gap: DS_SPACING.lg },
  consequenceRow: { flexDirection: "row", alignItems: "flex-start" },
  consequenceRowBordered: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: DS_SPACING.lg,
    marginTop: DS_SPACING.lg,
    borderTopWidth: 0,
    borderTopColor: "transparent",
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: DS_SPACING.md,
  },
  consequenceTextWrap: { flex: 1 },
  consequenceTitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  reminderPill: {
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.sm,
    borderRadius: 999,
  },
  reminderPillActive: {},
  reminderPillText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
  },
  reminderPillTextActive: {
    color: DS_COLORS.white,
    fontWeight: "600",
  },
  consequenceSub: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  bottomSpacer: { height: DS_SPACING.xxxl },
  chevronDisclosure: { position: "absolute", right: 16, top: 18, transform: [{ rotate: "-90deg" }] },
  chevronInline: { transform: [{ rotate: "-90deg" }] },
  reminderPillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
});

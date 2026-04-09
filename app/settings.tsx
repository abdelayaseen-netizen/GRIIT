import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Crown, User, FileText } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { DS_COLORS } from "@/lib/design-system";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { PremiumBadge } from "@/components/PremiumBadge";
import { restorePurchases } from "@/lib/subscription";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { useInlineError } from "@/hooks/useInlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { styles } from "@/components/settings/settings-styles";
import { VisibilitySection } from "@/components/settings/VisibilitySection";
import { ReminderSection } from "@/components/settings/ReminderSection";
import { AccountDangerZone, ConsequencesSection } from "@/components/settings/AccountDangerZone";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

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
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.TABS_HOME as never);
    }
  };


  return (
    <ErrorBoundary>
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
        <VisibilitySection
          profileVisibility={profileVisibility}
          challengeVisibility={challengeVisibility}
          activityVisibility={activityVisibility}
          onProfileVisibilityChange={async (v) => {
            setProfileVisibility(v);
            if (isGuest) return;
            try {
              await trpcMutate(TRPC.profiles.update, { profile_visibility: v });
            } catch (e) {
              captureError(e, "SettingsProfileVisibilityUpdate");
              loadProfileVisibility();
            }
          }}
          onChallengeVisibilityChange={setChallengeVisibility}
          onActivityVisibilityChange={setActivityVisibility}
        />

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

        <ReminderSection
          isGuest={isGuest}
          reminderLoading={reminderLoading}
          dailyReminder={dailyReminder}
          reminderTime={reminderTime}
          lastCall={lastCall}
          morningKickoff={morningKickoff}
          weeklySummary={weeklySummary}
          friendActivity={friendActivity}
          stats={stats}
          activeChallenge={activeChallenge}
          currentChallenge={currentChallenge}
          setLastCall={setLastCall}
          setMorningKickoff={setMorningKickoff}
          setWeeklySummary={setWeeklySummary}
          setFriendActivity={setFriendActivity}
          handleReminderToggle={handleReminderToggle}
          handleReminderTime={handleReminderTime}
        />

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

        <AccountDangerZone
          isGuest={isGuest}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteConfirmValue={deleteConfirmValue}
          setDeleteConfirmValue={setDeleteConfirmValue}
          deleteAccountLoading={deleteAccountLoading}
          setDeleteAccountLoading={setDeleteAccountLoading}
          deleteAccountError={deleteAccountError}
          showDeleteAccountError={showDeleteAccountError}
          clearDeleteAccountError={clearDeleteAccountError}
        />

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

        <ConsequencesSection />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

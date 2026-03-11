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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Sun, Moon, Smartphone, Crown, User, LogOut, FileText } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import Colors from "@/constants/colors";
import { designTokens } from "@/lib/design-tokens";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { PremiumPaywallModal } from "@/components/PremiumPaywallModal";
import { PremiumBadge } from "@/components/PremiumBadge";
import { restorePurchases } from "@/lib/subscription";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";

const REMINDER_PRESETS = [
  { label: "6:00 AM", value: "06:00" },
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
];


const CONSEQUENCES = [
  { bulletColor: "#D4A017", title: "Miss 1 day", sub: "Streak breaks (unless grace used)" },
  { bulletColor: "#E8734A", title: "Miss 3 in 7 days", sub: "On Thin Ice warning state" },
  { bulletColor: "#E53E3E", title: "Miss 7 days", sub: "Challenge auto-paused, tier drops" },
  { bulletColor: "#B91C1C", title: "Miss 14 days", sub: "Full reset, must rebuild 7 days" },
] as const;

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

type VisibilityValue = "public" | "friends" | "private";

function VisibilitySubsection({
  label,
  value,
  onChange,
  themeColors,
}: {
  label: string;
  value: VisibilityValue;
  onChange: (v: VisibilityValue) => void;
  themeColors: import("@/lib/theme-palettes").ThemeColors;
}) {
  const options: { key: VisibilityValue; label: string }[] = [
    { key: "public", label: "Public" },
    { key: "friends", label: "Friends" },
    { key: "private", label: "Private" },
  ];
  return (
    <View style={visibilityStyles.wrap}>
      <Text style={[visibilityStyles.label, { color: themeColors.text.primary }]}>{label}</Text>
      <View style={visibilityStyles.pillRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              visibilityStyles.pill,
              value === opt.key && { backgroundColor: themeColors.text.primary },
              value !== opt.key && { backgroundColor: themeColors.card, borderColor: themeColors.border },
            ]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
            accessibilityLabel={`Set ${label} visibility to ${opt.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt.key }}
          >
            <Text style={[visibilityStyles.pillText, { color: value === opt.key ? "#fff" : themeColors.text.primary }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[visibilityStyles.hint, { color: themeColors.text.muted }]}>
        {value === "public" ? "Anyone can see" : value === "friends" ? "Only friends" : "Only you"}
      </Text>
    </View>
  );
}

const visibilityStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    height: 36,
    borderRadius: designTokens.pillBorderRadius,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: "500" },
  hint: { fontSize: 13, marginTop: 6 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { colors: themeColors, mode: themeMode, setMode: setThemeMode, isDark } = useTheme();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderLoading, setReminderLoading] = useState(true);
  const [lastCall, setLastCall] = useState(false);
  const [friendActivity, setFriendActivity] = useState(false);
  const [accountabilityCount, setAccountabilityCount] = useState(0);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<"public" | "friends" | "private">("public");
  const [challengeVisibility, setChallengeVisibility] = useState<"public" | "friends" | "private">("public");
  const [activityVisibility, setActivityVisibility] = useState<"public" | "friends" | "private">("public");
  const { refetchAll } = useApp();

  const loadReminderSettings = useCallback(async () => {
    if (isGuest) {
      setReminderLoading(false);
      return;
    }
    try {
      const data = await trpcQuery("notifications.getReminderSettings") as { reminder_time: string; enabled: boolean };
      setReminderTime(data?.reminder_time ?? "09:00");
      setDailyReminder(data?.enabled !== false);
    } catch {
      // ignore
    } finally {
      setReminderLoading(false);
    }
  }, [isGuest]);

  const loadAccountabilityCount = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = await trpcQuery("accountability.listMine") as { accepted: unknown[] };
      setAccountabilityCount(data?.accepted?.length ?? 0);
    } catch {
      // ignore
    }
  }, [isGuest]);

  const loadProfileVisibility = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = await trpcQuery("profiles.get") as { profile_visibility?: string | null };
      const v = data?.profile_visibility;
      if (v === "public" || v === "friends" || v === "private") setProfileVisibility(v);
    } catch {
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
      await trpcMutate("notifications.updateReminderSettings", { enabled: v });
      if (v) await registerPushTokenWithBackend();
    } catch {
      // revert on error
      setDailyReminder(!v);
    }
  };

  const handleReminderTime = async (value: string) => {
    setReminderTime(value);
    if (isGuest) return;
    try {
      await trpcMutate("notifications.updateReminderSettings", { reminder_time: value });
    } catch {
      // ignore
    }
  };

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleThemeMode = (mode: ThemeMode) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={themeColors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy & Visibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleLarge, { color: themeColors.text.primary }]}>👁 Privacy & Visibility</Text>
          <Text style={[styles.privacyDesc, { color: themeColors.text.muted }]}>
            Control who sees your profile, challenges, and activity. Like TikTok privacy settings.
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <VisibilitySubsection
              label="Profile Visibility"
              value={profileVisibility}
              onChange={async (v) => {
                setProfileVisibility(v);
                if (isGuest) return;
                try {
                  await trpcMutate("profiles.update", { profile_visibility: v });
                } catch {
                  loadProfileVisibility();
                }
              }}
              themeColors={themeColors}
            />
            <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
            <VisibilitySubsection
              label="Challenge Visibility"
              value={challengeVisibility}
              onChange={setChallengeVisibility}
              themeColors={themeColors}
            />
            <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
            <VisibilitySubsection
              label="Activity Visibility"
              value={activityVisibility}
              onChange={setActivityVisibility}
              themeColors={themeColors}
            />
          </View>
        </View>

        {/* Profile */}
        {!isGuest && user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color={themeColors.text.primary} />
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Profile</Text>
            </View>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
              activeOpacity={0.9}
            >
              <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>{user.email ?? "Signed in"}</Text>
              <Text style={[styles.toggleSub, { color: themeColors.text.tertiary }]}>Tap to edit profile</Text>
              <ChevronLeft size={20} color={themeColors.text.tertiary} style={{ position: "absolute", right: 16, top: 18, transform: [{ rotate: "-90deg" }] }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Appearance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sun size={18} color={themeColors.text.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Appearance</Text>
          </View>
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Dark mode</Text>
              <Switch
                value={isDark}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setThemeMode(v ? "dark" : "light");
                }}
                trackColor={{ false: themeColors.border, true: themeColors.accent }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle dark mode"
                accessibilityRole="switch"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              {(["system", "light", "dark"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleThemeMode(m)}
                  style={[
                    styles.reminderPill,
                    { backgroundColor: themeColors.border + "40", flexDirection: "row", alignItems: "center" },
                    themeMode === m && { backgroundColor: themeColors.accent },
                  ]}
                  activeOpacity={0.8}
                >
                  {m === "system" && <Smartphone size={14} color={themeMode === m ? "#fff" : themeColors.text.secondary} style={{ marginRight: 4 }} />}
                  {m === "light" && <Sun size={14} color={themeMode === m ? "#fff" : themeColors.text.secondary} style={{ marginRight: 4 }} />}
                  {m === "dark" && <Moon size={14} color={themeMode === m ? "#fff" : themeColors.text.secondary} style={{ marginRight: 4 }} />}
                  <Text style={[styles.reminderPillText, themeMode === m && styles.reminderPillTextActive, { color: themeMode === m ? "#fff" : themeColors.text.secondary }]}>
                    {m === "system" ? "System" : m === "light" ? "Light" : "Dark"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Friends */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleFriends, { color: themeColors.text.primary }]}>👥 Friends</Text>
          <TouchableOpacity
            style={[styles.card, styles.friendsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => router.push(ROUTES.ACCOUNTABILITY as never)}
            activeOpacity={0.9}
          >
            <View style={styles.friendsTwoCol}>
              <View style={styles.friendsCol}>
                <Text style={[styles.friendsNum, { color: themeColors.text.primary }]}>{accountabilityCount}</Text>
                <Text style={[styles.friendsLabel, { color: themeColors.text.muted }]}>FRIENDS</Text>
              </View>
              <View style={[styles.friendsColDivider, { backgroundColor: themeColors.border }]} />
              <View style={styles.friendsCol}>
                <Text style={[styles.friendsNum, { color: themeColors.text.primary }]}>0</Text>
                <Text style={[styles.friendsLabel, { color: themeColors.text.muted }]}>PENDING</Text>
              </View>
            </View>
            <Text style={[styles.friendsDesc, { color: themeColors.text.muted }]}>
              Friends can see your FRIENDS-only content. Find friends on the Movement tab.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleFriends, { color: themeColors.text.primary }]}>🔔 Notifications</Text>
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Daily Reminder</Text>
                <Text style={[styles.toggleSub, { color: themeColors.text.muted }]}>Remind if not started by evening</Text>
              </View>
              {reminderLoading ? (
                <ActivityIndicator size="small" color={themeColors.accent} />
              ) : (
                <Switch
                  value={dailyReminder}
                  onValueChange={handleReminderToggle}
                  trackColor={{ false: themeColors.border, true: "#FDDCB5" }}
                  thumbColor={dailyReminder ? themeColors.accent : "#f4f3f4"}
                  accessibilityLabel="Toggle daily reminder"
                  accessibilityRole="switch"
                />
              )}
            </View>
            {!reminderLoading && dailyReminder && (
              <>
                <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.toggleTextWrap}>
                  <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Reminder time</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {REMINDER_PRESETS.map((p) => (
                      <TouchableOpacity
                        key={p.value}
                        onPress={() => handleReminderTime(p.value)}
                        style={[
                          styles.reminderPill,
                          { backgroundColor: themeColors.border + "40" },
                          reminderTime === p.value && { backgroundColor: themeColors.accent },
                        ]}
                      >
                        <Text style={[
                          styles.reminderPillText,
                          { color: themeColors.text.secondary },
                          reminderTime === p.value && styles.reminderPillTextActive,
                        ]}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Last Call</Text>
                <Text style={[styles.toggleSub, { color: themeColors.text.muted }]}>60 minutes before day resets</Text>
              </View>
              <Switch
                value={lastCall}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLastCall(v);
                }}
                trackColor={{ false: themeColors.border, true: "#FDDCB5" }}
                thumbColor={lastCall ? themeColors.accent : "#f4f3f4"}
                accessibilityLabel="Toggle last call reminder"
                accessibilityRole="switch"
              />
            </View>
            <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Friend Activity</Text>
                <Text style={[styles.toggleSub, { color: themeColors.text.muted }]}>When friends respect or secure</Text>
              </View>
              <Switch
                value={friendActivity}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFriendActivity(v);
                }}
                trackColor={{ false: themeColors.border, true: "#FDDCB5" }}
                thumbColor={friendActivity ? themeColors.accent : "#f4f3f4"}
                accessibilityLabel="Toggle friend activity notifications"
                accessibilityRole="switch"
              />
            </View>
          </View>
        </View>

        {/* Premium */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexWrap: "wrap" }]}>
            <Crown size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Premium</Text>
            <PremiumBadge size={14} />
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPremiumModalVisible(true);
            }}
            activeOpacity={0.9}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>GRIIT Premium</Text>
                  <View style={{ backgroundColor: themeColors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={[styles.toggleSub, { color: themeColors.text.secondary }]}>Unlimited challenges, premium badge & more.</Text>
              </View>
              <ChevronLeft size={20} color={themeColors.text.tertiary} style={{ transform: [{ rotate: "-90deg" }] }} />
            </View>
          </TouchableOpacity>
          {!isGuest && Platform.OS !== "web" && (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, marginTop: 10 }]}
              onPress={async () => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRestoreLoading(true);
                try {
                  const { success } = await restorePurchases();
                  if (success) await refetchAll();
                } finally {
                  setRestoreLoading(false);
                }
              }}
              activeOpacity={0.9}
              disabled={restoreLoading}
            >
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Restore Purchases</Text>
                {restoreLoading ? (
                  <ActivityIndicator size="small" color={themeColors.accent} />
                ) : null}
              </View>
              <Text style={[styles.toggleSub, { color: themeColors.text.tertiary, marginTop: 4 }]}>
                Restore premium if you already purchased on another device.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogOut size={18} color={themeColors.text.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Account</Text>
          </View>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={async () => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await supabase.auth.signOut();
              router.replace(ROUTES.AUTH as never);
            }}
            activeOpacity={0.9}
          >
            <Text style={[styles.toggleTitle, { color: "#B91C1C" }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={themeColors.text.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>About</Text>
          </View>
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.toggleTitle, { color: themeColors.text.primary }]}>Version {APP_VERSION}</Text>
            <Text style={[styles.toggleSub, { color: themeColors.text.tertiary, marginTop: 4 }]}>Terms & Privacy — see app store listing</Text>
          </View>
        </View>

        {/* Consequences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleFriends, { color: themeColors.text.primary }]}>🛡 Consequences</Text>
          <View style={[styles.card, styles.consequenceCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            {CONSEQUENCES.map((item, i) => (
              <View key={i} style={styles.consequenceRow}>
                <View style={[styles.bullet, { backgroundColor: item.bulletColor }]} />
                <View style={styles.consequenceTextWrap}>
                  <Text style={[styles.consequenceTitle, { color: themeColors.text.primary }]}>{item.title}</Text>
                  <Text style={[styles.consequenceSub, { color: themeColors.text.muted }]}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <PremiumPaywallModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        featureTitle="GRIIT Premium"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  sectionTitleLarge: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionTitleFriends: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 10,
  },
  privacyDesc: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    color: "#6B7280",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: designTokens.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...designTokens.cardShadow,
  },
  friendsCard: {},
  friendsTwoCol: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  friendsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  friendsCol: {
    flex: 1,
    alignItems: "center",
  },
  friendsColDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 8,
  },
  friendsNum: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  friendsLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 2,
  },
  friendsDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  toggleSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  consequenceCard: { gap: 16 },
  consequenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  consequenceRowBordered: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 0,
    borderTopColor: "transparent",
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  consequenceTextWrap: {
    flex: 1,
  },
  consequenceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  reminderPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.border + "40",
  },
  reminderPillActive: {
    backgroundColor: Colors.accent,
  },
  reminderPillText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reminderPillTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  consequenceSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 32,
  },
});

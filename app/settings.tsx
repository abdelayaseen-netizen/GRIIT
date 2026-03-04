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
import { ChevronLeft, Users, Bell, Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";

const REMINDER_PRESETS = [
  { label: "6:00 PM", value: "18:00" },
  { label: "8:00 PM", value: "20:00" },
  { label: "9:00 PM", value: "21:00" },
  { label: "10:00 PM", value: "22:00" },
];


const CONSEQUENCES = [
  {
    bullet: "orange",
    title: "Miss 1 day",
    sub: "Streak breaks (unless grace used)",
  },
  {
    bullet: "orange",
    title: "Miss 3 in 7 days",
    sub: "On Thin Ice warning state",
  },
  {
    bullet: "red",
    title: "Miss 7 days",
    sub: "Challenge auto-paused, tier drops",
  },
  {
    bullet: "red",
    title: "Miss 14 days",
    sub: "Full reset, must rebuild 7 days",
  },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const isGuest = useIsGuest();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [reminderLoading, setReminderLoading] = useState(true);
  const [lastCall, setLastCall] = useState(false);
  const [friendActivity, setFriendActivity] = useState(false);
  const [accountabilityCount, setAccountabilityCount] = useState(0);

  const loadReminderSettings = useCallback(async () => {
    if (isGuest) {
      setReminderLoading(false);
      return;
    }
    try {
      const data = await trpcQuery("notifications.getReminderSettings") as { reminder_time: string; enabled: boolean };
      setReminderTime(data?.reminder_time ?? "20:00");
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

  useEffect(() => {
    loadReminderSettings();
  }, [loadReminderSettings]);

  useEffect(() => {
    loadAccountabilityCount();
  }, [loadAccountabilityCount]);

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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Accountability Circle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Accountability Circle</Text>
          </View>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/accountability" as any)}
            activeOpacity={0.9}
          >
            <View style={styles.friendsRow}>
              <View style={styles.friendsCol}>
                <Text style={styles.friendsNum}>{accountabilityCount}</Text>
                <Text style={styles.friendsLabel}>PARTNERS (MAX 3)</Text>
              </View>
            </View>
            <Text style={styles.friendsDesc}>
              Add 1–3 accountability partners. Manage invites and partners here.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Daily Reminder</Text>
                <Text style={styles.toggleSub}>Time to secure your day (saved to server)</Text>
              </View>
              {reminderLoading ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Switch
                  value={dailyReminder}
                  onValueChange={handleReminderToggle}
                  trackColor={{ false: "#E8C4B8", true: Colors.accent }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
            {!reminderLoading && dailyReminder && (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleTitle}>Reminder time</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {REMINDER_PRESETS.map((p) => (
                      <TouchableOpacity
                        key={p.value}
                        onPress={() => handleReminderTime(p.value)}
                        style={[styles.reminderPill, reminderTime === p.value && styles.reminderPillActive]}
                      >
                        <Text style={[styles.reminderPillText, reminderTime === p.value && styles.reminderPillTextActive]}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            <View style={styles.cardDivider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Last Call</Text>
                <Text style={styles.toggleSub}>60 min before day resets</Text>
              </View>
              <Switch
                value={lastCall}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLastCall(v);
                }}
                trackColor={{ false: "#E8C4B8", true: Colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Friend Activity</Text>
                <Text style={styles.toggleSub}>When friends respect or secure</Text>
              </View>
              <Switch
                value={friendActivity}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFriendActivity(v);
                }}
                trackColor={{ false: "#E8C4B8", true: Colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Consequences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Consequences</Text>
          </View>
          <View style={styles.card}>
            {CONSEQUENCES.map((item, i) => (
              <View key={i} style={i > 0 ? styles.consequenceRowBordered : styles.consequenceRow}>
                <View
                  style={[
                    styles.bullet,
                    item.bullet === "red" ? styles.bulletRed : styles.bulletOrange,
                  ]}
                />
                <View style={styles.consequenceTextWrap}>
                  <Text style={styles.consequenceTitle}>{item.title}</Text>
                  <Text style={styles.consequenceSub}>{item.sub}</Text>
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  friendsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  friendsCol: {
    flex: 1,
  },
  friendsNum: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  friendsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
    letterSpacing: 0.5,
  },
  friendsDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
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
  consequenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  consequenceRowBordered: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  bulletOrange: {
    backgroundColor: Colors.accent,
  },
  bulletRed: {
    backgroundColor: "#C62828",
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

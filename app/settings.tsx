import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Users, Bell, Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const FRIENDS_DESC =
  "Friends can see your FRIENDS-only content. Find friends on the Movement tab.";

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
  const [dailyReminder, setDailyReminder] = useState(false);
  const [lastCall, setLastCall] = useState(false);
  const [friendActivity, setFriendActivity] = useState(false);

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
        {/* Friends */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Friends</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.friendsRow}>
              <View style={styles.friendsCol}>
                <Text style={styles.friendsNum}>0</Text>
                <Text style={styles.friendsLabel}>FRIENDS</Text>
              </View>
              <View style={styles.friendsCol}>
                <Text style={styles.friendsNum}>0</Text>
                <Text style={styles.friendsLabel}>PENDING</Text>
              </View>
            </View>
            <Text style={styles.friendsDesc}>{FRIENDS_DESC}</Text>
          </View>
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
                <Text style={styles.toggleSub}>Remind if not started by evening</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={(v) => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDailyReminder(v);
                }}
                trackColor={{ false: "#E8C4B8", true: Colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
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
  consequenceSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 32,
  },
});

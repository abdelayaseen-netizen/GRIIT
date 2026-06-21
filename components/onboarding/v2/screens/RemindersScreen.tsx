import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bell, Flame } from "lucide-react-native";
import { requestNotificationPermissions } from "@/lib/notifications";
import { useOnboardingStore } from "@/store/onboardingStore";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

export default function RemindersScreen({ onContinue }: { onContinue: () => void }) {
  const setNotificationsAsked = useOnboardingStore((s) => s.setNotificationsAsked);

  const handleEnable = useCallback(async () => {
    try {
      await requestNotificationPermissions();
    } finally {
      setNotificationsAsked(true);
      onContinue();
    }
  }, [setNotificationsAsked, onContinue]);

  const handleLater = useCallback(() => {
    setNotificationsAsked(true);
    onContinue();
  }, [setNotificationsAsked, onContinue]);

  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.bellWell}>
          <Bell size={42} color={OBV2_COLOR.orangeInk} strokeWidth={2} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.h1}>We&apos;ll nudge you.{"\n"}Never nag.</Text>
          <Text style={styles.sub}>
            One reminder a day, at a time you choose. Turn it off whenever. That&apos;s the deal.
          </Text>
        </View>

        <View style={styles.notif}>
          <View style={styles.appIcon}>
            <Flame size={18} color={OBV2_COLOR.onPhoto} fill={OBV2_COLOR.onPhoto} />
          </View>
          <View style={styles.notifBody}>
            <Text style={styles.notifTitle}>GRIIT</Text>
            <Text style={styles.notifSub}>Day 12 isn&apos;t logged yet. Two tasks left.</Text>
          </View>
          <Text style={styles.notifNow}>now</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Turn on reminders" onPress={handleEnable} />
        <TextLink label="Maybe later" onPress={handleLater} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", gap: 24 },
  bellWell: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: OBV2_COLOR.peach,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { alignItems: "center" },
  h1: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 34,
    letterSpacing: -0.64,
    color: OBV2_COLOR.ink,
    textAlign: "center",
  },
  sub: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 23,
    color: OBV2_COLOR.ink2,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 12,
  },
  notif: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: OBV2_COLOR.card,
    borderRadius: OBV2_RADIUS.card,
    padding: 14,
    shadowColor: OBV2_COLOR.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: OBV2_COLOR.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: OBV2_COLOR.ink },
  notifSub: { fontSize: 13, color: OBV2_COLOR.ink2, marginTop: 1 },
  notifNow: { fontSize: 12, color: OBV2_COLOR.ink3 },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});

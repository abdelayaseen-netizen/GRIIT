import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  Info,
  User,
} from "lucide-react-native";
import Constants from "expo-constants";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useApp } from "@/contexts/AppContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { parseReminderTime24h, reminderTimeText } from "@/lib/onboarding-v2-reminders";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { useInlineError } from "@/hooks/useInlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GriitFade } from "@/components/profile-v2/GriitFade";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "—";
  const [local, domain] = email.split("@");
  const head = (local ?? "").slice(0, 1);
  return `${head}•••@${domain}`;
}

function providerLabel(user: { app_metadata?: { provider?: string }; identities?: { provider?: string }[] } | null): string {
  const p =
    user?.app_metadata?.provider ??
    user?.identities?.find((i) => i.provider && i.provider !== "email")?.provider ??
    "email";
  if (p === "apple") return "Apple";
  if (p === "email") return "email";
  return p;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { isPremium, profile } = useApp();
  const [reminderSub, setReminderSub] = useState("Daily reminder off");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const { error: deleteAccountError, showError: showDeleteAccountError, clearError: clearDeleteAccountError } =
    useInlineError();

  const vis = (profile as { profile_visibility?: string } | null)?.profile_visibility ?? "public";
  const [activityVis, setActivityVis] = useState("public");

  const loadSub = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = (await trpcQuery(TRPC.notifications.getReminderSettings)) as {
        reminder_time?: string;
        enabled?: boolean;
      };
      if (data?.enabled === false) {
        setReminderSub("Daily reminder off");
      } else {
        const parsed = parseReminderTime24h(data?.reminder_time ?? "06:00");
        setReminderSub(`Daily reminder at ${reminderTimeText(parsed.preset, parsed.custom)}`);
      }
      const priv = (await trpcQuery(TRPC.profiles.get)) as { activity_visibility?: string | null };
      const act = String(priv?.activity_visibility ?? "public").toLowerCase();
      setActivityVis(act === "friends" || act === "private" ? act : "public");
    } catch (e) {
      captureError(e, "SettingsReminderSub");
    }
  }, [isGuest]);

  useEffect(() => {
    void loadSub();
  }, [loadSub]);

  const email = user?.email ?? null;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Settings" />
        <GriitFade fadeKey="settings">
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Row
              icon={<User size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />}
              label="Account"
              sub={`Signed in with ${providerLabel(user)} · ${maskEmail(email)}`}
              onPress={() => router.push(ROUTES.SETTINGS_ACCOUNT as never)}
            />
            <Row
              icon={<Bell size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />}
              label="Notifications"
              sub={reminderSub}
              onPress={() => router.push(ROUTES.SETTINGS_NOTIFICATIONS as never)}
            />
            <Row
              icon={<Eye size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />}
              label="Privacy"
              sub={`Profile ${vis} · Activity ${activityVis}`}
              onPress={() => router.push(ROUTES.SETTINGS_PRIVACY as never)}
            />
            <Row
              icon={<CreditCard size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />}
              label="Subscription"
              sub={isPremium ? "Premium" : "Free plan · 1 streak freeze a month"}
              onPress={() =>
                router.push({ pathname: ROUTES.PAYWALL as never, params: { source: "settings" } } as never)
              }
            />
            <Row
              icon={<Info size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />}
              label="About"
              sub="Version, terms, privacy policy, contact"
              onPress={() => router.push(ROUTES.SETTINGS_ABOUT as never)}
              last
            />
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

          <Text style={styles.ver}>GRIIT {APP_VERSION}</Text>
        </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function Row({
  icon,
  label,
  sub,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && styles.rowOn]}
    >
      {icon}
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <ChevronRight size={16} color={PROFILE_V2_COLOR.chevron} strokeWidth={1.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40 },
  card: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 20,
    overflow: "hidden",
  },
  row: {
    minHeight: 62,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_V2_COLOR.sunken,
  },
  rowLast: { borderBottomWidth: 0 },
  rowOn: { backgroundColor: PROFILE_V2_COLOR.canvas },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  rowSub: { marginTop: 2, fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
  ver: { marginTop: 24, textAlign: "center", fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
});

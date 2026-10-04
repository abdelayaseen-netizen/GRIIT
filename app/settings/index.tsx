import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Screen from "@/components/ds/Screen";
import { useRouter } from "expo-router";
import {
  Bell,
  CreditCard,
  Eye,
  Info,
  User,
} from "lucide-react-native";
import Constants from "expo-constants";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";
import { SETTINGS_NOTIFICATIONS_SUB, settingsPrivacySub } from "@/lib/settings-rows";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import ListRow from "@/components/ds/ListRow";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { useInlineError } from "@/hooks/useInlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GriitFade } from "@/components/profile-v2/GriitFade";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const ICON = DS_V3.space.xs * 6;

function accountSubtitle(email: string | null | undefined): string {
  const trimmed = email?.trim() ?? "";
  if (trimmed) return trimmed;
  return "Signed in with email";
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { isPremium, profile } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const { error: deleteAccountError, showError: showDeleteAccountError, clearError: clearDeleteAccountError } =
    useInlineError();

  const vis = (profile as { profile_visibility?: string } | null)?.profile_visibility ?? "public";
  const email = user?.email ?? null;

  return (
    <ErrorBoundary>
      <Screen style={styles.safe} edges={["top"]}>
        <SettingsNav title="Settings" />
        <GriitFade fadeKey="settings">
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <ListRow
              icon={<User size={ICON} color={DS_V3.color.textPrimary} />}
              title="Account"
              subtitle={accountSubtitle(email)}
              onPress={() => router.push(ROUTES.SETTINGS_ACCOUNT as never)}
            />
            <ListRow
              icon={<Bell size={ICON} color={DS_V3.color.textPrimary} />}
              title="Notifications"
              subtitle={SETTINGS_NOTIFICATIONS_SUB}
              onPress={() => router.push(ROUTES.SETTINGS_NOTIFICATIONS as never)}
            />
            <ListRow
              icon={<Eye size={ICON} color={DS_V3.color.textPrimary} />}
              title="Privacy"
              subtitle={settingsPrivacySub(vis)}
              onPress={() => router.push(ROUTES.SETTINGS_PRIVACY as never)}
            />
            <ListRow
              icon={<CreditCard size={ICON} color={DS_V3.color.textPrimary} />}
              title="Subscription"
              subtitle={isPremium ? "Premium" : "Free plan · 1 streak freeze a month"}
              onPress={() =>
                router.push({ pathname: ROUTES.PAYWALL as never, params: { source: "settings" } } as never)
              }
            />
            <ListRow
              icon={<Info size={ICON} color={DS_V3.color.textPrimary} />}
              title="About"
              subtitle="Version, terms, privacy policy, contact"
              onPress={() => router.push(ROUTES.SETTINGS_ABOUT as never)}
              divider={false}
            />
          </Card>

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
      </Screen>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs * 10,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  ver: {
    marginTop: DS_V3.space.section,
    textAlign: "center",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});

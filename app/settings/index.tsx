import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text } from "react-native";
import Screen from "@/components/ds/Screen";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Camera,
  CreditCard,
  Eye,
  Info,
  User,
} from "lucide-react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { aboutVersionLine } from "@/lib/about-line";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";
import { FLAGS } from "@/lib/feature-flags";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import {
  GUEST_SETTINGS_LINE,
  SETTINGS_NOTIFICATIONS_SUB,
  STRAVA_DISCONNECT,
  STRAVA_DISCONNECT_BODY,
  STRAVA_DISCONNECT_TITLE,
  settingsPrivacySub,
  stravaSettingsRow,
} from "@/lib/settings-rows";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import ListRow from "@/components/ds/ListRow";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { AccountDangerZone } from "@/components/settings/AccountDangerZone";
import { useInlineError } from "@/hooks/useInlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GriitFade } from "@/components/profile-v2/GriitFade";
import { SaveStreakSheet } from "@/components/home/SaveStreakSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const ABOUT_LINE = aboutVersionLine({
  version: Constants.expoConfig?.version,
  build: Application.nativeBuildVersion,
  commit: (Constants.expoConfig?.extra as { commit?: string } | undefined)?.commit,
});
const ICON = DS_V3.space.xs * 6;

function accountSubtitle(email: string | null | undefined, anonymous: boolean): string {
  if (anonymous) return "guest";
  const trimmed = email?.trim() ?? "";
  if (trimmed) return trimmed;
  return "guest";
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { isPremium, profile } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStreak, setSaveStreak] = useState(false);
  const [stravaLeave, setStravaLeave] = useState(false);
  const anonymous = user?.is_anonymous === true;
  const queryClient = useQueryClient();
  const stravaConnection = useQuery({
    queryKey: ["integrations", "getStravaConnection", user?.id ?? ""],
    queryFn: () => trpcQuery<{ id: string } | null>(TRPC.integrations.getStravaConnection),
    enabled: FLAGS.STRAVA_AUTO_VERIFY && !!user?.id && !anonymous,
    staleTime: 60_000,
  });
  const stravaRow = stravaSettingsRow({
    flagOn: FLAGS.STRAVA_AUTO_VERIFY,
    connected: Boolean(stravaConnection.data?.id),
    guest: anonymous,
  });
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
          {anonymous ? (
            <Text style={styles.guest} onPress={() => setSaveStreak(true)}>
              {GUEST_SETTINGS_LINE}
            </Text>
          ) : null}
          <Card style={styles.card}>
            <ListRow
              icon={<User size={ICON} color={DS_V3.color.textPrimary} />}
              title="Account"
              subtitle={accountSubtitle(email, anonymous)}
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
              icon={<Camera size={ICON} color={DS_V3.color.textPrimary} />}
              title="Permissions"
              subtitle="Camera, location, notifications"
              onPress={() => router.push(ROUTES.SETTINGS_PERMISSIONS as never)}
            />
            <ListRow
              icon={<CreditCard size={ICON} color={DS_V3.color.textPrimary} />}
              title="Subscription"
              subtitle={isPremium ? "Premium · hold up to 4 freezes" : "Earn a freeze at each 7-day streak. Hold up to 2."}
              onPress={() =>
                router.push({ pathname: ROUTES.PAYWALL as never, params: { source: "settings" } } as never)
              }
            />
            {stravaRow ? (
              <ListRow
                icon={<Activity size={ICON} color={DS_V3.color.textPrimary} />}
                title={stravaRow.title}
                subtitle={stravaRow.subtitle ?? undefined}
                onPress={() => {
                  if (stravaRow.action === "disconnect") {
                    setStravaLeave(true);
                    return;
                  }
                  void trpcQuery<{ url: string }>(TRPC.integrations.getStravaAuthUrl)
                    .then((res) => {
                      if (res?.url) return Linking.openURL(res.url);
                    })
                    .catch((err: unknown) => captureError(err, "SettingsConnectStrava"));
                }}
              />
            ) : null}
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

          <Text style={styles.ver}>{ABOUT_LINE}</Text>
        </ScrollView>
        </GriitFade>
        <SaveStreakSheet
          visible={saveStreak}
          onLater={() => setSaveStreak(false)}
          onSaved={() => setSaveStreak(false)}
        />
        <ConfirmDialog
          visible={stravaLeave}
          title={STRAVA_DISCONNECT_TITLE}
          message={STRAVA_DISCONNECT_BODY}
          confirmLabel={STRAVA_DISCONNECT}
          destructive
          onCancel={() => setStravaLeave(false)}
          onConfirm={() => {
            setStravaLeave(false);
            void trpcMutate(TRPC.integrations.disconnectStrava, {})
              .then(() =>
                queryClient.invalidateQueries({ queryKey: ["integrations", "getStravaConnection"] }),
              )
              .catch((err: unknown) => captureError(err, "SettingsDisconnectStrava"));
          }}
        />
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
  guest: {
    marginBottom: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
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

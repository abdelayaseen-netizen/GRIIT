import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useApp } from "@/contexts/AppContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { DS_V3 } from "@/lib/design-system";
import DsCard from "@/components/ds/Card";
import Switch from "@/components/ds/Switch";
import { isPrivateAccount, visibilitiesForPrivateSwitch } from "@/lib/profile-privacy";
import {
  PHOTOS_STAY_PRIVATE,
  PRIVACY_MATRIX,
  SEE_STRANGER,
  SWITCH_NEVER_SHARES_KEPT,
} from "@/lib/g3-profile";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { GriitFade } from "@/components/profile-v2/GriitFade";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function SettingsPrivacyScreen() {
  const isGuest = useIsGuest();
  const router = useRouter();
  const { profile } = useApp();
  const [isPrivate, setIsPrivate] = useState(false);

  const load = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = (await trpcQuery(TRPC.profiles.get)) as {
        profile_visibility?: string | null;
        challenge_visibility?: string | null;
        activity_visibility?: string | null;
      };
      setIsPrivate(isPrivateAccount(data));
    } catch (e) {
      captureError(e, "SettingsPrivacyLoad");
    }
  }, [isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggle = async (next: boolean) => {
    if (isGuest) return;
    const prev = isPrivate;
    setIsPrivate(next);
    try {
      await trpcMutate(TRPC.profiles.update, visibilitiesForPrivateSwitch(next));
    } catch (e) {
      captureError(e, "SettingsPrivacyUpdate");
      setIsPrivate(prev);
    }
  };

  const username = profile?.username ?? "";
  const col = isPrivate ? "private" : "public";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Privacy" />
        <GriitFade fadeKey={`privacy-${col}`}>
          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.switchTitle}>{isPrivate ? "Private account" : "Public account"}</Text>
                <Text style={styles.switchSub}>
                  {isPrivate
                    ? "Your name, photo and streak. Friends and people in a challenge with you still see what you shared."
                    : "Anyone can see your profile, the proofs you shared and your challenges."}
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={(v) => void onToggle(v)}
                accessibilityLabel="Private account"
              />
            </View>

            {PRIVACY_MATRIX.map((row) => (
              <View key={row.who} style={styles.matrixRow}>
                <Text style={styles.who}>{row.who}</Text>
                <Text style={styles.cell}>{row[col]}</Text>
              </View>
            ))}

            <DsCard>
              <Text style={styles.honestyT}>{PHOTOS_STAY_PRIVATE}</Text>
              <Text style={styles.honestyB}>{SWITCH_NEVER_SHARES_KEPT}</Text>
            </DsCard>

            {username ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.PROFILE_USERNAME(username) as never,
                    params: { preview: "stranger" },
                  } as never)
                }
                accessibilityRole="button"
                accessibilityLabel={SEE_STRANGER}
                style={styles.previewBtn}
              >
                <Text style={styles.previewTxt}>{SEE_STRANGER}</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs * 10,
    gap: DS_V3.space.lg,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  switchCopy: { flex: 1, gap: 4 },
  switchTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  switchSub: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  matrixRow: { gap: 4 },
  who: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  cell: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  honestyT: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honestyB: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  previewBtn: {
    minHeight: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    borderWidth: DS_V3.space.xs / 4,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.lg,
  },
  previewTxt: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
});

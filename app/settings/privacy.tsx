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
import type { VisibilityLevel } from "@/lib/profile-v2-visibility";
import { parseVisibility } from "@/lib/profile-v2-visibility";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { GriitFade } from "@/components/profile-v2/GriitFade";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LEVELS: VisibilityLevel[] = ["public", "friends", "private"];

const PROFILE_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can open your profile and see your bio, stats and activity.",
  friends: "Only people you have accepted see the record. Others see your name, photo and bio only.",
  private: "Nobody but you. You still appear to people inside challenges you share.",
};

const CHALLENGE_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can see which challenges you are running and how far in you are.",
  friends: "Only your circle sees your runs. Others see the tab as hidden.",
  private: "Your runs are hidden from your profile entirely.",
};

const ACTIVITY_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can see your 365-day map and your proof photos.",
  friends: "Only your circle sees your map and proof photos.",
  private: "Your map and proofs are yours alone.",
};

export default function SettingsPrivacyScreen() {
  const isGuest = useIsGuest();
  const router = useRouter();
  const { profile } = useApp();
  const [profileLevel, setProfileLevel] = useState<VisibilityLevel>("public");
  const [challengeLevel, setChallengeLevel] = useState<VisibilityLevel>("public");
  const [activityLevel, setActivityLevel] = useState<VisibilityLevel>("public");

  const load = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = (await trpcQuery(TRPC.profiles.get)) as {
        profile_visibility?: string | null;
        challenge_visibility?: string | null;
        activity_visibility?: string | null;
      };
      setProfileLevel(parseVisibility(data?.profile_visibility));
      setChallengeLevel(parseVisibility(data?.challenge_visibility));
      setActivityLevel(parseVisibility(data?.activity_visibility));
    } catch (e) {
      captureError(e, "SettingsPrivacyLoad");
    }
  }, [isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  const write = async (
    key: "profile_visibility" | "challenge_visibility" | "activity_visibility",
    value: VisibilityLevel,
    revert: () => void
  ) => {
    if (isGuest) return;
    try {
      await trpcMutate(TRPC.profiles.update, { [key]: value });
    } catch (e) {
      captureError(e, "SettingsPrivacyUpdate");
      revert();
    }
  };

  const username = profile?.username ?? "";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Privacy" />
        <GriitFade fadeKey={`privacy-${profileLevel}-${challengeLevel}-${activityLevel}`}>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.intro}>
              Three controls, applied everywhere your record appears. Profile, search and shared links.
            </Text>

            <VisGroup
              title="Profile"
              value={profileLevel}
              onChange={(v) => {
                const prev = profileLevel;
                setProfileLevel(v);
                void write("profile_visibility", v, () => setProfileLevel(prev));
              }}
              copy={PROFILE_COPY[profileLevel]}
            />
            <VisGroup
              title="Challenges"
              value={challengeLevel}
              onChange={(v) => {
                const prev = challengeLevel;
                setChallengeLevel(v);
                void write("challenge_visibility", v, () => setChallengeLevel(prev));
              }}
              copy={CHALLENGE_COPY[challengeLevel]}
            />
            <VisGroup
              title="Activity and proofs"
              value={activityLevel}
              onChange={(v) => {
                const prev = activityLevel;
                setActivityLevel(v);
                void write("activity_visibility", v, () => setActivityLevel(prev));
              }}
              copy={ACTIVITY_COPY[activityLevel]}
            />

            <View style={styles.honesty}>
              <Text style={styles.honestyT}>None of this hides a proof from a challenge you joined</Text>
              <Text style={styles.honestyB}>
                Everyone in a shared challenge sees whether you verified the day. Privacy controls what
                your profile shows outside it.
              </Text>
            </View>

            {username ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.PROFILE_USERNAME(username) as never,
                    params: { preview: "stranger" },
                  } as never)
                }
                accessibilityRole="button"
                accessibilityLabel="See how a stranger sees your profile"
                style={styles.previewBtn}
              >
                <Text style={styles.previewTxt}>See how a stranger sees your profile</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function VisGroup({
  title,
  value,
  onChange,
  copy,
}: {
  title: string;
  value: VisibilityLevel;
  onChange: (v: VisibilityLevel) => void;
  copy: string;
}) {
  return (
    <DsCard>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.seg}>
        {LEVELS.map((l) => {
          const on = value === l;
          return (
            <Pressable
              key={l}
              onPress={() => onChange(l)}
              style={[styles.segBtn, on && styles.segOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.segTxt, on && styles.segTxtOn]}>
                {l[0]!.toUpperCase() + l.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.copy}>{copy}</Text>
    </DsCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs * 10,
    gap: DS_V3.space.md,
  },
  intro: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  cardTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  seg: { flexDirection: "row", gap: DS_V3.space.sm, marginTop: DS_V3.space.sm },
  segBtn: {
    flex: 1,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    borderWidth: DS_V3.space.xs / 4,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_V3.color.surface,
  },
  segOn: { backgroundColor: DS_V3.color.brandTint, borderColor: DS_V3.color.brand },
  segTxt: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  segTxtOn: { color: DS_V3.color.brandText },
  copy: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  honesty: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.lg,
    gap: DS_V3.space.sm,
  },
  honestyT: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honestyB: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
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

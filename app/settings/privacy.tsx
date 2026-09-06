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
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
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
              Three controls, applied everywhere your record appears — profile, search and shared links.
            </Text>

            <Card
              title="Profile"
              value={profileLevel}
              onChange={(v) => {
                const prev = profileLevel;
                setProfileLevel(v);
                void write("profile_visibility", v, () => setProfileLevel(prev));
              }}
              copy={PROFILE_COPY[profileLevel]}
            />
            <Card
              title="Challenges"
              value={challengeLevel}
              onChange={(v) => {
                const prev = challengeLevel;
                setChallengeLevel(v);
                void write("challenge_visibility", v, () => setChallengeLevel(prev));
              }}
              copy={CHALLENGE_COPY[challengeLevel]}
            />
            <Card
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

function Card({
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
    <View style={styles.card}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40, gap: 12 },
  intro: { fontSize: 13, lineHeight: 19, color: PROFILE_V2_COLOR.muted },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, color: PROFILE_V2_COLOR.ink },
  seg: { flexDirection: "row", gap: 6 },
  segBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  segOn: { backgroundColor: PROFILE_V2_COLOR.ink, borderColor: PROFILE_V2_COLOR.ink },
  segTxt: { fontSize: 14, color: PROFILE_V2_COLOR.ink },
  segTxtOn: { color: PROFILE_V2_COLOR.surface },
  copy: { fontSize: 12, lineHeight: 17, color: PROFILE_V2_COLOR.mutedLight },
  honesty: { backgroundColor: PROFILE_V2_COLOR.sunken, borderRadius: 20, padding: 16, gap: 6 },
  honestyT: { fontSize: 14, fontWeight: "500", color: PROFILE_V2_COLOR.ink },
  honestyB: { fontSize: 12, lineHeight: 17, color: PROFILE_V2_COLOR.mutedLight },
  previewBtn: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: PROFILE_V2_COLOR.borderDashed,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  previewTxt: { fontSize: 14, color: PROFILE_V2_COLOR.ink, textAlign: "center" },
});

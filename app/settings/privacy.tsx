import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Level = "public" | "friends" | "private";

const LEVELS: Level[] = ["public", "friends", "private"];

const PROFILE_COPY: Record<Level, string> = {
  public: "Anyone can open your profile and see your bio, stats and activity.",
  friends: "Only people you have accepted see the record. Others see your name, photo and bio only.",
  private: "Nobody but you. You still appear to people inside challenges you share.",
};

export default function SettingsPrivacyScreen() {
  const isGuest = useIsGuest();
  const [profileLevel, setProfileLevel] = useState<Level>("public");

  const load = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = (await trpcQuery(TRPC.profiles.get)) as { profile_visibility?: string | null };
      const v = data?.profile_visibility;
      if (v === "public" || v === "friends" || v === "private") setProfileLevel(v);
    } catch (e) {
      captureError(e, "SettingsPrivacyLoad");
    }
  }, [isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Privacy" />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.intro}>
            Three controls, applied everywhere your record appears — profile, search and shared links.
          </Text>

          <Card
            title="Profile"
            value={profileLevel}
            onChange={async (v) => {
              setProfileLevel(v);
              if (isGuest) return;
              try {
                await trpcMutate(TRPC.profiles.update, { profile_visibility: v });
              } catch (e) {
                captureError(e, "SettingsPrivacyUpdate");
                void load();
              }
            }}
            copy={PROFILE_COPY[profileLevel]}
          />

          <ComingSoon title="Challenges" />
          <ComingSoon title="Activity and proofs" />

          <View style={styles.honesty}>
            <Text style={styles.honestyT}>None of this hides a proof from a challenge you joined</Text>
            <Text style={styles.honestyB}>
              Everyone in a shared challenge sees whether you verified the day. Privacy controls what
              your profile shows outside it.
            </Text>
          </View>
        </ScrollView>
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
  value: Level;
  onChange: (v: Level) => void;
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

function ComingSoon({ title }: { title: string }) {
  return (
    <View style={[styles.card, styles.disabled]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.seg}>
        {LEVELS.map((l) => (
          <View key={l} style={styles.segBtn}>
            <Text style={styles.segTxt}>{l[0]!.toUpperCase() + l.slice(1)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.copy}>Coming with the next update</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40, gap: 12 },
  intro: { fontSize: 13, lineHeight: 19, color: PROFILE_V2_COLOR.muted },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16, gap: 10 },
  disabled: { opacity: 0.55 },
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
});

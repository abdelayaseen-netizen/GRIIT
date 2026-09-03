import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  challengeDetailLine,
  matchReasonForChallenge,
  suggestChallengesForGoals,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-suggest";
import { joinFirstChallenge } from "@/lib/onboarding-v2-join";
import { captureError } from "@/lib/sentry";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

export default function FirstChallengeScreen({
  onJoin,
  onSkip,
  onBrowse,
}: {
  onJoin: (challengeId: string) => void;
  onSkip: () => void;
  onBrowse: () => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const setSelectedChallengeMeta = useOnboardingStore((s) => s.setSelectedChallengeMeta);
  const [suggestions, setSuggestions] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedId, setPickedId] = useState<string | null>(selectedChallengeId);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const catalog = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) setSuggestions(suggestChallengesForGoals(selectedGoals, catalog, 3));
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGoals]);

  useEffect(() => {
    if (pickedId && !suggestions.some((c) => c.id === pickedId)) {
      setPickedId(null);
    }
  }, [suggestions, pickedId]);

  const pick = (c: SuggestableChallenge) => {
    setPickedId(c.id);
    setError("");
    setSelectedChallengeMeta({
      id: c.id,
      title: c.title ?? null,
      taskCount: Array.isArray(c.tasks) ? c.tasks.length : 0,
      durationDays: c.duration_days ?? null,
    });
  };

  const handleJoin = async () => {
    if (!pickedId || joining) return;
    setError("");
    setJoining(true);
    try {
      const result = await joinFirstChallenge(pickedId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onJoin(pickedId);
    } catch (e) {
      captureError(e, "OnboardingV2Join");
      setError(e instanceof Error ? e.message : "Could not join. Try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>Start here</Text>
        <Text style={styles.sub}>One tap and Day 1 begins tomorrow morning.</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={OBV2_COLOR.orange} />
        </View>
      ) : (
        <View style={styles.body}>
          {suggestions.length === 0 ? (
            <Text style={styles.empty}>No starter challenges right now. Browse all or set this up later.</Text>
          ) : (
            suggestions.map((c) => {
              const on = pickedId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => pick(c)}
                  style={[styles.card, on && styles.cardOn]}
                  accessibilityRole="radio"
                  accessibilityLabel={c.title ?? "Suggested challenge"}
                  accessibilityState={{ selected: on }}
                >
                  <View style={styles.thumb} />
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{c.title ?? "Challenge"}</Text>
                    <Text style={styles.cardMeta}>{challengeDetailLine(c)}</Text>
                    <Text style={styles.match}>{matchReasonForChallenge(c, selectedGoals)}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })
          )}
          <Pressable
            onPress={onBrowse}
            accessibilityRole="link"
            accessibilityLabel="Browse all challenges"
            style={styles.browseWrap}
          >
            <Text style={styles.browse}>Browse all challenges</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={joining ? "Joining…" : "Join challenge"}
          onPress={() => {
            void handleJoin();
          }}
          disabled={!pickedId || joining}
        />
        <TextLink label="Set this up later" onPress={onSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { flex: 1, justifyContent: "center", paddingVertical: 16, gap: 10 },
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: OBV2_COLOR.card,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  cardOn: {
    borderColor: OBV2_COLOR.orange,
    shadowColor: OBV2_COLOR.orange,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 3,
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: OBV2_COLOR.sunken,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "500", color: OBV2_COLOR.ink },
  cardMeta: { fontSize: 12, fontWeight: "400", color: OBV2_COLOR.mutedWarm },
  match: { fontSize: 11, fontWeight: "500", letterSpacing: 0.4, color: OBV2_COLOR.orangeInk },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: OBV2_COLOR.mutedWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: OBV2_COLOR.orange },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: OBV2_COLOR.orange },
  browseWrap: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  browse: {
    fontSize: 13,
    fontWeight: "500",
    color: OBV2_COLOR.ink2,
    textDecorationLine: "underline",
  },
  empty: { fontSize: 15, fontWeight: "400", color: OBV2_COLOR.ink2, lineHeight: 22 },
  error: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.orangeInk, textAlign: "center" },
  footer: { paddingTop: 14, paddingBottom: 32, gap: 2 },
});

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import { suggestChallengesForGoals, type SuggestableChallenge } from "@/lib/onboarding-v2-suggest";
import { mergePickedIntoSuggestions } from "@/lib/onboarding-v2-browse";
import { joinFirstChallenge } from "@/lib/onboarding-v2-join";
import { captureError } from "@/lib/sentry";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton, TextLink } from "../ui";
import ChallengePickCard from "./ChallengePickCard";

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
  const [catalog, setCatalog] = useState<SuggestableChallenge[]>([]);
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
        const list = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) {
          setCatalog(list);
          setSuggestions(suggestChallengesForGoals(selectedGoals, list, 3));
        }
      } catch {
        if (!cancelled) {
          setCatalog([]);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGoals]);

  useEffect(() => {
    if (selectedChallengeId) setPickedId(selectedChallengeId);
  }, [selectedChallengeId]);

  const cards = useMemo(
    () => mergePickedIntoSuggestions(suggestions, catalog, pickedId),
    [suggestions, catalog, pickedId]
  );

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
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {cards.length === 0 ? (
            <Text style={styles.empty}>No starter challenges right now. Browse all or set this up later.</Text>
          ) : (
            cards.map((c) => (
              <ChallengePickCard
                key={c.id}
                challenge={c}
                selected={pickedId === c.id}
                selectedGoals={selectedGoals}
                onPress={() => pick(c)}
              />
            ))
          )}
          <Pressable
            onPress={onBrowse}
            accessibilityRole="link"
            accessibilityLabel="Browse all challenges"
            style={styles.browseWrap}
          >
            <Text style={styles.browse}>Browse all challenges</Text>
          </Pressable>
        </ScrollView>
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
  bodyScroll: { flex: 1 },
  body: { flexGrow: 1, justifyContent: "center", paddingVertical: 16, gap: 10 },
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

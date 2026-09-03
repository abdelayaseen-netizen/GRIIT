import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  suggestChallengesForGoals,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-suggest";
import { joinFirstChallenge } from "@/lib/onboarding-v2-join";
import { captureError } from "@/lib/sentry";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
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
  const [suggestions, setSuggestions] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedId, setPickedId] = useState<string | null>(null);
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

  const featured = suggestions[0];
  const rest = suggestions.slice(1);
  const joinId = pickedId ?? featured?.id ?? null;

  const handleJoin = async () => {
    if (!joinId || joining) return;
    setError("");
    setJoining(true);
    try {
      const result = await joinFirstChallenge(joinId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onJoin(joinId);
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
        <Text style={styles.h1}>Pick your first{"\n"}challenge</Text>
        <Text style={styles.sub}>Tuned to your goals. One tap and you&apos;re in.</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={OBV2_COLOR.orange} />
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {featured ? (
            <Pressable
              onPress={() => setPickedId(featured.id)}
              style={[styles.featured, pickedId === featured.id || !pickedId ? styles.featuredOn : null]}
              accessibilityRole="button"
              accessibilityLabel={featured.title ?? "Suggested challenge"}
              accessibilityState={{ selected: pickedId === featured.id || !pickedId }}
            >
              <Text style={styles.featuredTitle}>{featured.title ?? "Challenge"}</Text>
              <Text style={styles.featuredMeta}>
                {[
                  featured.duration_days != null ? `${featured.duration_days} days` : null,
                  Array.isArray(featured.tasks) ? `${featured.tasks.length} tasks` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || featured.category || "Starter"}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.empty}>No starter challenges right now. Browse all or skip.</Text>
          )}
          {rest.map((c) => {
            const on = pickedId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setPickedId(c.id)}
                style={[styles.card, on && styles.cardOn]}
                accessibilityRole="button"
                accessibilityLabel={c.title ?? "Suggested challenge"}
                accessibilityState={{ selected: on }}
              >
                <Text style={styles.cardTitle}>{c.title ?? "Challenge"}</Text>
                <Text style={styles.cardMeta}>{c.category ?? "Starter"}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={joining ? "Joining…" : "Join"}
          onPress={() => {
            void handleJoin();
          }}
          disabled={!joinId || joining}
        />
        <TextLink label="Skip for now" onPress={onSkip} />
        <TextLink label="Browse all" onPress={onBrowse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  head: { marginTop: 32 },
  h1: { fontSize: 32, fontWeight: "500", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { flex: 1, marginTop: 18 },
  listContent: { gap: 10, paddingBottom: 12 },
  featured: {
    minHeight: 120,
    borderRadius: OBV2_RADIUS.sel,
    backgroundColor: OBV2_COLOR.photoDark,
    padding: 18,
    justifyContent: "flex-end",
  },
  featuredOn: { borderWidth: 2, borderColor: OBV2_COLOR.orange },
  featuredTitle: { fontSize: 22, fontWeight: "500", color: OBV2_COLOR.onPhoto },
  featuredMeta: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.onPhotoDim, marginTop: 3 },
  card: {
    backgroundColor: OBV2_COLOR.card,
    borderRadius: OBV2_RADIUS.card,
    padding: 16,
    borderWidth: 1.5,
    borderColor: OBV2_COLOR.hair,
  },
  cardOn: { borderColor: OBV2_COLOR.orange },
  cardTitle: { fontSize: 16, fontWeight: "500", color: OBV2_COLOR.ink },
  cardMeta: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.ink2, marginTop: 4 },
  empty: { fontSize: 15, fontWeight: "400", color: OBV2_COLOR.ink2, lineHeight: 22 },
  error: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.orangeInk, textAlign: "center" },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});

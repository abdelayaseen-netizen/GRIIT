import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  catalogueForBrowseAll,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-browse";
import { OBV2_COLOR } from "../theme";
import ChallengePickCard from "./ChallengePickCard";

export default function BrowseAllPickerScreen({
  onSelect,
}: {
  onSelect: (challenge: SuggestableChallenge) => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const [catalog, setCatalog] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) setCatalog(catalogueForBrowseAll(selectedGoals, list));
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGoals]);

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>All challenges</Text>
        <Text style={styles.sub}>Pick one. You&apos;ll come back here to join.</Text>
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
          {catalog.length === 0 ? (
            <Text style={styles.empty}>No public challenges right now. Go back and set this up later.</Text>
          ) : (
            catalog.map((c) => (
              <ChallengePickCard
                key={c.id}
                challenge={c}
                selected={selectedChallengeId === c.id}
                selectedGoals={selectedGoals}
                onPress={() => onSelect(c)}
              />
            ))
          )}
        </ScrollView>
      )}
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
  body: { paddingVertical: 16, gap: 10, paddingBottom: 32 },
  empty: { fontSize: 15, fontWeight: "400", color: OBV2_COLOR.ink2, lineHeight: 22 },
});

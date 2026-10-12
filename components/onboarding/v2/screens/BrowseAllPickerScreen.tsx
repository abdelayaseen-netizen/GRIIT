import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  catalogueForBrowseAll,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-browse";
import { DS_V3 } from "@/lib/design-system";
import { OBV2_COLOR } from "../theme";
import { OnboardingScreen } from "../OnboardingChrome";
import ChallengePickCard from "./ChallengePickCard";

export default function BrowseAllPickerScreen({
  onSelect,
  onBack,
}: {
  onSelect: (challenge: SuggestableChallenge) => void;
  onBack: () => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const targetStreak = useOnboardingStore((s) => s.targetStreak);
  const [catalog, setCatalog] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) setCatalog(catalogueForBrowseAll(selectedGoals, list, targetStreak));
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGoals, targetStreak]);

  return (
    <OnboardingScreen
      step={4}
      onBack={onBack}
      title="All challenges"
      subtitle="Pick one. You'll come back here to join."
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={DS_V3.color.textSecondary} />
        </View>
      ) : catalog.length === 0 ? (
        <Text style={styles.empty}>No public challenges right now. Go back and set this up later.</Text>
      ) : (
        <View style={styles.list}>
          {catalog.map((c) => (
            <ChallengePickCard
              key={c.id}
              challenge={c}
              selected={selectedChallengeId === c.id}
              selectedGoals={selectedGoals}
              onPress={() => onSelect(c)}
            />
          ))}
        </View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 160, justifyContent: "center", alignItems: "center" },
  list: { gap: 10, paddingBottom: 32 },
  empty: { fontSize: 15, fontWeight: "400", color: OBV2_COLOR.ink2, lineHeight: 22 },
});

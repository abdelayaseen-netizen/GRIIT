import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  challengeDetailLine,
  matchReasonForChallenge,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-suggest";
import type { OnboardingGoal } from "@/store/onboardingStore";
import { OBV2_COLOR } from "../theme";

export default function ChallengePickCard({
  challenge,
  selected,
  selectedGoals,
  onPress,
}: {
  challenge: SuggestableChallenge;
  selected: boolean;
  selectedGoals: readonly OnboardingGoal[];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardOn]}
      accessibilityRole="radio"
      accessibilityLabel={challenge.title ?? "Suggested challenge"}
      accessibilityState={{ selected }}
    >
      <View style={styles.thumb} />
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{challenge.title ?? "Challenge"}</Text>
        <Text style={styles.cardMeta}>{challengeDetailLine(challenge)}</Text>
        <Text style={styles.match}>{matchReasonForChallenge(challenge, selectedGoals)}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});

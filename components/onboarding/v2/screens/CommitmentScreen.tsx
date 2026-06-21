import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import StreakFlame from "@/components/home/StreakFlame";
import { useOnboardingStore, type OnboardingCommitment } from "@/store/onboardingStore";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton } from "../ui";

type Mode = Exclude<OnboardingCommitment, null>;

function SelectCard({
  mode,
  selected,
  badge,
  title,
  body,
  onPress,
}: {
  mode: Mode;
  selected: boolean;
  badge?: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.selcard, selected && styles.selcardOn]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
    >
      <View style={styles.flameWell}>
        <StreakFlame streak={mode === "hard" ? 30 : 0} state={mode === "hard" ? "onFire" : "day0"} size={22} />
      </View>
      <View style={styles.selBody}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.selTitle}>{title}</Text>
        <Text style={styles.selSub}>{body}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export default function CommitmentScreen({ onContinue }: { onContinue: () => void }) {
  const commitment = useOnboardingStore((s) => s.commitment);
  const setCommitment = useOnboardingStore((s) => s.setCommitment);
  // Mockup pre-selects Hard mode; reflect that as the visual default until the user picks.
  const selected: Mode = commitment ?? "hard";

  const handleContinue = useCallback(() => {
    if (!commitment) setCommitment("hard");
    onContinue();
  }, [commitment, setCommitment, onContinue]);

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>How hard do{"\n"}you want it?</Text>
        <Text style={styles.sub}>You can change this on any challenge later.</Text>
      </View>

      <View style={styles.cards}>
        <SelectCard
          mode="standard"
          selected={selected === "standard"}
          title="Standard"
          body="Miss a day, spend a freeze to keep the streak. Forgiving but honest."
          onPress={() => setCommitment("standard")}
        />
        <SelectCard
          mode="hard"
          selected={selected === "hard"}
          badge="Most pick this"
          title="Hard mode"
          body="Miss a day, the streak resets to zero. No safety net."
          onPress={() => setCommitment("hard")}
        />
      </View>

      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  head: { marginTop: 30 },
  h1: { fontSize: 32, fontWeight: "800", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 12 },
  cards: { marginTop: 26, gap: 12 },
  selcard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: OBV2_COLOR.hair,
    borderRadius: OBV2_RADIUS.sel,
    backgroundColor: OBV2_COLOR.card,
  },
  selcardOn: {
    borderColor: OBV2_COLOR.orange,
    shadowColor: OBV2_COLOR.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  flameWell: { width: 24, alignItems: "center" },
  selBody: { flex: 1 },
  selTitle: { fontSize: 17, fontWeight: "700", color: OBV2_COLOR.ink, marginBottom: 3 },
  selSub: { fontSize: 13.5, color: OBV2_COLOR.ink2, lineHeight: 18 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: OBV2_COLOR.peach,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: OBV2_RADIUS.chip,
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: OBV2_COLOR.orangeInk },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: OBV2_COLOR.orange },
  radioDot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: OBV2_COLOR.orange },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26 },
});

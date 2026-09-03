import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { Kicker, PrimaryButton, TextLink } from "../ui";

export default function WhyProofScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Kicker>Why GRIIT</Kicker>
        <Text style={styles.h1}>Streaks are{"\n"}easy to fake.</Text>
        <Text style={styles.sub}>
          Every other app takes your word for it. GRIIT doesn&apos;t. Photo, GPS, or a timer — the
          day doesn&apos;t count until it&apos;s verified.
        </Text>
      </View>

      <View style={styles.proofCard}>
        <View style={styles.flamePill}>
          <Flame size={13} color={OBV2_COLOR.onPhoto} fill={OBV2_COLOR.onPhoto} />
          <Text style={styles.flamePillText}>12</Text>
        </View>
        <View style={styles.proofMeta}>
          <Text style={styles.proofTitle}>Morning run</Text>
          <Text style={styles.proofSub}>4.1 mi · 7:14am · verified</Text>
        </View>
      </View>

      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <TextLink label="Skip" onPress={onSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink, marginTop: 12 },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 14 },
  proofCard: {
    marginTop: 26,
    aspectRatio: 4 / 3,
    borderRadius: OBV2_RADIUS.sel,
    backgroundColor: OBV2_COLOR.photoDark,
    overflow: "hidden",
  },
  flamePill: {
    position: "absolute",
    top: 13,
    right: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: OBV2_COLOR.chipOnPhoto,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: OBV2_RADIUS.chip,
  },
  flamePillText: { color: OBV2_COLOR.onPhoto, fontSize: 13, fontWeight: "700" },
  proofMeta: { position: "absolute", left: 16, bottom: 14 },
  proofTitle: { color: OBV2_COLOR.onPhoto, fontSize: 17, fontWeight: "800" },
  proofSub: { color: OBV2_COLOR.onPhotoDim, fontSize: 13, marginTop: 2 },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});

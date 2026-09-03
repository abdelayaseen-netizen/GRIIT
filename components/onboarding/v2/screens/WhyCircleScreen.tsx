import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { Kicker, PrimaryButton, ProgressBar, TextLink } from "../ui";

function Avatar({ label, size = 38, ring = false }: { label: string; size?: number; ring?: boolean }) {
  return (
    <View
      style={[
        styles.av,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.avRing,
      ]}
    >
      <Text style={[styles.avText, size <= 26 && styles.avTextSm]}>{label}</Text>
    </View>
  );
}

export default function WhyCircleScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.content}>
      <ProgressBar done={2} style={styles.pbar} />
      <View style={styles.head}>
        <Kicker>Why GRIIT</Kicker>
        <Text style={styles.h1}>Your circle{"\n"}is watching.</Text>
        <Text style={styles.sub}>
          Show up for the people who&apos;ll notice when you don&apos;t. Every proof posts to your
          circle — that&apos;s the accountability.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Avatar label="MH" />
          <View>
            <Text style={styles.name}>Marcus Hale</Text>
            <Text style={styles.meta}>Day 12 · Morning routine</Text>
          </View>
        </View>
        <Text style={styles.quote}>Cold start, but it&apos;s done. Twelve straight.</Text>
        <View style={styles.respectRow}>
          <View style={styles.stack}>
            <Avatar label="K" size={26} ring />
            <View style={styles.stackOverlap}>
              <Avatar label="D" size={26} ring />
            </View>
            <View style={styles.stackOverlap}>
              <Avatar label="J" size={26} ring />
            </View>
          </View>
          <Text style={styles.respectText}>
            Respected by <Text style={styles.respectName}>Kyle</Text> and 13 others
          </Text>
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
  content: { flex: 1, paddingHorizontal: 24 },
  pbar: { marginTop: 6 },
  head: { marginTop: 22 },
  h1: { fontSize: 32, fontWeight: "800", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink, marginTop: 12 },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 14 },
  card: {
    marginTop: 26,
    backgroundColor: OBV2_COLOR.card,
    borderRadius: OBV2_RADIUS.card,
    padding: 18,
    shadowColor: OBV2_COLOR.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 11 },
  name: { fontSize: 15, fontWeight: "700", color: OBV2_COLOR.ink },
  meta: { fontSize: 12.5, color: OBV2_COLOR.ink2, marginTop: 1 },
  quote: { marginTop: 14, marginBottom: 12, fontSize: 14.5, color: OBV2_COLOR.ink, lineHeight: 20 },
  respectRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stack: { flexDirection: "row" },
  stackOverlap: { marginLeft: -9 },
  av: { backgroundColor: OBV2_COLOR.avatar, alignItems: "center", justifyContent: "center" },
  avRing: { borderWidth: 2, borderColor: OBV2_COLOR.card },
  avText: { fontWeight: "700", fontSize: 13, color: OBV2_COLOR.ink2 },
  avTextSm: { fontSize: 11 },
  respectText: { fontSize: 13, color: OBV2_COLOR.ink2, flex: 1 },
  respectName: { color: OBV2_COLOR.ink, fontWeight: "700" },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});

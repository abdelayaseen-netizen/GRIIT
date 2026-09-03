import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { Kicker, PrimaryButton } from "../ui";

function Avatar({ label, size = 42, ring = false }: { label: string; size?: number; ring?: boolean }) {
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
}: {
  onContinue: () => void;
  onSkip?: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Kicker>How GRIIT works</Kicker>
        <Text style={styles.h1}>Your circle is watching.</Text>
        <Text style={styles.sub}>
          Show up for the people who&apos;ll notice when you don&apos;t. Every proof posts to your
          circle — that&apos;s the accountability.
        </Text>
      </View>

      <View style={styles.body}>
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

        <View style={styles.privacy}>
          <Text style={styles.privacyTitle}>You choose who sees it</Text>
          <Text style={styles.privacySub}>Invite up to 8 people. Nothing is public, ever.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink, marginTop: 10 },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flex: 1, justifyContent: "center", paddingVertical: 16, gap: 12 },
  card: {
    backgroundColor: OBV2_COLOR.card,
    borderRadius: 22,
    padding: 18,
    shadowColor: OBV2_COLOR.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 16, fontWeight: "500", color: OBV2_COLOR.ink },
  meta: { fontSize: 13, color: OBV2_COLOR.mutedWarm, marginTop: 1 },
  quote: { marginTop: 14, fontSize: 15, color: OBV2_COLOR.ink, lineHeight: 22 },
  respectRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  stack: { flexDirection: "row" },
  stackOverlap: { marginLeft: -8 },
  av: { backgroundColor: OBV2_COLOR.avatar, alignItems: "center", justifyContent: "center" },
  avRing: { borderWidth: 2, borderColor: OBV2_COLOR.card },
  avText: { fontWeight: "500", fontSize: 13, color: OBV2_COLOR.ink2 },
  avTextSm: { fontSize: 10 },
  respectText: { fontSize: 13, color: OBV2_COLOR.ink2, flex: 1 },
  respectName: { color: OBV2_COLOR.ink, fontWeight: "500" },
  privacy: {
    backgroundColor: OBV2_COLOR.sunken,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 4,
  },
  privacyTitle: { fontSize: 13, fontWeight: "500", color: OBV2_COLOR.ink },
  privacySub: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: OBV2_COLOR.ink2 },
  footer: { paddingTop: 14, paddingBottom: 32 },
});

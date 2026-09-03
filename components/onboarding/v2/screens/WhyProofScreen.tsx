import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { Kicker, PrimaryButton } from "../ui";

const PROOF_KINDS = [
  { kind: "PHOTO", use: "Show the work" },
  { kind: "GPS", use: "Prove you went" },
  { kind: "TIMER", use: "Prove the time" },
] as const;

export default function WhyProofScreen({
  onContinue,
}: {
  onContinue: () => void;
  onSkip?: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Kicker>How GRIIT works</Kicker>
        <Text style={styles.h1}>Streaks are easy to fake.</Text>
        <Text style={styles.sub}>
          Every other app takes your word for it. GRIIT doesn&apos;t. The day doesn&apos;t count until
          it&apos;s verified.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.proofCard}>
          <View style={styles.photo}>
            <Text style={styles.photoCaption}>verification photo</Text>
            <View style={styles.dayBadge}>
              <View style={styles.dayDot} />
              <Text style={styles.dayBadgeText}>DAY 12</Text>
            </View>
          </View>
          <View style={styles.proofFooter}>
            <View>
              <Text style={styles.proofTitle}>Morning run</Text>
              <Text style={styles.proofSub}>4.1 mi · 7:14am · Sector 7</Text>
            </View>
            <View style={styles.verified}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        <View style={styles.kinds}>
          {PROOF_KINDS.map((p) => (
            <View key={p.kind} style={styles.kindCard}>
              <Text style={styles.kind}>{p.kind}</Text>
              <Text style={styles.kindUse}>{p.use}</Text>
            </View>
          ))}
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
  body: { flex: 1, justifyContent: "center", paddingVertical: 16, gap: 10 },
  proofCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: OBV2_COLOR.photoDark,
  },
  photo: {
    height: 206,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OBV2_COLOR.blackBtn,
  },
  photoCaption: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: OBV2_COLOR.ink2,
  },
  dayBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: OBV2_COLOR.orange,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: OBV2_COLOR.onDark },
  dayBadgeText: { fontSize: 12, fontWeight: "500", color: OBV2_COLOR.onDark },
  proofFooter: {
    paddingTop: 15,
    paddingHorizontal: 18,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  proofTitle: { fontSize: 17, fontWeight: "500", color: OBV2_COLOR.onPhoto },
  proofSub: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.ink3, marginTop: 2 },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: OBV2_COLOR.peach,
  },
  verifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: OBV2_COLOR.orange },
  verifiedText: { fontSize: 12, fontWeight: "500", letterSpacing: 0.4, color: OBV2_COLOR.orangeInk },
  kinds: { flexDirection: "row", gap: 8 },
  kindCard: {
    flex: 1,
    backgroundColor: OBV2_COLOR.card,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 3,
  },
  kind: { fontSize: 12, fontWeight: "500", letterSpacing: 0.8, color: OBV2_COLOR.ink },
  kindUse: { fontSize: 11, fontWeight: "400", lineHeight: 14, color: OBV2_COLOR.mutedWarm },
  footer: { paddingTop: 14, paddingBottom: 32 },
});

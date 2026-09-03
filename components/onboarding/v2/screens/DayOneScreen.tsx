import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton } from "../ui";

/** Phase 1 stub. Live challenge card lands in Phase 3. CTA completes onboarding. */
export default function DayOneScreen({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>You&apos;re in.</Text>
        <Text style={styles.sub}>Tomorrow is Day 1. Here is exactly what it looks like.</Text>
      </View>
      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Start Day 1" onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 32 },
});

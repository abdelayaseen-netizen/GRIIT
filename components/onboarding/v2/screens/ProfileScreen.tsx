import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton } from "../ui";

/** Chunk A stub. Real Profile (photo, username, greeting fallback) is Chunk B. */
export default function ProfileScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>You&apos;re in.</Text>
        <Text style={styles.sub}>Add a name and photo later. Continue to start Day 1.</Text>
      </View>
      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  head: { marginTop: 32 },
  h1: { fontSize: 32, fontWeight: "500", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 12 },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26 },
});

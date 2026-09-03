import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

/** Phase 1 stub. Share sheet + skip land in Phase 3. No contact rows. */
export default function InviteScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>Bring three people</Text>
        <Text style={styles.sub}>
          Members with a circle of three or more are far likelier to finish. Invite the ones who
          will actually say something.
        </Text>
      </View>
      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <TextLink label="I'll build my circle later" onPress={onSkip} />
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

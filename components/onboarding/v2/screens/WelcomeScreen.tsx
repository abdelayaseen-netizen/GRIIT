import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { LogoMark, PrimaryButton, TextLink } from "../ui";

export default function WelcomeScreen({
  onGetStarted,
  onHaveAccount,
}: {
  onGetStarted: () => void;
  onHaveAccount: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <LogoMark size="hero" />
        <Text style={styles.wordmark}>GRIIT</Text>
        <View style={styles.copy}>
          <Text style={styles.display}>Discipline,{"\n"}witnessed.</Text>
          <Text style={styles.sub}>
            The habit app that makes you prove it. Real verification, your circle watching.
          </Text>
        </View>
        <View style={styles.strip}>
          <Text style={styles.stripItem}>PHOTO</Text>
          <Text style={styles.stripSep}>·</Text>
          <Text style={styles.stripItem}>GPS</Text>
          <Text style={styles.stripSep}>·</Text>
          <Text style={styles.stripItem}>TIMER</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Get started" onPress={onGetStarted} />
        <TextLink label="I already have an account" onPress={onHaveAccount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", gap: 20 },
  wordmark: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 6,
    color: OBV2_COLOR.ink,
    marginTop: 2,
  },
  copy: { alignItems: "center" },
  display: {
    fontSize: 46,
    fontWeight: "500",
    lineHeight: 44,
    letterSpacing: -1.8,
    color: OBV2_COLOR.ink,
    textAlign: "center",
    marginTop: 8,
  },
  sub: {
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 25,
    color: OBV2_COLOR.ink2,
    textAlign: "center",
    marginTop: 16,
    maxWidth: 290,
  },
  strip: { flexDirection: "row", alignItems: "center", gap: 18 },
  stripItem: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.2,
    color: OBV2_COLOR.mutedWarm,
  },
  stripSep: { fontSize: 12, color: OBV2_COLOR.borderDashed },
  footer: { paddingTop: 14, paddingBottom: 32, gap: 2 },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

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
        <View style={styles.logoRow}>
          <View style={styles.bar}>
            <View style={styles.barCap} />
          </View>
          <View style={styles.bar}>
            <View style={styles.barCap} />
          </View>
        </View>
        <View style={styles.copy}>
          <Text style={styles.display}>Discipline,{"\n"}witnessed.</Text>
          <Text style={styles.sub}>
            The habit app that makes you prove it. Real verification, your circle watching.
          </Text>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 14 },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", gap: 22 },
  logoRow: { flexDirection: "row", alignItems: "flex-end", gap: 7 },
  bar: { width: 15, height: 73, backgroundColor: OBV2_COLOR.orange, borderRadius: 5 },
  barCap: {
    position: "absolute",
    top: -19,
    left: 0,
    width: 15,
    height: 13,
    backgroundColor: OBV2_COLOR.orange,
    borderRadius: 4,
  },
  copy: { alignItems: "center" },
  display: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.76,
    color: OBV2_COLOR.ink,
    textAlign: "center",
  },
  sub: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 23,
    color: OBV2_COLOR.ink2,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 6,
  },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});

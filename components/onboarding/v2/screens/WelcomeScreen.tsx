/**
 * Welcome — frame 19 and 02_screens.md Welcome.
 * Display face on a headline is permitted here only (02_screens.md:311, law 2).
 * Size is 44pt Barlow (02_screens.md:305–306); 44 is DS_V3.size.tap.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";

function LogoBars() {
  const bar = DS_V3.space.gutter / 2;
  return (
    <View style={styles.logo} accessibilityLabel="GRIIT">
      <View style={[styles.bar, { height: DS_V3.size.avatar.xs }]} />
      <View style={[styles.bar, { height: DS_V3.type.body.lineHeight, width: bar }]} />
    </View>
  );
}

export default function WelcomeScreen({
  onGetStarted,
  onHaveAccount,
}: {
  onGetStarted: () => void;
  onHaveAccount: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={[styles.logoWrap, { paddingTop: insets.top + DS_V3.space.sm }]}>
        <LogoBars />
      </View>
      <View style={styles.center}>
        <Text style={styles.headline}>
          {"Discipline,\nwitnessed."}
        </Text>
        <Text style={styles.sub}>Photo proof. Daily. No way to fake it.</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + DS_V3.space.gutter }]}>
        <Button label="Start" onPress={onGetStarted} />
        <Button label="Log in" variant="tertiary" ink onPress={onHaveAccount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  logoWrap: {
    paddingHorizontal: DS_V3.space.gutter,
  },
  logo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.sm,
    height: DS_V3.size.avatar.xs,
  },
  bar: {
    width: DS_V3.space.gutter / 2,
    borderRadius: DS_V3.space.xs,
    backgroundColor: DS_V3.color.brand,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.lg,
  },
  headline: {
    fontFamily: DS_V3.type.number.fontFamily,
    fontWeight: DS_V3.type.number.fontWeight,
    fontSize: DS_V3.size.tap,
    lineHeight: DS_V3.size.tap,
    letterSpacing: DS_V3.type.number.letterSpacing,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  sub: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});

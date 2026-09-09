import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { PrimaryButton, TextLink } from "../ui";

export default function NotBuiltScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.body}>
        <Text style={styles.line}>Not built</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <TextLink label="Skip" onPress={onSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: DS_V3.space.section,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  line: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    paddingTop: DS_V3.space.md,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.xs,
  },
});

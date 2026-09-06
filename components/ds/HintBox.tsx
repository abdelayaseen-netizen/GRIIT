/**
 * HintBox — 01_components.md "HintBox"
 * Create wizard only. Everywhere else a hint is a caption line under a heading.
 * Laws: 24.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

const ICON = DS_V3.space.xs * 6;

export type HintBoxProps = {
  children: string;
};

export default function HintBox({ children }: HintBoxProps) {
  return (
    <View style={styles.box}>
      <Lightbulb
        size={ICON}
        color={DS_V3.color.brandText}
        accessibilityLabel="Hint"
      />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.input,
    padding: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  text: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.brandText,
  },
});

/**
 * PushedHeader — 01_components.md "PushedHeader"
 * Laws: 8 (44pt bar, chevron left, centered bodyStrong).
 */
import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

const ICON = DS_V3.space.xs * 6;

export type PushedHeaderProps = {
  title: string;
  onBack: () => void;
  trailing?: ReactNode;
};

export default function PushedHeader({ title, onBack, trailing }: PushedHeaderProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.side}
      >
        <ChevronLeft size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
});

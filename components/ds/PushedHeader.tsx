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
  /** Small type label above the title (106). */
  label?: string;
  onBack: () => void;
  trailing?: ReactNode;
};

export default function PushedHeader({ title, label, onBack, trailing }: PushedHeaderProps) {
  return (
    <View style={[styles.bar, label ? styles.barTall : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.side}
      >
        <ChevronLeft size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
      <View style={styles.center}>
        {label ? (
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
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
  barTall: {
    height: DS_V3.size.tap + DS_V3.space.gutter,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
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

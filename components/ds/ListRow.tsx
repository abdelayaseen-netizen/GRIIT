/**
 * ListRow — 01_components.md "ListRow"
 * Laws: 20 (44 minimum), 21 (rows on canvas or inside one settings card, never a card per row).
 * Leading glyph is a Lucide icon at 24, the same package the repo already uses
 * (e.g. components/task-v2/TaskConfirmation.tsx:3 `import { Check } from "lucide-react-native"`).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 6;

export type ListRowProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  rank?: number;
  highlight?: boolean;
  divider?: boolean;
  onPress?: () => void;
};

export default function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  rank,
  highlight,
  divider = true,
  onPress,
}: ListRowProps) {
  const body = (
    <>
      {rank != null ? (
        <Text style={styles.rank} accessibilityLabel={`Rank ${rank}`}>
          {rank}
        </Text>
      ) : null}
      {icon ? (
        <View style={styles.iconSlot} accessibilityElementsHidden>
          {icon}
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing !== undefined ? (
        trailing
      ) : onPress ? (
        <ChevronRight
          size={ICON}
          color={DS_V3.color.textSecondary}
          accessibilityLabel="Open"
        />
      ) : null}
    </>
  );

  const rowStyle = [
    styles.row,
    highlight ? styles.highlight : null,
  ];

  if (onPress) {
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onPress}
          style={({ pressed }) => [
            rowStyle,
            pressed ? styles.pressed : null,
          ]}
        >
          {body}
        </Pressable>
        {highlight || !divider ? null : <View style={styles.divider} />}
      </View>
    );
  }

  return (
    <View>
      <View style={rowStyle}>{body}</View>
      {highlight || !divider ? null : <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: DS_V3.size.avatar.md,
    paddingVertical: DS_V3.space.gutter,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  highlight: {
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.lg,
  },
  pressed: {
    backgroundColor: DS_V3.color.surface,
    opacity: 0.6,
  },
  iconSlot: {
    minWidth: ICON,
    minHeight: ICON,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  rank: {
    width: ICON,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  divider: {
    height: PT,
    backgroundColor: DS_V3.color.border,
  },
});

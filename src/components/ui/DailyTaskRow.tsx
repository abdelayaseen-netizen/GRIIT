import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_MEASURES, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  icon: React.ReactNode;
  title: string;
  metadata?: string;
  showDivider?: boolean;
  iconBackgroundColor?: string;
};

const ICON = DS_MEASURES.AVATAR_MD;

export function DailyTaskRow({ icon, title, metadata, showDivider = true, iconBackgroundColor }: Props) {
  return (
    <>
      <View style={styles.row}>
        <View style={[styles.iconWrap, iconBackgroundColor != null && { backgroundColor: iconBackgroundColor }]}>{icon}</View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {metadata != null && metadata !== "" && (
            <Text style={styles.meta} numberOfLines={1}>{metadata}</Text>
          )}
        </View>
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    paddingVertical: DS_SPACING.md,
    gap: DS_SPACING.md,
  },
  iconWrap: {
    width: ICON,
    height: ICON,
    borderRadius: ICON / 2,
    backgroundColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textPrimary,
  },
  meta: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
  },
});

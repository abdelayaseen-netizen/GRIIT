import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, measures } from "@/src/theme/tokens";

type Props = {
  icon: React.ReactNode;
  title: string;
  metadata?: string;
  showDivider?: boolean;
  iconBackgroundColor?: string;
};

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
    minHeight: measures.dailyTaskRowHeight,
    paddingVertical: 12,
  },
  iconWrap: {
    width: measures.previewIconSize,
    height: measures.previewIconSize,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: typography.dailyTaskTitle.fontSize,
    fontWeight: typography.dailyTaskTitle.fontWeight,
    color: colors.textPrimary,
  },
  meta: {
    fontSize: typography.dailyTaskMeta.fontSize,
    color: colors.textSecondaryCreate,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SectionHeader({ title, actionLabel, onPressAction, style }: Props) {
  const seeAllLabel = `See all ${title}`;
  return (
    <View style={[s.row, style]}>
      <Text style={s.title}>{title}</Text>
      {actionLabel && onPressAction ? (
        <TouchableOpacity
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={seeAllLabel}
        >
          <Text style={s.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  action: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.DISCOVER_CORAL,
    fontWeight: "600",
  },
});


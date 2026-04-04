import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_RADIUS, DS_BORDERS } from "@/lib/design-system"

type SelectionCardProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  leftIcon?: React.ReactNode;
  showCheck?: boolean;
  style?: ViewStyle;
};

export function SelectionCard({
  title,
  subtitle,
  selected,
  onPress,
  leftIcon,
  showCheck = true,
  style,
}: SelectionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected }}
    >
      {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {showCheck && selected ? (
        <View style={styles.checkWrap}>
          <Check size={22} color={DS_COLORS.white} strokeWidth={2.5} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    marginBottom: DS_SPACING.lg,
  },
  cardSelected: {
    borderWidth: DS_BORDERS.widthStrong,
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.accentSoft + "20",
  },
  iconWrap: { marginRight: DS_SPACING.lg },
  content: { flex: 1 },
  title: {
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.cardTitle.fontWeight,
    color: DS_COLORS.textPrimary,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
    lineHeight: DS_TYPOGRAPHY.secondary.lineHeight,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: DS_SPACING.md,
  },
});

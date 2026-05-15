import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

function TaskTypeCardInner(p: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  accentColor: string;
  /** When set, used as selected background instead of accentColor + 08 */
  selectedBackgroundColor?: string;
}) {
  const selectedBg = p.selectedBackgroundColor ?? `${p.accentColor}08`;
  return (
    <TouchableOpacity
      style={[
        styles.card,
        p.selected && {
          borderColor: p.accentColor,
          backgroundColor: selectedBg,
        },
      ]}
      onPress={p.onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${p.label} task type — ${p.selected ? "selected" : "tap to select"}`}
      accessibilityRole="button"
      accessibilityState={{ selected: p.selected }}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: p.selected ? `${p.accentColor}30` : `${p.accentColor}18` },
        ]}
      >
        {p.icon}
      </View>
      <Text
        style={[
          styles.label,
          p.selected && { color: p.accentColor, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
        ]}
      >
        {p.label}
      </Text>
      {p.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {p.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export const TaskTypeCard = React.memo(TaskTypeCardInner);

const styles = StyleSheet.create({
  card: {
    height: 120,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  iconCircle: {
    width: DS_MEASURES.AVATAR_MD,
    height: DS_MEASURES.AVATAR_MD,
    borderRadius: DS_MEASURES.AVATAR_MD / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
  },
  description: {
    fontSize: 11,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
});

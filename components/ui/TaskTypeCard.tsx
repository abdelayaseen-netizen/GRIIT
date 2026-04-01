import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  colors,
  radius,
  measures,
  typography,
} from "@/lib/theme/tokens";

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
          p.selected && { color: p.accentColor, fontWeight: "600" },
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
    height: measures.taskTypeCardHeight,
    backgroundColor: colors.cardBg,
    borderRadius: radius.taskTypeCard,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  iconCircle: {
    width: measures.taskTypeIconCircle,
    height: measures.taskTypeIconCircle,
    borderRadius: measures.taskTypeIconCircle / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: typography.primaryBody.fontSize,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
});

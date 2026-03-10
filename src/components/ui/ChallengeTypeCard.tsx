import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/src/theme/tokens";

type Props = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
};

export function ChallengeTypeCard({ title, description, selected, onPress, icon }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`Select ${title} challenge type`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon != null && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.cardBg,
    borderRadius: radius.cardCreate,
    padding: spacing.gridL,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  cardSelected: {
    backgroundColor: colors.accentOrangeSoft,
    borderColor: colors.accentOrangeCreate,
  },
  iconWrap: { marginBottom: spacing.gridS },
  title: {
    fontSize: typography.challengeCardTitle.fontSize,
    fontWeight: typography.challengeCardTitle.fontWeight,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  titleSelected: { color: colors.accentOrangeCreate },
  desc: {
    fontSize: typography.challengeCardDesc.fontSize,
    color: colors.textSecondaryCreate,
  },
});

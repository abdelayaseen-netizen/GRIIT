import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "@/src/theme/colors";
import { radius } from "@/src/theme/radius";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

interface ListOptionCardProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
}

export function ListOptionCard(props: ListOptionCardProps) {
  const { title, subtitle, leftIcon, selected, onPress } = props;
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {selected ? (
        <View style={styles.checkWrap}>
          <Check size={20} color={colors.borderStrong} strokeWidth={2.5} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  selected: { borderColor: colors.borderStrong, borderWidth: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  title: { ...typography.body, fontWeight: "600", color: colors.text },
  subtitle: { ...typography.body2, color: colors.textMuted, marginTop: 2 },
  checkWrap: { marginLeft: spacing.sm },
});

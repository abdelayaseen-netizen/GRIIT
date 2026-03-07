import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Compass, RefreshCw, ChevronRight } from "lucide-react-native";
import {
  colors,
  radius,
  spacing,
  typography,
  iconSizes,
} from "@/src/theme/tokens";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  secondaryCtaLabel?: string;
  onSecondaryCta?: () => void;
}

export function EmptyState({
  title = "No challenges found",
  subtitle = "Try a different search or category",
  primaryCtaLabel = "Start your first challenge ›",
  onPrimaryCta,
  secondaryCtaLabel = "Refresh",
  onSecondaryCta,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Compass size={iconSizes.emptyIcon} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onPrimaryCta && (
        <TouchableOpacity style={styles.primaryCta} onPress={onPrimaryCta} activeOpacity={0.85}>
          <Text style={styles.primaryCtaText}>{primaryCtaLabel}</Text>
          <ChevronRight size={18} color={colors.white} />
        </TouchableOpacity>
      )}
      {onSecondaryCta && (
        <TouchableOpacity style={styles.secondaryCta} onPress={onSecondaryCta} activeOpacity={0.7}>
          <RefreshCw size={16} color={colors.accentOrange} />
          <Text style={styles.secondaryCtaText}>{secondaryCtaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.emptyIcon,
    backgroundColor: colors.chipFill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.emptyTitle.fontSize,
    fontWeight: typography.emptyTitle.fontWeight,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.emptySub.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    paddingHorizontal: 24,
    backgroundColor: colors.accentOrange,
    borderRadius: radius.primaryButton,
    marginBottom: spacing.md,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentOrange,
  },
});

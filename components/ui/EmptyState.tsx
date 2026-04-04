import { DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Compass, RefreshCw, ChevronRight } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  colors,
  radius,
  spacing,
  typography,
  iconSizes,
} from "@/lib/theme/tokens";

export interface EmptyStateProps {
  /** Custom icon; defaults to Compass when omitted. */
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  /** Single primary action (legacy API). */
  action?: { label: string; onPress: () => void };
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  secondaryCtaLabel?: string;
  onSecondaryCta?: () => void;
}

function EmptyStateInner({
  icon: IconProp,
  title = "No challenges found",
  subtitle,
  action,
  primaryCtaLabel = "Start your first challenge ›",
  onPrimaryCta,
  secondaryCtaLabel = "Refresh",
  onSecondaryCta,
}: EmptyStateProps) {
  const Icon = IconProp ?? Compass;
  const primaryPress = action?.onPress ?? onPrimaryCta;
  const primaryLabel = action?.label ?? primaryCtaLabel;
  const showPrimary = Boolean(primaryPress);
  const displaySubtitle =
    subtitle !== undefined ? (subtitle.trim() || undefined) : IconProp ? undefined : "Try a different search or category";

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={iconSizes.emptyIcon} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {displaySubtitle ? <Text style={styles.subtitle}>{displaySubtitle}</Text> : null}
      {showPrimary && primaryPress ? (
        <TouchableOpacity
          style={styles.primaryCta}
          onPress={primaryPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
        >
          <Text style={styles.primaryCtaText}>{primaryLabel}</Text>
          <ChevronRight size={18} color={colors.white} />
        </TouchableOpacity>
      ) : null}
      {onSecondaryCta ? (
        <TouchableOpacity
          style={styles.secondaryCta}
          onPress={onSecondaryCta}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={secondaryCtaLabel}
        >
          <RefreshCw size={16} color={colors.accentOrange} />
          <Text style={styles.secondaryCtaText}>{secondaryCtaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export const EmptyState = React.memo(EmptyStateInner);

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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: colors.accentOrange,
  },
});

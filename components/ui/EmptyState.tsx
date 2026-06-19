import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Compass, RefreshCw, ChevronRight } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

/** Inlined from lib/theme/tokens.ts `typography.emptyTitle` — value-preserving migration (Phase 2). */
const THEME_TYPO_EMPTY_TITLE = {
  fontSize: 17,
  fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  lineHeight: 24,
};

/** Inlined from lib/theme/tokens.ts `typography.emptySub` — value-preserving migration (Phase 2). */
const THEME_TYPO_EMPTY_SUB = {
  fontSize: 14,
  fontWeight: "400" as const,
  lineHeight: 20,
};

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
        <Icon size={32} color={DS_COLORS.textSecondary} />
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
          <ChevronRight size={18} color={DS_COLORS.white} />
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
          <RefreshCw size={16} color={DS_COLORS.accent} />
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
    borderRadius: 32,
    backgroundColor: DS_COLORS.chipFill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DS_SPACING.lg,
  },
  title: {
    fontSize: THEME_TYPO_EMPTY_TITLE.fontSize,
    fontWeight: THEME_TYPO_EMPTY_TITLE.fontWeight,
    lineHeight: THEME_TYPO_EMPTY_TITLE.lineHeight,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: THEME_TYPO_EMPTY_SUB.fontSize,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: DS_SPACING.xl,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    paddingHorizontal: 24,
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.card,
    marginBottom: DS_SPACING.md,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.white,
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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.accent,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as t from "@/src/theme/tokens";

const DOT_COLORS: Record<string, string> = {
  orange: t.colors.orangeStripe,
  red: t.colors.redStripe,
  purple: t.colors.purpleStripe,
  blue: t.colors.blueStripe,
  green: t.colors.greenStripe,
};

export function ChallengeRowCard(props: {
  title: string;
  description: string;
  stripeColor: string;
  durationLabel: string;
  taskCount: number;
  participantsCount: number;
  statusDotColor?: string;
  onPress: () => void;
}) {
  const {
    title,
    description,
    stripeColor,
    durationLabel,
    taskCount,
    participantsCount,
    statusDotColor,
    onPress,
  } = props;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[s.stripe, { backgroundColor: stripeColor }]} />
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {statusDotColor != null && (
            <View style={[s.statusDot, { backgroundColor: statusDotColor }]} />
          )}
        </View>
        <Text style={s.desc} numberOfLines={1}>{description}</Text>
        <View style={s.meta}>
          <Text style={s.metaLeft}>
            {durationLabel} · {taskCount} tasks
          </Text>
          {participantsCount > 0 && (
            <Text style={s.metaRight}>{formatCount(participantsCount)} joined</Text>
          )}
        </View>
      </View>
      <View style={s.arrowWrap}>
        <ChevronRight size={t.iconSizes.arrowButton + 2} color={t.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.card,
    overflow: "hidden",
    ...t.borders.card,
    ...t.shadows.subtle,
  },
  stripe: {
    width: t.measures.stripeWidth,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: t.spacing.lg,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: t.typography.compactTitle.fontSize,
    fontWeight: t.typography.compactTitle.fontWeight,
    color: t.colors.textPrimary,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  desc: {
    fontSize: t.typography.compactDesc.fontSize,
    color: t.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  metaLeft: {
    fontSize: 12,
    fontWeight: "500",
    color: t.colors.textSecondary,
  },
  metaRight: {
    fontSize: 12,
    fontWeight: "500",
    color: t.colors.textSecondary,
  },
  arrowWrap: {
    width: 36,
    height: 36,
    borderRadius: t.radius.iconButton,
    backgroundColor: t.colors.chipFill,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

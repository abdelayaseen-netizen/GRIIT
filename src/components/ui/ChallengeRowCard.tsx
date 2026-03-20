import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, Calendar } from "lucide-react-native";
import { DS_COLORS, DS_SHADOWS } from "@/lib/design-system";

function getStripeColorByCategory(category?: string): string {
  const cat = (category ?? "").toUpperCase();
  if (cat === "FITNESS") return DS_COLORS.ACCENT_PRIMARY;
  if (cat === "MIND") return DS_COLORS.CATEGORY_MIND_STRIPE;
  if (cat === "DISCIPLINE") return DS_COLORS.ACCENT_GREEN;
  if (cat === "FAITH") return DS_COLORS.CATEGORY_FAITH_STRIPE;
  return DS_COLORS.ACCENT_PRIMARY;
}

const DIFF_PILL_DEFAULT = { bg: DS_COLORS.DIFFICULTY_MEDIUM_BG, text: DS_COLORS.DIFFICULTY_MEDIUM_TEXT };
const DIFF_PILL: Record<string, { bg: string; text: string }> = {
  Easy: { bg: DS_COLORS.GREEN_BG, text: DS_COLORS.ACCENT_GREEN },
  Medium: DIFF_PILL_DEFAULT,
  Hard: { bg: DS_COLORS.ACCENT_TINT, text: DS_COLORS.ACCENT_PRIMARY },
  Extreme: { bg: DS_COLORS.DIFFICULTY_EXTREME_BG, text: DS_COLORS.DIFFICULTY_EXTREME_TEXT },
};

function ChallengeRowCardInner(props: {
  title: string;
  description: string;
  stripeColor?: string;
  category?: string;
  durationLabel: string;
  taskCount: number;
  participantsCount: number;
  statusDotColor?: string;
  onPress: () => void;
  onPressIn?: () => void;
  participationType?: string;
  teamSize?: number;
  /** Shown before duration when set (e.g. team Discover cards). */
  teamMeta?: string;
  sharedGoalTarget?: number;
  sharedGoalUnit?: string;
  index?: number;
  difficulty?: string;
}) {
  const {
    title,
    description,
    durationLabel,
    taskCount,
    participantsCount,
    onPress,
    onPressIn,
    difficulty = "Medium",
  } = props;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const stripeColor = props.stripeColor ?? getStripeColorByCategory(props.category);
  const diff = DIFF_PILL[difficulty] ?? DIFF_PILL_DEFAULT;
  return (
    <TouchableOpacity
      style={[s.card, DS_SHADOWS.cardSubtle]}
      onPressIn={onPressIn}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${title}, ${participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={[s.stripe, { backgroundColor: stripeColor }]} />
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{difficulty}</Text>
          </View>
        </View>
        <Text style={s.desc} numberOfLines={1}>{description}</Text>
        <View style={s.meta}>
          <View style={s.metaLeft}>
            <Calendar size={12} color={DS_COLORS.TEXT_MUTED} />
            <Text style={s.metaLeftText}>
              {props.teamMeta ? `${props.teamMeta} · ` : ""}
              {durationLabel} · {taskCount} {taskCount === 1 ? "goal" : "goals"}
            </Text>
          </View>
          {(participantsCount ?? 0) > 0 && (
            <Text style={s.metaRight}>{formatCount(participantsCount)} members</Text>
          )}
        </View>
      </View>
      <View style={s.arrowWrap}>
        <ChevronRight size={18} color={DS_COLORS.ACCENT_PRIMARY} />
      </View>
    </TouchableOpacity>
  );
}

export const ChallengeRowCard = React.memo(ChallengeRowCardInner);

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
  },
  stripe: {
    width: 4,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    padding: 14,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  diffPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginLeft: 8,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLeftText: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.TEXT_MUTED,
  },
  metaRight: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS.TEXT_MUTED,
  },
  arrowWrap: {
    paddingRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, ListTodo, Users } from "lucide-react-native";
import { DS_COLORS, DS_SHADOWS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

const DIFF_STYLES_DEFAULT = { bg: DS_COLORS.DIFFICULTY_MEDIUM_BG, text: DS_COLORS.DIFFICULTY_MEDIUM_TEXT };
const DIFF_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: DS_COLORS.GREEN_BG, text: DS_COLORS.ACCENT_GREEN },
  Medium: DIFF_STYLES_DEFAULT,
  Hard: { bg: DS_COLORS.ACCENT_TINT, text: DS_COLORS.ACCENT_PRIMARY },
  Extreme: { bg: DS_COLORS.DIFFICULTY_EXTREME_BG, text: DS_COLORS.DIFFICULTY_EXTREME_TEXT },
};

function getStripeColorByCategory(category?: string): string {
  const cat = (category ?? "").toUpperCase();
  if (cat === "FITNESS") return DS_COLORS.ACCENT_PRIMARY;
  if (cat === "MIND") return DS_COLORS.CATEGORY_MIND_STRIPE;
  if (cat === "DISCIPLINE") return DS_COLORS.ACCENT_GREEN;
  if (cat === "FAITH") return DS_COLORS.CATEGORY_FAITH_STRIPE;
  return DS_COLORS.ACCENT_PRIMARY;
}

function getTaskEmoji(icon: string): string {
  const map: Record<string, string> = {
    timer: "⏱",
    photo: "📸",
    journal: "✍️",
    run: "🏃",
    checkin: "📍",
    manual: "✓",
  };
  return map[(icon ?? "").toLowerCase()] ?? "✓";
}

function ChallengeCardFeaturedInner(props: {
  title: string;
  description: string;
  difficulty: string;
  stripeColor?: string;
  category?: string;
  tasksPreview: { icon: string; label: string }[];
  durationLabel: string;
  taskCount: number;
  participantsCount: number;
  activeTodayCount: number;
  isFeatured?: boolean;
  is24h?: boolean;
  onPress: () => void;
  onPressIn?: () => void;
}) {
  const {
    title,
    description,
    difficulty,
    tasksPreview,
    durationLabel,
    taskCount,
    participantsCount,
    onPress,
    onPressIn,
    category,
    isFeatured,
    is24h,
  } = props;
  const stripeColor = props.stripeColor ?? getStripeColorByCategory(category);
  const diff = DIFF_STYLES[difficulty] ?? DIFF_STYLES_DEFAULT;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));
  const eyebrowLabel =
    isFeatured ? "🏆 FEATURED" :
    is24h ? "⚡ 24-HOUR" :
    (participantsCount ?? 0) > 100 ? `🔥 ${formatCount(participantsCount)} active` :
    null;
  return (
    <TouchableOpacity
      style={[s.card, DS_SHADOWS.card]}
      onPressIn={onPressIn}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={`${title}, ${participantsCount} participants`}
      accessibilityRole="button"
    >
      <View style={[s.stripe, { backgroundColor: stripeColor }]} />
      <View style={s.content}>
        <View style={s.topRow}>
          {eyebrowLabel ? (
            <View style={[s.eyebrowBadge, is24h ? s.eyebrow24h : s.eyebrowFeatured]}>
              <Text style={[s.eyebrowText, is24h ? s.eyebrow24hText : s.eyebrowFeaturedText]}>{eyebrowLabel}</Text>
            </View>
          ) : (
            <View style={s.eyebrowSpacer} />
          )}
          <View style={[s.diffPill, { backgroundColor: diff.bg }]}>
            <Text style={[s.diffText, { color: diff.text }]}>{difficulty}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        <Text style={s.desc} numberOfLines={2}>{description}</Text>
        <View style={s.chipsRow}>
          {tasksPreview.slice(0, 2).map((task, i) => (
            <View key={i} style={s.taskChip}>
              <Text style={s.taskChipText} numberOfLines={1}>{getTaskEmoji(task.icon)} {task.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.metaRow}>
          <View style={s.metaLeft}>
            <Calendar size={14} color={DS_COLORS.TEXT_MUTED} />
            <Text style={s.metaText}>{durationLabel}</Text>
            <Text style={s.metaDot}>·</Text>
            <ListTodo size={14} color={DS_COLORS.TEXT_MUTED} />
            <Text style={s.metaText}>{taskCount} {taskCount === 1 ? "goal" : "goals"}</Text>
            {(participantsCount ?? 0) > 0 && (
              <>
                <Text style={s.metaDot}>·</Text>
                <Users size={14} color={DS_COLORS.TEXT_MUTED} />
                <Text style={s.metaText}>{formatCount(participantsCount)} members</Text>
              </>
            )}
          </View>
          <Text style={s.joinLink}>Join ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ChallengeCardFeatured = React.memo(ChallengeCardFeaturedInner);

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
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
    padding: 16,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eyebrowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eyebrowFeatured: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  eyebrow24h: {
    backgroundColor: DS_COLORS.ICON_BG_BLUE,
  },
  eyebrow24hText: {
    color: DS_COLORS.CATEGORY_MIND_STRIPE,
  },
  eyebrowFeaturedText: {
    color: DS_COLORS.ACCENT_PRIMARY,
  },
  eyebrowSpacer: { width: 0 },
  eyebrowText: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 1,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  diffText: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  title: {
    fontSize: 20,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 8,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: DS_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_PAGE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginRight: 6,
  },
  taskChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS.TEXT_SECONDARY,
    maxWidth: 120,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 12,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.TEXT_MUTED,
  },
  metaDot: {
    fontSize: 13,
    color: DS_COLORS.TEXT_MUTED,
    marginHorizontal: 2,
  },
  joinLink: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.ACCENT_PRIMARY,
  },
});

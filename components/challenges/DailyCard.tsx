import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Trophy, Users2 } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import {
  getCategoryStyle,
  difficultyDescriptive,
  type ChallengeCategory as DailyCardCategory,
  type ChallengeDifficulty as DailyCardDifficulty,
} from "./_card-helpers";

export type { DailyCardCategory, DailyCardDifficulty };

export interface DailyCardData {
  id: string;
  slug: string | null;
  name: string;
  duration_days: number;
  difficulty: DailyCardDifficulty;
  proof_type: "photo" | "text" | "location";
  category: DailyCardCategory;
  /** Number of users who joined this challenge today. Counts below the
   * SOCIAL_PROOF_MIN_THRESHOLD are returned as 0 by the backend so the
   * "Be first today" empty state can render. */
  joinedTodayCount: number;
}

interface DifficultyStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

function getDifficultyStyle(d: DailyCardDifficulty): DifficultyStyle {
  if (d === "EASY") {
    return {
      label: "EASY",
      bg: DS_COLORS.DIFFICULTY_EASY_BG,
      text: DS_COLORS.DIFFICULTY_EASY_TEXT,
      border: DS_COLORS.DIFFICULTY_EASY_TEXT,
    };
  }
  if (d === "HARD") {
    return {
      label: "HARD",
      bg: DS_COLORS.DIFFICULTY_HARD_BG,
      text: DS_COLORS.DIFFICULTY_HARD_TEXT,
      border: DS_COLORS.DIFFICULTY_HARD_TEXT,
    };
  }
  return {
    label: "MED",
    bg: DS_COLORS.DIFFICULTY_MEDIUM_BG,
    text: DS_COLORS.DIFFICULTY_MEDIUM_TEXT,
    border: DS_COLORS.DIFFICULTY_MEDIUM_TEXT,
  };
}

export interface DailyCardProps {
  data: DailyCardData;
}

export const DailyCard = React.memo(function DailyCard({ data }: DailyCardProps) {
  const router = useRouter();
  const cat = getCategoryStyle(data.category);
  const diff = getDifficultyStyle(data.difficulty);
  const CatIcon = cat.Icon;

  const hasJoiners = data.joinedTodayCount > 0;
  const metaLine = hasJoiners
    ? `${data.joinedTodayCount} today`
    : "Be first today";
  const a11yMeta = hasJoiners
    ? `${data.joinedTodayCount} doing this today`
    : "be first today";
  const a11y = `${data.name}, ${difficultyDescriptive(data.difficulty)}, ${a11yMeta}, tap to view`;

  const target = (data.slug ?? data.id).trim() || data.id;
  const handlePress = () => {
    if (!target) return;
    router.push(ROUTES.CHALLENGE_ID(target) as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.card, { borderLeftColor: diff.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconTile, { backgroundColor: cat.tint }]}>
          <CatIcon size={18} color={cat.iconColor} strokeWidth={2} />
        </View>
        <View style={[styles.diffPill, { backgroundColor: diff.bg }]}>
          <Text style={[styles.diffText, { color: diff.text }]}>{diff.label}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {data.name}
      </Text>
      <View style={styles.metaRow}>
        {hasJoiners ? (
          <Users2 size={10} color={DS_COLORS.TEXT_SECONDARY} strokeWidth={2} />
        ) : (
          <Trophy size={10} color={DS_COLORS.ACCENT} strokeWidth={2} />
        )}
        <Text
          style={[
            styles.metaText,
            !hasJoiners && { color: DS_COLORS.ACCENT },
          ]}
          numberOfLines={1}
        >
          {metaLine}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.md,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderTopColor: DS_COLORS.BORDER,
    borderRightColor: DS_COLORS.BORDER,
    borderBottomColor: DS_COLORS.BORDER,
    minHeight: 124,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DS_SPACING.md,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  diffPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DS_RADIUS.SM,
  },
  diffText: {
    fontSize: 10,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: DS_SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
});

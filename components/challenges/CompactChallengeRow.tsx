import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import {
  getCategoryStyle,
  difficultyDescriptive,
  dayUnit,
  type ChallengeCategory as CompactChallengeCategory,
  type ChallengeDifficulty as CompactChallengeDifficulty,
} from "./_card-helpers";

export type { CompactChallengeCategory, CompactChallengeDifficulty };
export type CompactChallengeProofType = "photo" | "text" | "location";

export interface CompactChallengeRowData {
  id: string;
  slug: string | null;
  name: string;
  duration_days: number;
  difficulty: CompactChallengeDifficulty;
  proof_type: CompactChallengeProofType;
  category: CompactChallengeCategory;
}

export interface CompactChallengeRowProps {
  data: CompactChallengeRowData;
}

function proofTypeLabel(p: CompactChallengeProofType): string {
  if (p === "photo") return "Photo proof";
  if (p === "location") return "Location proof";
  return "Text proof";
}

export const CompactChallengeRow = React.memo(function CompactChallengeRow({
  data,
}: CompactChallengeRowProps) {
  const router = useRouter();
  const cat = getCategoryStyle(data.category);
  const CatIcon = cat.Icon;
  const metaLine = `${data.duration_days} ${dayUnit(data.duration_days)} · ${difficultyDescriptive(
    data.difficulty
  )} · ${proofTypeLabel(data.proof_type)}`;
  const a11y = `${data.name}, ${data.duration_days} ${dayUnit(
    data.duration_days
  )}, ${difficultyDescriptive(data.difficulty)}, ${proofTypeLabel(data.proof_type).toLowerCase()}, tap to view`;

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
      style={styles.row}
    >
      <View style={[styles.iconTile, { backgroundColor: cat.tint }]}>
        <CatIcon size={18} color={cat.iconColor} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {data.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {metaLine}
        </Text>
      </View>
      <ChevronRight size={18} color={DS_COLORS.TEXT_MUTED} strokeWidth={2} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  meta: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});
